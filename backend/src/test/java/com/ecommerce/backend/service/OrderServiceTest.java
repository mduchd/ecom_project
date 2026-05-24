package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderServiceTest {
    private OrderRepository orderRepository;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        orderService = new OrderService(orderRepository);
    }

    @Test
    void createOrderSuccess() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Nguyen Van A");
        request.setCustomerEmail("a@example.com");
        request.setProductSummary("Laptop Asus x1");
        request.setTotalAmount(new BigDecimal("1500"));
        request.setPaymentMethod("COD");

        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order created = orderService.create(request);

        assertNotNull(created);
        assertEquals("Nguyen Van A", created.getCustomerName());
        assertEquals("a@example.com", created.getCustomerEmail());
        assertEquals("Laptop Asus x1", created.getProductSummary());
        assertEquals(new BigDecimal("1500"), created.getTotalAmount());
        assertEquals("COD", created.getPaymentMethod());
        assertEquals("Chờ duyệt", created.getStatus());
        assertNotNull(created.getOrderCode());
    }

    @Test
    void markPaidUpdatesStatusToShipping() {
        Order order = Order.builder()
                .id(1L)
                .orderCode("SPC123456")
                .status("Chờ duyệt")
                .build();

        when(orderRepository.findByOrderCode("SPC123456")).thenReturn(Optional.of(order));
        when(orderRepository.save(Mockito.any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order updated = orderService.markPaidByOrderCode("SPC123456");

        assertNotNull(updated);
        assertEquals("Đang giao", updated.getStatus());
        verify(orderRepository).save(order);
    }
}
