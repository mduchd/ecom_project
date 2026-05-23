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
import com.ecommerce.backend.dto.SignupRequest;
import com.ecommerce.backend.dto.MessageResponse;
import com.ecommerce.backend.entity.OtpVerification;
import com.ecommerce.backend.repository.OtpVerificationRepository;
import com.ecommerce.backend.service.EmailService;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

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

    @Autowired
    OtpVerificationRepository otpVerificationRepository;

    @Autowired
    EmailService emailService;

    @Value("${app.auth.fail-on-email-error:false}")
    private boolean failOnEmailError;

    @Value("${app.auth.expose-otp-on-email-failure:true}")
    private boolean exposeOtpOnEmailFailure;

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
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
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

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            Optional<User> existingUserOpt = userRepository.findByUsername(signUpRequest.getUsername());
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                if (existingUser.isEnabled()) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Tên đăng nhập đã tồn tại!"));
                } else {
                    otpVerificationRepository.deleteByEmailAndType(existingUser.getEmail(), "SIGNUP");
                    userRepository.delete(existingUser);
                }
            }
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            Optional<User> existingUserOpt = userRepository.findByEmail(signUpRequest.getEmail());
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                if (existingUser.isEnabled()) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Email đã được sử dụng!"));
                } else {
                    otpVerificationRepository.deleteByEmailAndType(existingUser.getEmail(), "SIGNUP");
                    userRepository.delete(existingUser);
                }
            }
        }

        // Create new user's account (disabled by default)
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .fullName(signUpRequest.getFullName())
                .provider("local")
                .enabled(false)
                .build();

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();
        if (strRoles != null && strRoles.stream().anyMatch(r -> "admin".equalsIgnoreCase(r))) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không thể tự đăng ký quyền quản trị."));
        }
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        userRepository.save(user);

        // Generate OTP
        Random random = new Random();
        String otp = String.format("%06d", random.nextInt(1000000));
        
        OtpVerification otpVerification = OtpVerification.builder()
                .email(user.getEmail())
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .type("SIGNUP")
                .build();
        
        otpVerificationRepository.save(otpVerification);

        // Send OTP Email with dev fallback
        try {
            emailService.sendOtpEmail(user.getEmail(), otp, "SIGNUP");
            return ResponseEntity.ok(new MessageResponse("Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP."));
        } catch (RuntimeException ex) {
            if (failOnEmailError) {
                throw ex;
            }
            logger.warn("OTP email send failed for signup: {}", user.getEmail(), ex);
            String message = exposeOtpOnEmailFailure
                    ? "Đăng ký thành công. Dịch vụ email tạm thời lỗi, OTP của bạn là: " + otp
                    : "Đăng ký thành công. Dịch vụ email tạm thời lỗi, vui lòng liên hệ hỗ trợ để lấy OTP.";
            return ResponseEntity.ok(new MessageResponse(message));
        }
    }

    @PostMapping("/verify-otp")
    @Transactional
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp, @RequestParam(defaultValue = "SIGNUP") String type) {
        Optional<OtpVerification> otpOpt = otpVerificationRepository.findByEmailAndOtpAndType(email, otp, type);
        
        if (otpOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: OTP hoặc email không đúng!"));
        }

        OtpVerification otpVerification = otpOpt.get();
        if (otpVerification.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpVerificationRepository.delete(otpVerification);
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: OTP đã hết hạn! Vui lòng yêu cầu mã mới."));
        }

        // Activate user
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Không tìm thấy người dùng!"));
        }

        User user = userOpt.get();
        user.setEnabled(true);
        userRepository.save(user);

        // Delete OTP
        otpVerificationRepository.delete(otpVerification);

        return ResponseEntity.ok(new MessageResponse("Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay."));
    }

    @PostMapping("/resend-otp")
    @Transactional
    public ResponseEntity<?> resendOtp(@RequestParam String email, @RequestParam(defaultValue = "SIGNUP") String type) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Email chưa được đăng ký!"));
        }

        User user = userOpt.get();
        if (user.isEnabled()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lỗi: Tài khoản đã được xác thực và đang hoạt động!"));
        }

        // Delete old OTPs for this email and type
        otpVerificationRepository.deleteByEmailAndType(email, type);

        // Generate new OTP
        Random random = new Random();
        String otp = String.format("%06d", random.nextInt(1000000));

        OtpVerification otpVerification = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .type(type)
                .build();

        otpVerificationRepository.save(otpVerification);

        // Send Email with dev fallback
        try {
            emailService.sendOtpEmail(email, otp, type);
            return ResponseEntity.ok(new MessageResponse("Đã gửi mã OTP mới đến email của bạn."));
        } catch (RuntimeException ex) {
            if (failOnEmailError) {
                throw ex;
            }
            logger.warn("OTP email resend failed for {}", email, ex);
            String message = exposeOtpOnEmailFailure
                    ? "Dịch vụ email tạm thời lỗi, OTP mới của bạn là: " + otp
                    : "Dịch vụ email tạm thời lỗi, vui lòng liên hệ hỗ trợ để lấy OTP.";
            return ResponseEntity.ok(new MessageResponse(message));
        }
    }
}
