# Order And User API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend APIs for placing orders, calculating shipping, applying coupon codes, and managing customer profile data.

**Architecture:** Follow the current Spring Boot style: thin `@RestController` classes, business logic in `@Service` classes, repositories extending `JpaRepository`, Lombok-backed entities/DTOs, and JWT identity from `UserDetailsImpl`. Keep coupon rules in `OrderService` for this iteration because the project does not yet have admin coupon management or database migration tooling.

**Tech Stack:** Java 17, Spring Boot 3.2.4, Spring Web, Spring Security JWT, Spring Data JPA, MySQL/H2 through Hibernate `ddl-auto=update`, JUnit 5, Spring Boot Test, React/Vite/Axios.

---

## Current Code Survey

Backend currently exposes only:

- `POST /api/auth/signin` and `POST /api/auth/google` in `backend/src/main/java/com/ecommerce/backend/controller/AuthController.java`.
- Product CRUD under `/api/products` in `backend/src/main/java/com/ecommerce/backend/controller/ProductController.java`.
- AI chat under `/api/ai` in `backend/src/main/java/com/ecommerce/backend/controller/AIChatController.java`.

Backend currently has no `OrderController`, `OrderService`, `OrderRepository`, `Order` entity, `Coupon` entity, `UserController`, or `/api/users` route.

Frontend currently has client-only order behavior:

- Cart coupon codes are hardcoded in `frontend/src/pages/Cart.jsx`: `SAVE10`, `FLAT50`, `TECH20`.
- Shipping is calculated on the client: free when subtotal is at least `399`, otherwise `29`.
- Orders are stored in `localStorage` through `frontend/src/context/AuthContext.jsx`.
- `frontend/src/pages/OrderManagement.jsx` is an empty file.

## Product Decisions

- Keep the current frontend money rules for this pass: free shipping threshold `399`, shipping fee `29`, coupons `SAVE10`, `FLAT50`, `TECH20`. The seeded backend product prices look VND-like while the frontend displays `$`; currency cleanup is outside this feature.
- Backend always re-reads product prices by `productId`. The client never submits trusted totals or unit prices.
- Coupon definitions live in `OrderService` until admin coupon CRUD is requested.
- Customer-owned APIs use `@AuthenticationPrincipal UserDetailsImpl`; clients never pass `userId`.
- Add simple profile fields to `User`: `phoneNumber`, `address`, `city`, `postalCode`. A multi-address book is outside this feature.

## API Spec

### Order Quote

`POST /api/orders/quote`

Requires JWT.

