package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.dto.OrderTrackingResponse;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.exception.OrderTrackingNotFoundException;
import com.ecommerce.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

    @Test
    void trackOrderReturnsMaskedEmailAndTimeline() {
        Order order = Order.builder()
                .orderCode("SPC2605241830123")
                .customerName("Nguyen Van A")
                .customerEmail("buyer@example.com")
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
}
