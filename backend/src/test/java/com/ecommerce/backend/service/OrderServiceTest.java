package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateOrderItemRequest;
import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.dto.OrderTrackingResponse;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.exception.OrderTrackingNotFoundException;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTest {
    private OrderRepository orderRepository;
    private OrderItemRepository orderItemRepository;
    private com.ecommerce.backend.repository.UserRepository userRepository;
    private ProductRepository productRepository;
    private LoyaltyService loyaltyService;
    private MemberTierService memberTierService;
    private EmailService emailService;
    private OrderService orderService;
    private Map<Long, Product> productsById;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        orderItemRepository = Mockito.mock(OrderItemRepository.class);
        userRepository = Mockito.mock(com.ecommerce.backend.repository.UserRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        loyaltyService = Mockito.mock(LoyaltyService.class);
        memberTierService = Mockito.mock(MemberTierService.class);
        emailService = Mockito.mock(EmailService.class);
        productsById = new HashMap<>();
        when(productRepository.findAllById(Mockito.any())).thenAnswer(invocation -> {
            Iterable<Long> ids = invocation.getArgument(0);
            return java.util.stream.StreamSupport.stream(ids.spliterator(), false)
                    .map(productsById::get)
                    .filter(java.util.Objects::nonNull)
                    .toList();
        });
        orderService = new OrderService(
                orderRepository,
                orderItemRepository,
                userRepository,
                productRepository,
                loyaltyService,
                memberTierService,
                emailService
        );
    }

    private CreateOrderRequest buildRequest(String paymentMethod, int pointsToRedeem) {
        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Nguyen Van A");
        request.setCustomerEmail("a@example.com");
        request.setItems(List.of(item));
        request.setPaymentMethod(paymentMethod);
        request.setPointsToRedeem(pointsToRedeem);
        return request;
    }

    private void mockProduct(long id, String name, BigDecimal price, int stock) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setPrice(price);
        product.setStockQuantity(stock);
        productsById.put(id, product);
        when(productRepository.findById(id)).thenReturn(Optional.of(product));
    }

    private void mockPersistedOrderSave() {
        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order.getId() == null) {
                order.setId(1L);
            }
            return order;
        });
    }

    @Test
    void createOrderSuccess() {
        mockProduct(1L, "Laptop Asus", new BigDecimal("1500"), 10);
        mockPersistedOrderSave();

        Order created = orderService.create(buildRequest("COD", 0), null);

        assertNotNull(created);
        assertEquals("Nguyen Van A", created.getCustomerName());
        assertEquals("a@example.com", created.getCustomerEmail());
        assertEquals("Laptop Asus x1", created.getProductSummary());
        assertEquals(new BigDecimal("31500"), created.getTotalAmount());
        assertEquals(new BigDecimal("1500"), created.getMembershipSpendAmount());
        assertEquals("COD", created.getPaymentMethod());
        assertEquals("Chờ duyệt", created.getStatus());
        assertNotNull(created.getOrderCode());
    }

    @Test
    void createOrderPersistsContactAndShipping() {
        mockProduct(1L, "Laptop Asus", new BigDecimal("1500"), 10);
        mockPersistedOrderSave();

        CreateOrderRequest request = buildRequest("COD", 0);
        request.setCustomerPhone("0901234567");
        request.setShippingAddress("123 Nguyen Trai, Ho Chi Minh, 700000");

        Order created = orderService.create(request, null);

        assertEquals("0901234567", created.getCustomerPhone());
        assertEquals("123 Nguyen Trai, Ho Chi Minh, 700000", created.getShippingAddress());
    }

    @Test
    void createOrderNormalizesBlankContactAndShippingToNull() {
        mockProduct(1L, "Laptop Asus", new BigDecimal("1500"), 10);
        mockPersistedOrderSave();

        CreateOrderRequest request = buildRequest("COD", 0);
        request.setCustomerPhone("   ");
        request.setShippingAddress("");

        Order created = orderService.create(request, null);

        assertEquals(null, created.getCustomerPhone());
        assertEquals(null, created.getShippingAddress());
    }

    @Test
    void createOrderRedeemsPointsAfterOrderPersisted() {
        mockProduct(1L, "Laptop Asus", new BigDecimal("200000"), 10);
        mockPersistedOrderSave();

        com.ecommerce.backend.entity.User user = com.ecommerce.backend.entity.User.builder()
                .id(9L)
                .username("customer")
                .email("a@example.com")
                .pointsBalance(100)
                .build();

        when(userRepository.findById(9L)).thenReturn(Optional.of(user));
        when(loyaltyService.redeemPoints(Mockito.eq(user), Mockito.any(Order.class), Mockito.eq(20), Mockito.eq(new BigDecimal("200000"))))
                .thenReturn(new BigDecimal("20000.00"));

        Order created = orderService.create(buildRequest("COD", 20), 9L);

        assertEquals(user, created.getUser());
        assertEquals(20, created.getPointsRedeemed());
        assertEquals(new BigDecimal("20000.00"), created.getPointsDiscount());
        assertEquals(new BigDecimal("210000.00"), created.getTotalAmount());
        verify(loyaltyService).redeemPoints(Mockito.eq(user), Mockito.argThat(order -> order.getId() != null), Mockito.eq(20), Mockito.eq(new BigDecimal("200000")));
    }

    @Test
    void createOrderBatchLoadsProductsForAllItems() {
        CreateOrderItemRequest firstItem = new CreateOrderItemRequest();
        firstItem.setProductId(1L);
        firstItem.setQuantity(2);

        CreateOrderItemRequest secondItem = new CreateOrderItemRequest();
        secondItem.setProductId(2L);
        secondItem.setQuantity(1);

        CreateOrderRequest request = buildRequest("COD", 0);
        request.setItems(List.of(firstItem, secondItem));

        Product firstProduct = new Product();
        firstProduct.setId(1L);
        firstProduct.setName("Laptop Asus");
        firstProduct.setPrice(new BigDecimal("200000"));
        firstProduct.setStockQuantity(10);

        Product secondProduct = new Product();
        secondProduct.setId(2L);
        secondProduct.setName("Mouse Logitech");
        secondProduct.setPrice(new BigDecimal("100000"));
        secondProduct.setStockQuantity(5);

        productsById.put(1L, firstProduct);
        productsById.put(2L, secondProduct);
        mockPersistedOrderSave();

        Order created = orderService.create(request, null);

        assertEquals("Laptop Asus x2, Mouse Logitech x1", created.getProductSummary());
        assertEquals(new BigDecimal("500000"), created.getTotalAmount());
        verify(productRepository).findAllById(Mockito.argThat(ids ->
                java.util.stream.StreamSupport.stream(ids.spliterator(), false).toList().equals(List.of(1L, 2L))
        ));
        Mockito.verify(productRepository, Mockito.never()).findById(Mockito.anyLong());
    }

    @Test
    void markPaidUpdatesStatusToPaid() {
        Order order = Order.builder()
                .id(1L)
                .orderCode("SPC123456")
                .status("Chờ duyệt")
                .build();

        when(orderRepository.findByOrderCode("SPC123456")).thenReturn(Optional.of(order));
        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order updated = orderService.markPaidByOrderCode("SPC123456");

        assertNotNull(updated);
        assertEquals("Đã thanh toán", updated.getStatus());
        verify(orderRepository, Mockito.atLeastOnce()).save(argThat(savedOrder ->
                "Đã thanh toán".equals(savedOrder.getStatus())
        ));
    }

    @Test
    void trackOrderReturnsMaskedEmailAndTimeline() {
        Order order = Order.builder()
                .orderCode("SPC2605241830123")
                .customerName("Nguyen Van A")
                .customerEmail("buyer@example.com")
                .customerPhone("0901234567")
                .shippingAddress("123 Nguyen Trai, Ho Chi Minh")
                .productSummary("Laptop Asus x1")
                .totalAmount(new BigDecimal("1500000"))
                .paymentMethod("COD")
                .status("Đang giao")
                .createdAt(LocalDateTime.of(2026, 5, 24, 18, 30))
                .build();

        when(orderRepository.findByOrderCodeIgnoreCaseAndCustomerEmailIgnoreCase("SPC2605241830123", "buyer@example.com"))
                .thenReturn(Optional.of(order));

        OrderTrackingResponse response = orderService.track("SPC2605241830123", "buyer@example.com");

        assertEquals("SPC2605241830123", response.getOrderCode());
        assertEquals("b***r@example.com", response.getCustomerEmail());
        assertEquals("0901234567", response.getCustomerPhone());
        assertEquals("123 Nguyen Trai, Ho Chi Minh", response.getShippingAddress());
        assertEquals("SHIPPING", response.getStatus());
        assertEquals("Đang giao", response.getStatusLabel());
        assertEquals("CURRENT", response.getSteps().get(2).getState());
    }

    @Test
    void trackOrderMasksTwoCharacterLocalPartWithoutLastCharacter() {
        Order order = Order.builder()
                .orderCode("SPC2605241830124")
                .customerEmail("ab@example.com")
                .productSummary("Laptop Asus x1")
                .totalAmount(new BigDecimal("1500000"))
                .paymentMethod("COD")
                .status("Chờ duyệt")
                .createdAt(LocalDateTime.of(2026, 5, 24, 18, 30))
                .build();

        when(orderRepository.findByOrderCodeIgnoreCaseAndCustomerEmailIgnoreCase("SPC2605241830124", "ab@example.com"))
                .thenReturn(Optional.of(order));

        OrderTrackingResponse response = orderService.track("SPC2605241830124", "ab@example.com");

        assertEquals("a***@example.com", response.getCustomerEmail());
    }

    @Test
    void trackOrderRejectsWrongEmailWithGenericNotFound() {
        when(orderRepository.findByOrderCodeIgnoreCaseAndCustomerEmailIgnoreCase("SPC404", "wrong@example.com"))
                .thenReturn(Optional.empty());

        OrderTrackingNotFoundException ex = assertThrows(OrderTrackingNotFoundException.class, () -> orderService.track("SPC404", "wrong@example.com"));

        assertEquals("Không tìm thấy đơn hàng với thông tin đã cung cấp.", ex.getMessage());
    }

    @Test
    void trackOrderDeliveredTimelineMarksDeliveredStepAsCurrent() {
        Order order = Order.builder()
                .orderCode("SPC2605241830999")
                .customerEmail("buyer@example.com")
                .productSummary("Laptop Asus x1")
                .totalAmount(new BigDecimal("1500000"))
                .paymentMethod("COD")
                .status("Đã giao")
                .createdAt(LocalDateTime.of(2026, 5, 24, 18, 30))
                .build();

        when(orderRepository.findByOrderCodeIgnoreCaseAndCustomerEmailIgnoreCase("SPC2605241830999", "buyer@example.com"))
                .thenReturn(Optional.of(order));

        OrderTrackingResponse response = orderService.track("SPC2605241830999", "buyer@example.com");

        assertEquals("DELIVERED", response.getStatus());
        assertEquals("DONE", response.getSteps().get(2).getState());
        assertEquals("CURRENT", response.getSteps().get(3).getState());
    }

    @Test
    void updateStatusToDeliveredCreditsPointsOnce() {
        Order order = Order.builder()
                .id(1L)
                .orderCode("SPC260524001")
                .status("Đang giao")
                .totalAmount(new BigDecimal("200000"))
                .pointsCredited(false)
                .pointsRedeemed(0)
                .build();

        when(orderRepository.findByIdWithUser(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order updated = orderService.updateStatus(1L, "Đã giao");

        assertEquals("Đã giao", updated.getStatus());
        verify(loyaltyService).creditEarnedPoints(order);
        verify(memberTierService).creditDeliveredSpend(order);
    }

    @Test
    void updateStatusToCanceledRefundsAndReversesPoints() {
        Order order = Order.builder()
                .id(1L)
                .orderCode("SPC260524001")
                .status("Đã giao")
                .totalAmount(new BigDecimal("200000"))
                .pointsRedeemed(20)
                .pointsEarned(18)
                .pointsCredited(true)
                .build();

        when(orderRepository.findByIdWithUser(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        orderService.updateStatus(1L, "Đã hủy");

        verify(loyaltyService).refundRedeemedPoints(order);
        verify(memberTierService).reverseDeliveredSpend(order);
        verify(loyaltyService).reverseEarnedPoints(order);
    }

    @Test
    void cancelPendingOrderByOwnerRefundsRedeemedPoints() {
        com.ecommerce.backend.entity.User user = com.ecommerce.backend.entity.User.builder()
                .id(2L)
                .email("a@example.com")
                .pointsBalance(80)
                .build();
        Order order = Order.builder()
                .id(3L)
                .orderCode("SPC260524001")
                .customerEmail("a@example.com")
                .status("Chờ duyệt")
                .paymentMethod("COD")
                .pointsRedeemed(20)
                .user(user)
                .build();

        when(orderRepository.findByOrderCodeWithUser("SPC260524001")).thenReturn(Optional.of(order));
        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order canceled = orderService.cancelPending("SPC260524001", null, 2L);

        assertEquals("Đã hủy", canceled.getStatus());
        verify(loyaltyService).refundRedeemedPoints(order);
    }

    @Test
    void cancelPendingOrderByGuestTokenForOnlinePayment() {
        Order order = Order.builder()
                .id(4L)
                .orderCode("SPC260524002")
                .status("Chờ duyệt")
                .paymentMethod("MOMO")
                .cancelToken("token-abc")
                .cancelTokenExpiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        when(orderRepository.findByOrderCodeWithUser("SPC260524002")).thenReturn(Optional.of(order));
        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order canceled = orderService.cancelPending("SPC260524002", "token-abc", null);

        assertEquals("Đã hủy", canceled.getStatus());
    }

    @Test
    void cancelPendingOrderRejectsCodeAndEmailOnly() {
        Order order = Order.builder()
                .id(5L)
                .orderCode("SPC260524003")
                .customerEmail("a@example.com")
                .status("Chờ duyệt")
                .paymentMethod("MOMO")
                .build();

        when(orderRepository.findByOrderCodeWithUser("SPC260524003")).thenReturn(Optional.of(order));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.cancelPending("SPC260524003", null, null)
        );

        assertEquals("Không có quyền hủy đơn hàng này.", ex.getMessage());
    }
}