Request:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "couponCode": "SAVE10"
}
```

Response:

```json
{
  "items": [
    {
      "productId": 1,
      "productName": "Laptop ASUS ROG Strix G16 Gaming",
      "unitPrice": 32990000,
      "quantity": 2,
      "lineTotal": 65980000
    }
  ],
  "subtotal": 65980000,
  "shippingFee": 0,
  "discount": 6598000,
  "total": 59382000,
  "couponCode": "SAVE10"
}
```

Rules:

- Empty item list returns HTTP 400.
- Quantity must be at least `1`.
- Product not found returns HTTP 400 or 404 using the project's current simple exception style.
- Coupon code is case-insensitive.
- Unknown coupon returns HTTP 400.
- Shipping is `0` when subtotal is at least `399`; otherwise `29`.
- `SAVE10` gives 10% off subtotal.
- `TECH20` gives 20% off subtotal.
- `FLAT50` subtracts `50`, capped so discount never exceeds subtotal.

### Place Order

`POST /api/orders`

Requires JWT.

Request:

```json
{
  "items": [
    { "productId": 1, "quantity": 1 }
  ],
  "couponCode": "FLAT50",
  "receiverName": "Nguyen Van A",
  "phoneNumber": "0909123456",
  "shippingAddress": "12 Nguyen Hue",
  "city": "TP.HCM",
  "postalCode": "700000",
  "paymentMethod": "COD"
}
```

Rules:

- Creates `Order` and `OrderItem` rows.
- Decrements `Product.stockQuantity`.
- Rejects order when requested quantity exceeds stock.
- Initial status is `PENDING`.
- Allowed payment methods: `COD`, `MOMO`, `BANK`.

### Customer Orders

`GET /api/orders/my`

Requires JWT. Returns the authenticated user's orders newest first.

### Admin Orders

`GET /api/orders`

Requires `ROLE_ADMIN`. Returns all orders newest first.

`PUT /api/orders/{id}/status`

Requires `ROLE_ADMIN`.

Request:

```json
{
  "status": "SHIPPED"
}
```

Allowed statuses: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

### User Profile

`GET /api/users/me`

Requires JWT.

`PUT /api/users/me`

Requires JWT.

Request:

```json
{
  "fullName": "Nguyen Van A",
  "avatar": "https://example.com/avatar.png",
  "phoneNumber": "0909123456",
  "address": "12 Nguyen Hue",
  "city": "TP.HCM",
  "postalCode": "700000"
}
```

Rules:

- Email and username are read-only in this pass.
- Role, provider, providerId, and password are not writable through profile APIs.

## File Structure

Create:

- `backend/src/main/java/com/ecommerce/backend/entity/Order.java`
- `backend/src/main/java/com/ecommerce/backend/entity/OrderItem.java`
- `backend/src/main/java/com/ecommerce/backend/entity/OrderStatus.java`
- `backend/src/main/java/com/ecommerce/backend/entity/PaymentMethod.java`
- `backend/src/main/java/com/ecommerce/backend/repository/OrderRepository.java`
- `backend/src/main/java/com/ecommerce/backend/dto/OrderItemRequest.java`
- `backend/src/main/java/com/ecommerce/backend/dto/OrderCreateRequest.java`
- `backend/src/main/java/com/ecommerce/backend/dto/OrderQuoteRequest.java`
- `backend/src/main/java/com/ecommerce/backend/dto/OrderStatusUpdateRequest.java`
- `backend/src/main/java/com/ecommerce/backend/dto/OrderItemResponse.java`
- `backend/src/main/java/com/ecommerce/backend/dto/OrderResponse.java`
- `backend/src/main/java/com/ecommerce/backend/dto/UserProfileRequest.java`
- `backend/src/main/java/com/ecommerce/backend/dto/UserProfileResponse.java`
- `backend/src/main/java/com/ecommerce/backend/service/OrderService.java`
- `backend/src/main/java/com/ecommerce/backend/service/UserService.java`
- `backend/src/main/java/com/ecommerce/backend/controller/OrderController.java`
- `backend/src/main/java/com/ecommerce/backend/controller/UserController.java`
- `backend/src/test/java/com/ecommerce/backend/service/OrderServiceTest.java`
- `backend/src/test/java/com/ecommerce/backend/service/UserServiceTest.java`
- `frontend/src/services/orderService.js`
- `frontend/src/services/userService.js`

Modify:

- `backend/src/main/java/com/ecommerce/backend/entity/User.java`
- `backend/src/main/java/com/ecommerce/backend/security/WebSecurityConfig.java`
- `frontend/src/services/productService.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/pages/Cart.jsx`
- `frontend/src/pages/ThanhToan.jsx`
- `frontend/src/pages/OrderManagement.jsx`

---

### Task 1: Order Totals Domain

**Files:**

- Create: `backend/src/main/java/com/ecommerce/backend/entity/OrderStatus.java`
- Create: `backend/src/main/java/com/ecommerce/backend/entity/PaymentMethod.java`
- Create: `backend/src/main/java/com/ecommerce/backend/entity/Order.java`
- Create: `backend/src/main/java/com/ecommerce/backend/entity/OrderItem.java`
- Create: `backend/src/main/java/com/ecommerce/backend/repository/OrderRepository.java`
- Create: order DTOs listed above
- Create: `backend/src/main/java/com/ecommerce/backend/service/OrderService.java`
- Test: `backend/src/test/java/com/ecommerce/backend/service/OrderServiceTest.java`

- [ ] **Step 1: Write failing quote tests**

Create `backend/src/test/java/com/ecommerce/backend/service/OrderServiceTest.java`:

```java
package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.OrderItemRequest;
import com.ecommerce.backend.dto.OrderQuoteRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.entity.Product;
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
        assertEquals(new BigDecimal("900"), quote.getTotal());
        assertEquals("SAVE10", quote.getCouponCode());
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
}
```

- [ ] **Step 2: Run the failing test**

Run:

```powershell
cd backend
.\mvnw.cmd test -Dtest=OrderServiceTest
```

Expected: compilation fails because order classes do not exist.

- [ ] **Step 3: Add enums, entities, repository, DTOs, and `OrderService.quote`**

Use the file structure above. The important service rules are:

```java
private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("399");
private static final BigDecimal SHIPPING_FEE = new BigDecimal("29");

