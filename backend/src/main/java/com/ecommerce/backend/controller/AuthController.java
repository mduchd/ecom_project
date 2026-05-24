package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.ERole;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.payload.request.LoginRequest;
import com.ecommerce.backend.payload.request.TokenRequest;
import com.ecommerce.backend.payload.response.JwtResponse;
import com.ecommerce.backend.repository.RoleRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.security.JwtUtils;
import com.ecommerce.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody TokenRequest tokenRequest) {
        // Trong thực tế, bro nên dùng thư viện google-api-client để verify id_token
        // Ở đây mình demo flow xử lý logic User
        
        // Giả sử mình đã có thông tin từ Google sau khi verify
        // Mình sẽ gọi API Google để lấy info từ access_token hoặc id_token
        final String uri = "https://oauth2.googleapis.com/tokeninfo?id_token=" + tokenRequest.getToken();
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> payload = restTemplate.getForObject(uri, Map.class);

        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String googleId = (String) payload.get("sub");
        String picture = (String) payload.get("picture");

        User user;
        if (userRepository.existsByEmail(email)) {
            user = userRepository.findByEmail(email).get();
        } else {
            user = new User();
            user.setEmail(email);
            user.setUsername(email); // Dùng email làm username
            user.setFullName(name);
            user.setAvatar(picture);
            user.setProvider("google");
            user.setProviderId(googleId);
            
            Set<Role> roles = new HashSet<>();
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy vai trò người dùng."));
            roles.add(userRole);
            user.setRoles(roles);
            userRepository.save(user);
        }

        // Tạo Authentication giả lập cho Spring Security
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }
}
