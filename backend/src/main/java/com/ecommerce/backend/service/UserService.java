package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.UserProfileRequest;
import com.ecommerce.backend.dto.UserProfileResponse;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));
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
                roles,
                user.getPointsBalance(),
                user.isPointsLocked());
    }
}