private BigDecimal calculateDiscount(BigDecimal subtotal, String couponCode) {
    if (couponCode == null || couponCode.trim().isEmpty()) return BigDecimal.ZERO;
    String normalized = couponCode.trim().toUpperCase();
    BigDecimal discount = switch (normalized) {
        case "SAVE10" -> subtotal.multiply(new BigDecimal("0.10"));
        case "TECH20" -> subtotal.multiply(new BigDecimal("0.20"));
        case "FLAT50" -> new BigDecimal("50");
        default -> throw new IllegalArgumentException("Invalid coupon code: " + normalized);
    };
    return discount.compareTo(subtotal) > 0 ? subtotal : discount.setScale(0, RoundingMode.HALF_UP);
}
```

`OrderResponse` should expose line items, subtotal, shippingFee, discount, total, and normalized couponCode.

- [ ] **Step 4: Run quote tests**

Run:

```powershell
cd backend
.\mvnw.cmd test -Dtest=OrderServiceTest
```

Expected: quote tests pass.

- [ ] **Step 5: Commit**

```powershell
git add backend/src/main/java/com/ecommerce/backend/entity backend/src/main/java/com/ecommerce/backend/repository/OrderRepository.java backend/src/main/java/com/ecommerce/backend/dto backend/src/main/java/com/ecommerce/backend/service/OrderService.java backend/src/test/java/com/ecommerce/backend/service/OrderServiceTest.java
git commit -m "feat: add order totals domain"
```

### Task 2: Place Order And Stock Updates

**Files:**

- Modify: `backend/src/main/java/com/ecommerce/backend/service/OrderService.java`
- Test: `backend/src/test/java/com/ecommerce/backend/service/OrderServiceTest.java`

- [ ] **Step 1: Add failing create-order tests**

Append to `OrderServiceTest`:

```java
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
```

Add imports:

```java
import com.ecommerce.backend.dto.OrderCreateRequest;
import com.ecommerce.backend.entity.OrderStatus;
import com.ecommerce.backend.entity.PaymentMethod;
import com.ecommerce.backend.entity.User;
```

- [ ] **Step 2: Run tests**

Run:

```powershell
cd backend
.\mvnw.cmd test -Dtest=OrderServiceTest
```

Expected: compilation fails until `createOrder` is implemented.

- [ ] **Step 3: Implement `OrderService.createOrder`**

Add a `@Transactional` method that:

```java
User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
OrderResponse quote = quote(toQuoteRequest(request));
Order order = new Order();
order.setUser(user);
order.setStatus(OrderStatus.PENDING);
order.setPaymentMethod(request.getPaymentMethod());
order.setReceiverName(request.getReceiverName());
order.setPhoneNumber(request.getPhoneNumber());
order.setShippingAddress(request.getShippingAddress());
order.setCity(request.getCity());
order.setPostalCode(request.getPostalCode());
order.setCouponCode(quote.getCouponCode());
order.setSubtotal(quote.getSubtotal());
order.setShippingFee(quote.getShippingFee());
order.setDiscount(quote.getDiscount());
order.setTotal(quote.getTotal());
```

For each item:

```java
Product product = productRepository.findById(itemRequest.getProductId())
        .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemRequest.getProductId()));
if (product.getStockQuantity() == null || product.getStockQuantity() < itemRequest.getQuantity()) {
    throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
}
product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
```

Map saved `Order` to `OrderResponse` in a private `toResponse(Order order)` method.

- [ ] **Step 4: Run tests**

Run:

```powershell
cd backend
.\mvnw.cmd test -Dtest=OrderServiceTest
```

Expected: all order service tests pass.

- [ ] **Step 5: Commit**

```powershell
git add backend/src/main/java/com/ecommerce/backend/service/OrderService.java backend/src/test/java/com/ecommerce/backend/service/OrderServiceTest.java
git commit -m "feat: create orders from cart items"
```

### Task 3: Order REST API And Security

**Files:**

- Create: `backend/src/main/java/com/ecommerce/backend/controller/OrderController.java`
- Modify: `backend/src/main/java/com/ecommerce/backend/service/OrderService.java`
- Modify: `backend/src/main/java/com/ecommerce/backend/security/WebSecurityConfig.java`

- [ ] **Step 1: Add listing and status service methods**

Add to `OrderService`:

```java
public List<OrderResponse> getOrdersForUser(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
    return orderRepository.findByUserOrderByCreatedAtDesc(user).stream().map(this::toResponse).toList();
}

