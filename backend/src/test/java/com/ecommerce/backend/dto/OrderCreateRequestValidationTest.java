package com.ecommerce.backend.dto;

import com.ecommerce.backend.entity.PaymentMethod;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderCreateRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsBlankRequiredShippingFieldsBeforePersistence() {
        OrderCreateRequest request = new OrderCreateRequest();
        request.setItems(List.of(new OrderItemRequest(1L, 1)));
        request.setPaymentMethod(PaymentMethod.COD);
        request.setReceiverName(" ");
        request.setPhoneNumber("");
        request.setShippingAddress(null);

        Set<String> invalidFields = validator.validate(request).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());

        assertTrue(invalidFields.contains("receiverName"));
        assertTrue(invalidFields.contains("phoneNumber"));
        assertTrue(invalidFields.contains("shippingAddress"));
    }

    @Test
    void createOrderRequestAllowsBlankOptionalContactAndShippingFields() {
        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(1);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCustomerName("Nguyen Van A");
        request.setCustomerEmail("a@example.com");
        request.setCustomerPhone(" ");
        request.setShippingAddress("");
        request.setItems(List.of(item));
        request.setPaymentMethod("COD");

        Set<String> invalidFields = validator.validate(request).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());

        assertFalse(invalidFields.contains("customerPhone"));
        assertFalse(invalidFields.contains("shippingAddress"));
    }
}
