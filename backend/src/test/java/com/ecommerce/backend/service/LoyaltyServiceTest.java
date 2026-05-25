package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.LoyaltySetting;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.PointTransaction;
import com.ecommerce.backend.entity.PointTransactionType;
import com.ecommerce.backend.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class LoyaltyServiceTest {
    private MemberTierService memberTierService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        memberTierService = org.mockito.Mockito.mock(MemberTierService.class);
        org.mockito.Mockito.when(memberTierService.resolveTier(org.mockito.Mockito.any()))
                .thenReturn(com.ecommerce.backend.entity.MemberTier.BRONZE);
    }

    @Test
    void loyaltyEntitiesHaveExpectedDefaults() {
        User user = User.builder()
                .id(1L)
                .username("customer")
                .email("customer@example.com")
                .build();

        LoyaltySetting setting = LoyaltySetting.defaultSetting();
        PointTransaction transaction = PointTransaction.builder()
                .user(user)
                .type(PointTransactionType.EARN)
                .points(12)
                .reason("Cộng điểm từ đơn hàng SPC260524001")
                .expiresAt(LocalDateTime.of(2027, 5, 24, 0, 0))
                .build();

        assertEquals(0, user.getPointsBalance());
        assertFalse(user.isPointsLocked());
        assertEquals(new BigDecimal("10000.00"), setting.getEarnAmountPerPoint());
        assertEquals(new BigDecimal("1000.00"), setting.getPointValue());
        assertEquals(30, setting.getMaxRedeemPercent());
        assertEquals(12, setting.getExpiryMonths());
        assertEquals(PointTransactionType.EARN, transaction.getType());
        assertEquals(12, transaction.getPoints());
    }

    @Test
    void redeemPointsRejectsMoreThanBalance() {
        var userRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.UserRepository.class);
        var transactionRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.PointTransactionRepository.class);
        var settingRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.LoyaltySettingRepository.class);
        LoyaltyService service = new LoyaltyService(userRepository, transactionRepository, settingRepository, memberTierService);

        User user = User.builder().id(1L).username("customer").email("customer@example.com").pointsBalance(5).build();

        org.mockito.Mockito.when(settingRepository.findById(1L)).thenReturn(java.util.Optional.of(LoyaltySetting.defaultSetting()));

        IllegalArgumentException ex = org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> service.redeemPoints(user, null, 6, new BigDecimal("200000.00"))
        );

        assertEquals("Số điểm sử dụng vượt quá số dư hiện có.", ex.getMessage());
    }

    @Test
    void redeemPointsCapsDiscountBySettingPercent() {
        var userRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.UserRepository.class);
        var transactionRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.PointTransactionRepository.class);
        var settingRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.LoyaltySettingRepository.class);
        LoyaltyService service = new LoyaltyService(userRepository, transactionRepository, settingRepository, memberTierService);

        User user = User.builder().id(1L).username("customer").email("customer@example.com").pointsBalance(100).build();

        org.mockito.Mockito.when(settingRepository.findById(1L)).thenReturn(java.util.Optional.of(LoyaltySetting.defaultSetting()));

        IllegalArgumentException ex = org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> service.redeemPoints(user, null, 80, new BigDecimal("200000.00"))
        );

        assertEquals("Số điểm sử dụng vượt quá giới hạn giảm giá cho đơn hàng này.", ex.getMessage());
    }

    @Test
    void redeemPointsCreatesTransactionAndUpdatesBalance() {
        var userRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.UserRepository.class);
        var transactionRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.PointTransactionRepository.class);
        var settingRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.LoyaltySettingRepository.class);
        LoyaltyService service = new LoyaltyService(userRepository, transactionRepository, settingRepository, memberTierService);

        User user = User.builder().id(1L).username("customer").email("customer@example.com").pointsBalance(100).build();
        org.mockito.Mockito.when(settingRepository.findById(1L)).thenReturn(java.util.Optional.of(LoyaltySetting.defaultSetting()));

        BigDecimal discount = service.redeemPoints(user, null, 20, new BigDecimal("200000.00"));

        assertEquals(new BigDecimal("20000.00"), discount);
        assertEquals(80, user.getPointsBalance());
        org.mockito.Mockito.verify(transactionRepository).save(org.mockito.Mockito.argThat(tx ->
                tx.getType() == PointTransactionType.REDEEM && tx.getPoints() == -20
        ));
    }

    @Test
    void creditEarnedPointsUsesAmountBeforePointsDiscount() {
        var userRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.UserRepository.class);
        var transactionRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.PointTransactionRepository.class);
        var settingRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.LoyaltySettingRepository.class);
        LoyaltyService service = new LoyaltyService(userRepository, transactionRepository, settingRepository, memberTierService);

        User user = User.builder().id(1L).username("customer").email("customer@example.com").pointsBalance(0).build();
        Order order = Order.builder()
                .id(10L)
                .orderCode("SPC260524001")
                .user(user)
                .totalAmount(new BigDecimal("490000.00"))
                .pointsDiscount(new BigDecimal("10000.00"))
                .pointsCredited(false)
                .build();

        org.mockito.Mockito.when(settingRepository.findById(1L)).thenReturn(java.util.Optional.of(LoyaltySetting.defaultSetting()));
        org.mockito.Mockito.when(transactionRepository.save(org.mockito.Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));

        int earned = service.creditEarnedPoints(order);

        assertEquals(50, earned);
        assertEquals(50, order.getPointsEarned());
        assertEquals(50, user.getPointsBalance());
    }

    @Test
    void creditEarnedPointsAppliesTierMultiplier() {
        var userRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.UserRepository.class);
        var transactionRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.PointTransactionRepository.class);
        var settingRepository = org.mockito.Mockito.mock(com.ecommerce.backend.repository.LoyaltySettingRepository.class);
        LoyaltyService service = new LoyaltyService(userRepository, transactionRepository, settingRepository, memberTierService);

        User user = User.builder().id(1L).username("customer").email("customer@example.com").pointsBalance(0).build();
        Order order = Order.builder()
                .id(10L)
                .orderCode("SPC260524002")
                .user(user)
                .totalAmount(new BigDecimal("500000.00"))
                .pointsDiscount(BigDecimal.ZERO)
                .pointsCredited(false)
                .build();

        org.mockito.Mockito.when(settingRepository.findById(1L)).thenReturn(java.util.Optional.of(com.ecommerce.backend.entity.LoyaltySetting.defaultSetting()));
        org.mockito.Mockito.when(memberTierService.resolveTier(user)).thenReturn(com.ecommerce.backend.entity.MemberTier.GOLD);
        org.mockito.Mockito.when(transactionRepository.save(org.mockito.Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));

        int earned = service.creditEarnedPoints(order);

        assertEquals(62, earned);
        assertEquals(62, user.getPointsBalance());
    }
}
