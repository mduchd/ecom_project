package com.ecommerce.backend.exception;

public class OrderTrackingNotFoundException extends RuntimeException {
    public OrderTrackingNotFoundException(String message) {
        super(message);
    }
}
