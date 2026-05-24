package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ChangePasswordRequest;
import com.ecommerce.backend.dto.UserProfileRequest;
import com.ecommerce.backend.dto.UserProfileResponse;
import com.ecommerce.backend.entity.ERole;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.PointTransaction;
import com.ecommerce.backend.entity.PointTransactionType;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.PointTransactionRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceTest {
    private UserRepository userRepository;
    private OrderRepository orderRepository;
    private PointTransactionRepository pointTransactionRepository;
    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        orderRepository = Mockito.mock(OrderRepository.class);
        pointTransactionRepository = Mockito.mock(PointTransactionRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        userService = new UserService(userRepository, orderRepository, pointTransactionRepository, passwordEncoder);
    }

    @Test
    void updateProfileChangesOnlyProfileFields() {
        User user = User.builder().id(1L).username("customer").email("customer@example.com").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileRequest request = new UserProfileRequest();
        request.setFullName("New Name");
        request.setAvatar("avatar.png");
        request.setPhoneNumber("0909000000");
        request.setAddress("99 Le Loi");
        request.setCity("Ha Noi");
        request.setPostalCode("100000");

        UserProfileResponse response = userService.updateProfile(1L, request);

        assertEquals("customer@example.com", response.getEmail());
        assertEquals("New Name", response.getFullName());
        assertEquals("99 Le Loi", response.getAddress());
    }

    @Test
    void updateProfileIgnoresNullFields() {
        User user = User.builder()
                .id(1L)
                .username("customer")
                .email("customer@example.com")
                .fullName("Existing Name")
                .phoneNumber("0909111111")
                .address("Old Address")
                .city("Da Nang")
                .postalCode("550000")
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileRequest request = new UserProfileRequest();
        request.setCity("Ha Noi");

        UserProfileResponse response = userService.updateProfile(1L, request);

        assertEquals("Existing Name", response.getFullName());
        assertEquals("0909111111", response.getPhoneNumber());
        assertEquals("Old Address", response.getAddress());
        assertEquals("Ha Noi", response.getCity());
        assertEquals("550000", response.getPostalCode());
    }

    @Test
    void getProfileIncludesLoyaltyPointFields() {
        User user = User.builder()
                .id(1L)
                .username("customer")
                .email("customer@example.com")
                .pointsBalance(88)
                .pointsLocked(true)
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserProfileResponse response = userService.getProfile(1L);

        assertEquals(88, response.getPointsBalance());
        assertEquals(true, response.isPointsLocked());
        assertEquals("local", response.getProvider());
    }

    @Test
    void getMyOrdersReturnsOnlyOrdersForUser() {
        Order order = Order.builder()
                .id(10L)
                .orderCode("SPC260525001")
                .customerName("Nguyen Van A")
                .customerEmail("customer@example.com")
                .productSummary("Laptop x1")
                .totalAmount(new BigDecimal("12000000"))
                .paymentMethod("COD")
                .status("Cho duyet")
                .createdAt(LocalDateTime.of(2026, 5, 25, 10, 0))
                .build();
        when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(order));

        var result = userService.getMyOrders(1L);

        assertEquals(1, result.size());
        assertEquals("SPC260525001", result.get(0).getOrderCode());
        verify(orderRepository).findByUserIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void getMyPointTransactionsReturnsOnlyTransactionsForUser() {
        User user = User.builder().id(1L).username("customer").email("customer@example.com").build();
        PointTransaction transaction = PointTransaction.builder()
                .id(20L)
                .user(user)
                .type(PointTransactionType.EARN)
                .points(12)
                .reason("Cong diem tu don hang SPC260525001")
                .createdAt(LocalDateTime.of(2026, 5, 25, 11, 0))
                .build();
        when(pointTransactionRepository.findByUserIdWithOrderOrderByCreatedAtDesc(1L)).thenReturn(List.of(transaction));

        var result = userService.getMyPointTransactions(1L);

        assertEquals(1, result.size());
        assertEquals(12, result.get(0).getPoints());
        assertEquals("customer@example.com", result.get(0).getCustomerEmail());
        verify(pointTransactionRepository).findByUserIdWithOrderOrderByCreatedAtDesc(1L);
    }

    @Test
    void changePasswordRejectsGoogleAccounts() {
        User user = User.builder()
                .id(1L)
                .username("googleuser")
                .email("google@example.com")
                .provider("google")
                .build();
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old-password");
        request.setNewPassword("new-password-123");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> userService.changePassword(1L, request));

        assertEquals("Tài khoản Google không sử dụng mật khẩu cục bộ.", error.getMessage());
    }

    @Test
    void changePasswordRejectsWrongCurrentPassword() {
        User user = User.builder()
                .id(1L)
                .username("customer")
                .email("customer@example.com")
                .provider("local")
                .password("encoded-old")
                .build();
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrong-password");
        request.setNewPassword("new-password-123");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-old")).thenReturn(false);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> userService.changePassword(1L, request));

        assertEquals("Mật khẩu hiện tại không đúng.", error.getMessage());
    }

    @Test
    void changePasswordEncodesAndSavesNewPassword() {
        User user = User.builder()
                .id(1L)
                .username("customer")
                .email("customer@example.com")
                .provider("local")
                .password("encoded-old")
                .build();
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("old-password");
        request.setNewPassword("new-password-123");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-password", "encoded-old")).thenReturn(true);
        when(passwordEncoder.encode("new-password-123")).thenReturn("encoded-new");

        userService.changePassword(1L, request);

        assertEquals("encoded-new", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void setEnabledBlocksDisablingLastAdmin() {
        Role adminRole = Role.builder().name(ERole.ROLE_ADMIN).build();
        User admin = User.builder()
                .id(1L)
                .username("admin")
                .email("admin@example.com")
                .enabled(true)
                .roles(Set.of(adminRole))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRepository.countEnabledAdmins(ERole.ROLE_ADMIN)).thenReturn(1L);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> userService.setEnabled(1L, false)
        );

        assertEquals("Không thể khóa tài khoản quản trị cuối cùng.", error.getMessage());
    }
}