public List<OrderResponse> getAllOrders() {
    return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
}

@Transactional
public OrderResponse updateStatus(Long orderId, OrderStatus status) {
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
    order.setStatus(status);
    return toResponse(orderRepository.save(order));
}
```

- [ ] **Step 2: Add order controller**

Create `backend/src/main/java/com/ecommerce/backend/controller/OrderController.java`:

```java
package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.OrderCreateRequest;
import com.ecommerce.backend.dto.OrderQuoteRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.dto.OrderStatusUpdateRequest;
import com.ecommerce.backend.security.services.UserDetailsImpl;
import com.ecommerce.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/quote")
    public ResponseEntity<OrderResponse> quote(@Valid @RequestBody OrderQuoteRequest request) {
        return ResponseEntity.ok(orderService.quote(request));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                     @Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.ok(orderService.createOrder(userDetails.getId(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getOrdersForUser(userDetails.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request.getStatus()));
    }
}
```

- [ ] **Step 3: Protect order and user routes**

Modify `WebSecurityConfig`:

```java
.requestMatchers("/api/orders/**").authenticated()
.requestMatchers("/api/users/**").authenticated()
```

Keep existing public matchers for auth, AI, H2, and products.

- [ ] **Step 4: Run backend tests**

Run:

```powershell
cd backend
.\mvnw.cmd test
```

Expected: Spring context and service tests pass.

- [ ] **Step 5: Commit**

```powershell
git add backend/src/main/java/com/ecommerce/backend/controller/OrderController.java backend/src/main/java/com/ecommerce/backend/service/OrderService.java backend/src/main/java/com/ecommerce/backend/security/WebSecurityConfig.java
git commit -m "feat: expose order api"
```

### Task 4: User Profile API

**Files:**

- Modify: `backend/src/main/java/com/ecommerce/backend/entity/User.java`
- Create: `backend/src/main/java/com/ecommerce/backend/dto/UserProfileRequest.java`
- Create: `backend/src/main/java/com/ecommerce/backend/dto/UserProfileResponse.java`
- Create: `backend/src/main/java/com/ecommerce/backend/service/UserService.java`
- Create: `backend/src/main/java/com/ecommerce/backend/controller/UserController.java`
- Test: `backend/src/test/java/com/ecommerce/backend/service/UserServiceTest.java`

- [ ] **Step 1: Write failing user service tests**

Create `backend/src/test/java/com/ecommerce/backend/service/UserServiceTest.java`:

```java
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
}
```

- [ ] **Step 2: Add fields to `User`**

Add after `avatar` in `backend/src/main/java/com/ecommerce/backend/entity/User.java`:

```java
private String phoneNumber;

@Column(columnDefinition = "TEXT")
private String address;

