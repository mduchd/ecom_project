package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.MemberTierSyncResponse;
import com.ecommerce.backend.entity.MemberTier;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class MemberTierService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("399000");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public MemberTierService(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public MemberTier resolveTier(User user) {
        return MemberTier.fromSpend(currentDeliveredSpend(user));
    }

    public BigDecimal currentDeliveredSpend(User user) {
        if (user == null || user.getDeliveredSpend() == null) {
            return BigDecimal.ZERO;
        }
        return user.getDeliveredSpend();
    }

    BigDecimal resolveOrderSpendAmount(Order order) {
        BigDecimal snapshot = order.getMembershipSpendAmount();
        if (snapshot != null && snapshot.compareTo(BigDecimal.ZERO) > 0) {
            return snapshot;
        }
        return inferLegacyMembershipSpend(order);
    }

    private BigDecimal inferLegacyMembershipSpend(Order order) {
        BigDecimal payable = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
        BigDecimal pointsDiscount = order.getPointsDiscount() == null ? BigDecimal.ZERO : order.getPointsDiscount();
        BigDecimal prePointsTotal = payable.add(pointsDiscount);
        if (prePointsTotal.compareTo(FREE_SHIPPING_THRESHOLD) < 0) {
            if (prePointsTotal.compareTo(SHIPPING_FEE) > 0) {
                return prePointsTotal.subtract(SHIPPING_FEE);
            }
            return prePointsTotal.max(BigDecimal.ZERO);
        }
        BigDecimal ambiguousMax = FREE_SHIPPING_THRESHOLD.add(SHIPPING_FEE).subtract(BigDecimal.ONE);
        if (prePointsTotal.compareTo(ambiguousMax) <= 0) {
            return prePointsTotal.subtract(SHIPPING_FEE).max(BigDecimal.ZERO);
        }
        return prePointsTotal;
    }

    @Transactional
    public void creditDeliveredSpend(Order order) {
        if (order == null || order.getUser() == null || order.isMembershipSpendCredited()) {
            return;
        }
        User user = order.getUser();
        BigDecimal amount = resolveOrderSpendAmount(order);
        if (order.getMembershipSpendAmount() == null || order.getMembershipSpendAmount().compareTo(BigDecimal.ZERO) == 0) {
            order.setMembershipSpendAmount(amount);
        }
        user.setDeliveredSpend(currentDeliveredSpend(user).add(amount));
        order.setMembershipSpendCredited(true);
        userRepository.save(user);
    }

    @Transactional
    public void reverseDeliveredSpend(Order order) {
        if (order == null || order.getUser() == null || order.isMembershipSpendReversed() || !order.isMembershipSpendCredited()) {
            return;
        }
        User user = order.getUser();
        BigDecimal amount = resolveOrderSpendAmount(order);
        BigDecimal updated = currentDeliveredSpend(user).subtract(amount);
        user.setDeliveredSpend(updated.max(BigDecimal.ZERO));
        order.setMembershipSpendReversed(true);
        userRepository.save(user);
    }

    @Transactional
    public BigDecimal syncUserDeliveredSpend(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với id: " + userId));
        return syncUserOrders(user).totalSpend();
    }

    @Transactional
    public MemberTierSyncResponse syncAllUsersDeliveredSpend() {
        List<User> users = userRepository.findAll();
        int ordersUpdated = 0;
        for (User user : users) {
            ordersUpdated += syncUserOrders(user).ordersProcessed();
        }
        return new MemberTierSyncResponse(users.size(), ordersUpdated);
    }

    private SyncUserResult syncUserOrders(User user) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        BigDecimal total = BigDecimal.ZERO;
        for (Order order : orders) {
            if (isDeliveredStatus(order.getStatus())) {
                BigDecimal amount = resolveOrderSpendAmount(order);
                if (order.getMembershipSpendAmount() == null || order.getMembershipSpendAmount().compareTo(BigDecimal.ZERO) == 0) {
                    order.setMembershipSpendAmount(amount);
                }
                total = total.add(amount);
                order.setMembershipSpendCredited(true);
                order.setMembershipSpendReversed(false);
            } else {
                order.setMembershipSpendCredited(false);
                order.setMembershipSpendReversed(false);
            }
        }
        orderRepository.saveAll(orders);
        user.setDeliveredSpend(total);
        userRepository.save(user);
        return new SyncUserResult(total, orders.size());
    }

    private boolean isDeliveredStatus(String status) {
        if (status == null) {
            return false;
        }
        String text = status.trim().toLowerCase(Locale.ROOT);
        return text.equals("delivered") || text.contains("da giao") || text.contains("đã giao");
    }

    private record SyncUserResult(BigDecimal totalSpend, int ordersProcessed) {}
}
