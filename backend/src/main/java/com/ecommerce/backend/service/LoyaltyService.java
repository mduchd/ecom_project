package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.PagedResponse;
import com.ecommerce.backend.entity.LoyaltySetting;
import com.ecommerce.backend.entity.MemberTier;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.PointTransaction;
import com.ecommerce.backend.entity.PointTransactionType;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.LoyaltySettingRepository;
import com.ecommerce.backend.repository.PointTransactionRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.util.PageFetch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoyaltyService {
    private static final Long SETTING_ID = 1L;

    private final UserRepository userRepository;
    private final PointTransactionRepository transactionRepository;
    private final LoyaltySettingRepository settingRepository;
    private final MemberTierService memberTierService;

    public LoyaltyService(UserRepository userRepository,
                          PointTransactionRepository transactionRepository,
                          LoyaltySettingRepository settingRepository,
                          MemberTierService memberTierService) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.settingRepository = settingRepository;
        this.memberTierService = memberTierService;
    }

    @Transactional(readOnly = true)
    public LoyaltySetting getSetting() {
        return settingRepository.findById(SETTING_ID)
                .orElseGet(LoyaltySetting::defaultSetting);
    }

    @Transactional
    public LoyaltySetting saveSetting(LoyaltySetting setting) {
        validateSetting(setting);
        setting.setId(SETTING_ID);
        return settingRepository.save(setting);
    }

    private void validateSetting(LoyaltySetting setting) {
        if (setting.getEarnAmountPerPoint() == null || setting.getEarnAmountPerPoint().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền để nhận 1 điểm phải lớn hơn 0.");
        }
        if (setting.getPointValue() == null || setting.getPointValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị 1 điểm phải lớn hơn 0.");
        }
        if (setting.getMaxRedeemPercent() == null || setting.getMaxRedeemPercent() < 1 || setting.getMaxRedeemPercent() > 100) {
            throw new IllegalArgumentException("Giới hạn giảm tối đa phải từ 1% đến 100%.");
        }
        if (setting.getExpiryMonths() == null || setting.getExpiryMonths() < 1) {
            throw new IllegalArgumentException("Thời hạn điểm phải ít nhất 1 tháng.");
        }
    }

    private int currentBalance(User user) {
        return user.getPointsBalance() == null ? 0 : user.getPointsBalance();
    }

    private BigDecimal resolveEarnBaseAmount(Order order) {
        BigDecimal payable = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
        BigDecimal pointsDiscount = order.getPointsDiscount() == null ? BigDecimal.ZERO : order.getPointsDiscount();
        return payable.add(pointsDiscount);
    }

    @Transactional
    public BigDecimal redeemPoints(User user, Order order, int requestedPoints, BigDecimal orderAmountBeforePoints) {
        if (requestedPoints <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        LoyaltySetting setting = getSetting();
        if (!setting.isEnabled()) {
            throw new IllegalArgumentException("Chương trình điểm tích lũy đang tạm tắt.");
        }
        if (user == null) {
            throw new IllegalArgumentException("Vui lòng đăng nhập để sử dụng điểm tích lũy.");
        }
        if (user.isPointsLocked()) {
            throw new IllegalArgumentException("Tài khoản của bạn đang bị khóa sử dụng điểm.");
        }
        if (requestedPoints > currentBalance(user)) {
            throw new IllegalArgumentException("Số điểm sử dụng vượt quá số dư hiện có.");
        }

        BigDecimal discount = setting.getPointValue()
                .multiply(BigDecimal.valueOf(requestedPoints))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal maxDiscount = orderAmountBeforePoints
                .multiply(BigDecimal.valueOf(setting.getMaxRedeemPercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN);
        if (discount.compareTo(maxDiscount) > 0) {
            throw new IllegalArgumentException("Số điểm sử dụng vượt quá giới hạn giảm giá cho đơn hàng này.");
        }

        user.setPointsBalance(currentBalance(user) - requestedPoints);
        transactionRepository.save(PointTransaction.builder()
                .user(user)
                .order(order)
                .type(PointTransactionType.REDEEM)
                .points(-requestedPoints)
                .reason("Dùng điểm tích lũy để giảm giá đơn hàng")
                .build());
        userRepository.save(user);
        return discount;
    }

    @Transactional
    public int creditEarnedPoints(Order order) {
        if (order == null || order.getUser() == null || order.isPointsCredited()) {
            return 0;
        }
        LoyaltySetting setting = getSetting();
        if (!setting.isEnabled()) {
            return 0;
        }
        int basePoints = resolveEarnBaseAmount(order)
                .divide(setting.getEarnAmountPerPoint(), 0, RoundingMode.DOWN)
                .intValue();
        if (basePoints <= 0) {
            return 0;
        }
        User user = order.getUser();
        MemberTier tier = memberTierService.resolveTier(user);
        int points = (int) Math.floor(basePoints * tier.getPointsMultiplier());
        if (points <= 0) {
            return 0;
        }
        user.setPointsBalance(currentBalance(user) + points);
        order.setPointsEarned(points);
        order.setPointsCredited(true);
        transactionRepository.save(PointTransaction.builder()
                .user(user)
                .order(order)
                .type(PointTransactionType.EARN)
                .points(points)
                .reason("Cộng điểm từ đơn hàng " + order.getOrderCode() + " (hạng " + tier.getLabel() + " x" + tier.getPointsMultiplier() + ")")
                .expiresAt(LocalDateTime.now().plusMonths(setting.getExpiryMonths()))
                .build());
        userRepository.save(user);
        return points;
    }

    @Transactional
    public void refundRedeemedPoints(Order order) {
        if (order == null || order.getUser() == null || order.isRedeemedPointsRefunded() || order.getPointsRedeemed() <= 0) {
            return;
        }
        User user = order.getUser();
        user.setPointsBalance(currentBalance(user) + order.getPointsRedeemed());
        order.setRedeemedPointsRefunded(true);
        transactionRepository.save(PointTransaction.builder()
                .user(user)
                .order(order)
                .type(PointTransactionType.REFUND)
                .points(order.getPointsRedeemed())
                .reason("Hoàn điểm đã dùng do đơn hàng bị hủy")
                .build());
        userRepository.save(user);
    }

    @Transactional
    public void reverseEarnedPoints(Order order) {
        if (order == null || order.getUser() == null || order.isEarnedPointsReversed() || order.getPointsEarned() <= 0) {
            return;
        }
        User user = order.getUser();
        user.setPointsBalance(Math.max(0, currentBalance(user) - order.getPointsEarned()));
        order.setEarnedPointsReversed(true);
        transactionRepository.save(PointTransaction.builder()
                .user(user)
                .order(order)
                .type(PointTransactionType.REVERSAL)
                .points(-order.getPointsEarned())
                .reason("Thu hồi điểm đã cộng do đơn hàng bị hủy hoặc hoàn")
                .build());
        userRepository.save(user);
    }

    @Transactional
    public PointTransaction adjustPoints(Long userId, boolean increase, int points, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));
        int signedPoints = increase ? points : -points;
        int newBalance = currentBalance(user) + signedPoints;
        if (newBalance < 0) {
            throw new IllegalArgumentException("Không thể trừ quá số điểm hiện có của khách hàng.");
        }
        user.setPointsBalance(newBalance);
        PointTransaction transaction = PointTransaction.builder()
                .user(user)
                .type(PointTransactionType.ADMIN_ADJUST)
                .points(signedPoints)
                .reason(reason.trim())
                .build();
        userRepository.save(user);
        return transactionRepository.save(transaction);
    }

    @Transactional
    public User setPointsLocked(Long userId, boolean locked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));
        user.setPointsLocked(locked);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<PointTransaction> getTransactions() {
        return getRecentTransactions(200);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PointTransaction> getTransactionsPage(int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(safePage - 1, safeSize);
        Page<PointTransaction> result = transactionRepository.findRecentWithUserAndOrder(pageable);
        result = PageFetch.clampRequestedPage(
                result,
                safePage,
                transactionRepository::findRecentWithUserAndOrder
        );
        return PagedResponse.from(result, safePage);
    }

    @Transactional(readOnly = true)
    public List<PointTransaction> getRecentTransactions(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 500));
        return transactionRepository.findRecentWithUserAndOrderList(PageRequest.of(0, safeLimit));
    }

    @Transactional(readOnly = true)
    public Long sumPointsByType(PointTransactionType type) {
        return transactionRepository.sumPointsByType(type);
    }

    @Transactional(readOnly = true)
    public Long sumAbsolutePointsByType(PointTransactionType type) {
        return transactionRepository.sumAbsolutePointsByType(type);
    }
}