private String city;
private String postalCode;
```

- [ ] **Step 3: Add DTOs and service**

Create `UserProfileRequest`, `UserProfileResponse`, and `UserService`. The service maps `User` to `UserProfileResponse` and only mutates:

```java
user.setFullName(request.getFullName());
user.setAvatar(request.getAvatar());
user.setPhoneNumber(request.getPhoneNumber());
user.setAddress(request.getAddress());
user.setCity(request.getCity());
user.setPostalCode(request.getPostalCode());
```

- [ ] **Step 4: Add controller**

Create `backend/src/main/java/com/ecommerce/backend/controller/UserController.java`:

```java
package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.UserProfileRequest;
import com.ecommerce.backend.dto.UserProfileResponse;
import com.ecommerce.backend.security.services.UserDetailsImpl;
import com.ecommerce.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMe(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                        @RequestBody UserProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }
}
```

- [ ] **Step 5: Run backend tests**

Run:

```powershell
cd backend
.\mvnw.cmd test
```

Expected: context, order service, and user service tests pass.

- [ ] **Step 6: Commit**

```powershell
git add backend/src/main/java/com/ecommerce/backend/entity/User.java backend/src/main/java/com/ecommerce/backend/dto/UserProfileRequest.java backend/src/main/java/com/ecommerce/backend/dto/UserProfileResponse.java backend/src/main/java/com/ecommerce/backend/service/UserService.java backend/src/main/java/com/ecommerce/backend/controller/UserController.java backend/src/test/java/com/ecommerce/backend/service/UserServiceTest.java
git commit -m "feat: add user profile api"
```

### Task 5: Frontend API Wiring

**Files:**

- Modify: `frontend/src/services/productService.js`
- Create: `frontend/src/services/orderService.js`
- Create: `frontend/src/services/userService.js`
- Modify: `frontend/src/context/AuthContext.jsx`
- Modify: `frontend/src/pages/ThanhToan.jsx`
- Modify: `frontend/src/pages/OrderManagement.jsx`

- [ ] **Step 1: Attach JWT token to API calls**

Modify `frontend/src/services/productService.js`:

```js
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("snapcart_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);
```

- [ ] **Step 2: Add order service**

Create `frontend/src/services/orderService.js`:

```js
import api from "./productService";

export const quoteOrder = async (items, couponCode = "") => {
    const response = await api.post("/orders/quote", { items, couponCode });
    return response.data;
};

export const createOrder = async (payload) => {
    const response = await api.post("/orders", payload);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get("/orders/my");
    return response.data;
};

export const getAllOrders = async () => {
    const response = await api.get("/orders");
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
};
```

- [ ] **Step 3: Add user service**

Create `frontend/src/services/userService.js`:

```js
import api from "./productService";

export const getMyProfile = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

export const updateMyProfile = async (profile) => {
    const response = await api.put("/users/me", profile);
    return response.data;
};
```

- [ ] **Step 4: Replace local checkout order creation**

In `frontend/src/pages/ThanhToan.jsx`, import `createOrder` and make `handlePlaceOrder` call the backend with:

```js
const payload = {
  items: cart.map((item) => ({
    productId: item.id,
    quantity: item.qty,
  })),
  receiverName: "Khách hàng mới",
  phoneNumber: "",
  shippingAddress: "",
  city: "",
  postalCode: "",
  paymentMethod: selectedMethod === "cod" ? "COD" : selectedMethod === "momo" ? "MOMO" : "BANK",
};
```

On success, clear cart and navigate like the existing UI does. On API error, show `toast.error(error.response?.data?.message || "Không thể đặt hàng.")`.

- [ ] **Step 5: Implement admin order page**

Replace empty `frontend/src/pages/OrderManagement.jsx` with a table using `getAllOrders()` and `updateOrderStatus(id, status)`. Use the existing admin table style: white surface, small text rows, status `<select>`, and no unrelated layout refactor.

- [ ] **Step 6: Run frontend build**

Run:

```powershell
cd frontend
npm run build
```

Expected: Vite build completes without import or JSX errors.

- [ ] **Step 7: Commit**

```powershell
git add frontend/src/services/productService.js frontend/src/services/orderService.js frontend/src/services/userService.js frontend/src/context/AuthContext.jsx frontend/src/pages/ThanhToan.jsx frontend/src/pages/OrderManagement.jsx
git commit -m "feat: wire order and profile APIs in frontend"
```

## Verification Checklist

- `cd backend; .\mvnw.cmd test`
- `cd frontend; npm run build`
- Call `POST /api/orders/quote` with `SAVE10`, `FLAT50`, `TECH20`, and an invalid coupon.
- Place an order through `/checkout` and confirm rows exist in `orders` and `order_items`.
- Confirm product stock decreases after order creation.
- Call `GET /api/orders/my` and confirm only the current user's orders are returned.
- Call `GET /api/users/me`, then `PUT /api/users/me`, then `GET /api/users/me` and confirm updated profile fields persist.
- Confirm non-admin users receive 403 for `GET /api/orders` and `PUT /api/orders/{id}/status`.

## Self-Review

- Spec coverage: Order creation, shipping calculation, coupon application, customer order listing, admin status update, and user profile management are covered.
- Placeholder scan: The plan avoids unspecified classes and keeps names consistent across DTOs, services, controllers, and frontend services.
- Type consistency: DTO names, enum names, route paths, and method names are consistent throughout the plan.

Plan complete and saved to `docs/superpowers/plans/2026-05-18-order-user-api.md`. Two execution options:

**1. Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.
