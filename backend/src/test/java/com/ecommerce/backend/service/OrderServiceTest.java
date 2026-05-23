package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.OrderItemRequest;
import com.ecommerce.backend.dto.OrderCreateRequest;
import com.ecommerce.backend.dto.OrderQuoteRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.entity.OrderStatus;
import com.ecommerce.backend.entity.PaymentMethod;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTest {
    private ProductRepository productRepository;
    private UserRepository userRepository;
    private OrderRepository orderRepository;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        productRepository = Mockito.mock(ProductRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        orderRepository = Mockito.mock(OrderRepository.class);
        orderService = new OrderService(orderRepository, productRepository, userRepository);
    }

    @Test
    void quoteAppliesPercentCouponAndFreeShipping() {
        Product product = new Product(1L, "Laptop", "Desc", new BigDecimal("500"), null, "Laptop", "Brand", 10, "image", "spec");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        OrderQuoteRequest request = new OrderQuoteRequest();
        request.setItems(List.of(new OrderItemRequest(1L, 2)));
        request.setCouponCode("save10");

        OrderResponse quote = orderService.quote(request);

        assertEquals(new BigDecimal("1000"), quote.getSubtotal());
        assertEquals(new BigDecimal("0"), quote.getShippingFee());
        assertEquals(new BigDecimal("100"), quote.getDiscount());
        assertEquals(BigDecimal.ZERO, quote.getTaxAmount());
        assertEquals(new BigDecimal("900"), quote.getTotal());
        assertEquals("SAVE10", quote.getCouponCode());
    }

    @Test
    void quoteCapsFlatCouponBeforeRounding() {
        Product product = new Product(1L, "Mouse", "Desc", new BigDecimal("40"), null, "Accessory", "Brand", 10, "image", "spec");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        OrderQuoteRequest request = new OrderQuoteRequest();
        request.setItems(List.of(new OrderItemRequest(1L, 1)));
        request.setCouponCode("FLAT50");

        OrderResponse quote = orderService.quote(request);

        assertEquals(new BigDecimal("40"), quote.getSubtotal());
        assertEquals(new BigDecimal("40"), quote.getDiscount());
        assertEquals(new BigDecimal("29"), quote.getShippingFee());
        assertEquals(new BigDecimal("29"), quote.getTotal());
    }

    @Test
    void quoteRejectsUnknownCoupon() {
        Product product = new Product(1L, "Mouse", "Desc", new BigDecimal("100"), null, "Accessory", "Brand", 10, "image", "spec");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        OrderQuoteRequest request = new OrderQuoteRequest();
        request.setItems(List.of(new OrderItemRequest(1L, 1)));
        request.setCouponCode("NOPE");

        assertThrows(IllegalArgumentException.class, () -> orderService.quote(request));
    }

    @Test
    void createOrderPersistsOrderAndReducesStock() {
        Product product = new Product(1L, "Laptop", "Desc", new BigDecimal("500"), null, "Laptop", "Brand", 3, "image", "spec");
        User user = User.builder().id(9L).username("buyer").email("buyer@example.com").build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findById(9L)).thenReturn(Optional.of(user));
        when(orderRepository.save(Mockito.any())).thenAnswer(invocation -> invocation.getArgument(0));

        OrderCreateRequest request = new OrderCreateRequest();
        request.setItems(List.of(new OrderItemRequest(1L, 2)));
        request.setPaymentMethod(PaymentMethod.COD);
        request.setReceiverName("Buyer");
        request.setPhoneNumber("0909123456");
        request.setShippingAddress("12 Nguyen Hue");
        request.setCity("TP.HCM");
        request.setPostalCode("700000");

        OrderResponse response = orderService.createOrder(9L, request);

        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertEquals(new BigDecimal("1000"), response.getSubtotal());
        assertEquals(1, product.getStockQuantity());
        verify(productRepository).save(product);
    }

    @Test
    void createOrderRejectsInsufficientStock() {
        Product product = new Product(1L, "Laptop", "Desc", new BigDecimal("500"), null, "Laptop", "Brand", 1, "image", "spec");
        User user = User.builder().id(9L).username("buyer").email("buyer@example.com").build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findById(9L)).thenReturn(Optional.of(user));

        OrderCreateRequest request = new OrderCreateRequest();
        request.setItems(List.of(new OrderItemRequest(1L, 2)));
        request.setPaymentMethod(PaymentMethod.COD);

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(9L, request));
    }
}
