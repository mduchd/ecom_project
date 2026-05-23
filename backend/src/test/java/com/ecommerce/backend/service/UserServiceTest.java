package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.UserProfileRequest;
import com.ecommerce.backend.dto.UserProfileResponse;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class UserServiceTest {
    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        userService = new UserService(userRepository);
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
}
