package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.AdminUserResponse;
import com.ecommerce.backend.dto.AdminUserStatsResponse;
import com.ecommerce.backend.dto.ChangePasswordRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.dto.PagedResponse;
import com.ecommerce.backend.dto.PointTransactionResponse;
import com.ecommerce.backend.dto.UserProfileRequest;
import com.ecommerce.backend.dto.UserProfileResponse;
import com.ecommerce.backend.entity.ERole;
import com.ecommerce.backend.entity.PointTransaction;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.PointTransactionRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.util.PageFetch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       OrderRepository orderRepository,
                       PointTransactionRepository pointTransactionRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.pointTransactionRepository = pointTransactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllForAdmin() {
        return userRepository.findAllByOrderByIdDesc().stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<AdminUserResponse> getAdminPage(int page, int size, String search, String role) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 100));
        String normalizedSearch = search == null ? "" : search.trim();
        String normalizedRole = role == null || role.isBlank() ? "ALL" : role.trim().toUpperCase(Locale.ROOT);
        Pageable pageable = PageRequest.of(safePage - 1, safeSize);
        String searchParam = normalizedSearch.isEmpty() ? null : normalizedSearch;
        Page<User> result = userRepository.findAdminUsers(searchParam, normalizedRole, pageable);
        result = PageFetch.clampRequestedPage(
                result,
                safePage,
                nextPageable -> userRepository.findAdminUsers(searchParam, normalizedRole, nextPageable)
        );
        return PagedResponse.from(result.map(this::toAdminResponse), safePage);
    }

    @Transactional(readOnly = true)
    public AdminUserStatsResponse getAdminStats() {
        long total = userRepository.count();
        return new AdminUserStatsResponse(
                total,
                userRepository.countEnabledUsers(),
                userRepository.countUsersWithRole(ERole.ROLE_ADMIN),
                userRepository.countPointsLockedUsers()
        );
    }

    @Transactional
    public AdminUserResponse setEnabled(Long userId, boolean enabled) {
        User user = getUser(userId);

        if (!enabled && isAdmin(user)) {
            long enabledAdmins = userRepository.countEnabledAdmins(ERole.ROLE_ADMIN);
            if (enabledAdmins <= 1) {
                throw new IllegalArgumentException("Không thể khóa tài khoản quản trị cuối cùng.");
            }
        }

        user.setEnabled(enabled);
        return toAdminResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        return toResponse(getUser(userId));
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserProfileRequest request) {
        User user = getUser(userId);
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getPostalCode() != null) {
            user.setPostalCode(request.getPostalCode());
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PointTransactionResponse> getMyPointTransactions(Long userId) {
        return pointTransactionRepository.findByUserIdWithOrderOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toPointTransactionResponse)
                .toList();
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUser(userId);
        String provider = user.getProvider() == null ? "local" : user.getProvider();
        if (!"local".equalsIgnoreCase(provider)) {
            throw new IllegalArgumentException("Tài khoản Google không sử dụng mật khẩu cục bộ.");
        }
        if (user.getPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));
    }

    private boolean isAdmin(User user) {
        Set<Role> roles = user.getRoles();
        if (roles == null) {
            return false;
        }
        return roles.stream().anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
    }

    private UserProfileResponse toResponse(User user) {
        List<String> roles = user.getRoles() == null
                ? List.of()
                : user.getRoles().stream().map(role -> role.getName().name()).toList();
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatar(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getCity(),
                user.getPostalCode(),
                user.getProvider() == null ? "local" : user.getProvider(),
                roles,
                user.getPointsBalance() == null ? 0 : user.getPointsBalance(),
                user.isPointsLocked());
    }

    private PointTransactionResponse toPointTransactionResponse(PointTransaction transaction) {
        return new PointTransactionResponse(
                transaction.getId(),
                transaction.getUser().getId(),
                transaction.getUser().getEmail(),
                transaction.getOrder() == null ? null : transaction.getOrder().getOrderCode(),
                transaction.getType(),
                transaction.getPoints(),
                transaction.getReason(),
                transaction.getCreatedAt(),
                transaction.getExpiresAt()
        );
    }

    private AdminUserResponse toAdminResponse(User user) {
        List<String> roles = user.getRoles() == null
                ? List.of()
                : user.getRoles().stream().map(role -> role.getName().name()).toList();
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                roles,
                user.getPointsBalance() == null ? 0 : user.getPointsBalance(),
                user.isPointsLocked(),
                user.isEnabled(),
                user.getProvider() == null ? "local" : user.getProvider()
        );
    }
}
