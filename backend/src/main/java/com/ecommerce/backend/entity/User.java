package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;

    private String avatar;

    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;

    private String postalCode;

    @Column(nullable = true)
    private String password;

    private String provider; // "local" or "google"
    private String providerId;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @Column(nullable = false)
    @Builder.Default
    private Integer pointsBalance = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean pointsLocked = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(nullable = false, precision = 14, scale = 2, columnDefinition = "DECIMAL(14,2) DEFAULT 0")
    @Builder.Default
    private BigDecimal deliveredSpend = BigDecimal.ZERO;
}
