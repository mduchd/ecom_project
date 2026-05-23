package com.ecommerce.backend.config;

import com.ecommerce.backend.entity.ERole;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.RoleRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class AdminBootstrapInitializer {

    @Value("${app.admin.bootstrap.username:admin@snapcart.local}")
    private String bootstrapAdminUsername;

    @Value("${app.admin.bootstrap.email:admin@snapcart.local}")
    private String bootstrapAdminEmail;

    @Value("${app.admin.bootstrap.password:Admin@123456}")
    private String bootstrapAdminPassword;

    @Value("${app.admin.bootstrap.full-name:Quan tri he thong}")
    private String bootstrapAdminFullName;

    @Bean
    CommandLineRunner initFixedAdminUser(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(null, ERole.ROLE_ADMIN)));

            userRepository.findByUsername(bootstrapAdminUsername).ifPresentOrElse(existingAdmin -> {
                boolean changed = false;

                if (!existingAdmin.isEnabled()) {
                    existingAdmin.setEnabled(true);
                    changed = true;
                }

                if (existingAdmin.getRoles() == null) {
                    existingAdmin.setRoles(new HashSet<>());
                }

                boolean hasAdminRole = existingAdmin.getRoles().stream()
                        .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
                if (!hasAdminRole) {
                    existingAdmin.getRoles().add(adminRole);
                    changed = true;
                }

                if (changed) {
                    userRepository.save(existingAdmin);
                    System.out.println("Updated fixed admin account: " + bootstrapAdminUsername);
                }
            }, () -> {
                if (userRepository.existsByEmail(bootstrapAdminEmail)) {
                    System.out.println("Skip fixed admin creation: email already exists -> " + bootstrapAdminEmail);
                    return;
                }

                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);

                User adminUser = User.builder()
                        .username(bootstrapAdminUsername)
                        .email(bootstrapAdminEmail)
                        .password(passwordEncoder.encode(bootstrapAdminPassword))
                        .fullName(bootstrapAdminFullName)
                        .provider("local")
                        .enabled(true)
                        .roles(roles)
                        .build();

                userRepository.save(adminUser);
                System.out.println("Created fixed admin account: " + bootstrapAdminUsername);
            });
        };
    }
}
