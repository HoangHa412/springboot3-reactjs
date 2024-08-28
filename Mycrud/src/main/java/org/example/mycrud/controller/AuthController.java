package org.example.mycrud.controller;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.http.HttpStatus;
import org.example.mycrud.entity.Role;
import org.example.mycrud.entity.User;
import org.example.mycrud.exception.ErrorCode;
import org.example.mycrud.model.Status;
import org.example.mycrud.model.request.*;
import org.example.mycrud.model.response.BaseResponse;
import org.example.mycrud.model.response.LoginResponse;
import org.example.mycrud.security.UserDetailsImpl;
import org.example.mycrud.service.Impl.MailService;
import org.example.mycrud.service.RoleService;
import org.example.mycrud.service.UserService;
import org.example.mycrud.utils.JwtUtils;
import org.example.mycrud.utils.ServiceUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserService userService;

    @Autowired
    private MailService mailService;

    @Value("${forgetpassword.token.urlVerifyToken}")
    String verifyToken;

    @Value("${forgetpassword.token.expired}")
    private long EXPIRE_MINUTES;

    @Value("${mycrud.jwtRefreshExperition}")
    private int jwtRefreshExprition;

    @Autowired
    private RoleService roleService;

    private static final int PASSWORD_LENGTH = 30;

    @Autowired
    RedisTemplate<String, Object> redisTemplate;


    @PostMapping("/signin")
    public ResponseEntity<?> authenticateAndGetToken(@RequestBody LoginRequest loginRequest) throws UsernameNotFoundException {

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword()
        ));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        List<String> permission = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String accessToken = jwtUtils.generateToken(userDetails, permission);

        String refreshToken = jwtUtils.generateRefreshToken(userDetails);
        redisTemplate.opsForValue().set(refreshToken, true, jwtRefreshExprition, TimeUnit.MINUTES);
        LoginResponse loginResponse = LoginResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
        loginResponse.setCode(0);
        return ResponseEntity.ok().body(loginResponse);
    }

    @PostMapping(value = "/signup")
    public ResponseEntity<?> signUser(@RequestBody SignupRequest signupRequest) {
        if (userService.checkUserName(signupRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.USERNAME_EXISTED.getCode()).message(ErrorCode.USERNAME_EXISTED.getMessage()).build());
        }

        // Validate password
        String password = signupRequest.getPassword();
        if (isValidPassword(password)) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(1).message("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter").build());
        }

        //Create new User account
        User user = new User();
        user.setUserName(signupRequest.getUsername());
        user.setPassword(signupRequest.getPassword());
        Set<Role> roles = new HashSet<>();
        if(signupRequest.getRoles() == null || signupRequest.getRoles().isEmpty()){
            Optional<Role> defaultRole = roleService.getRoleByName("ROLE_ADMIN");
            defaultRole.ifPresent(roles::add);
        }
        user.setRoles(roles);
        user.setStatus(Status.OFFLINE);
        userService.saveUser(user);
        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message("User successfully register").content(user).build());
    }

    @PostMapping("/refreshToken")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {

        Boolean isValid = (Boolean) redisTemplate.opsForValue().get(refreshTokenRequest.getRefreshToken());
        if(isValid == null || !isValid){
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED)
                    .body(BaseResponse.builder().code(ErrorCode.UNAUTHORIZED.getCode()).message(ErrorCode.UNAUTHORIZED.getMessage()).build());
        }

        Integer userIdFromRefreshToken = jwtUtils.getIdFromJwtToken(refreshTokenRequest.getRefreshToken());
        if (userIdFromRefreshToken == null) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.UNAUTHORIZED.getCode()).message(ErrorCode.UNAUTHORIZED.getMessage()).build());
        }

        User account = userService.getByID(userIdFromRefreshToken);
        if (account == null) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.UNAUTHORIZED.getCode()).message(ErrorCode.UNAUTHORIZED.getMessage()).build());
        }


        UserDetailsImpl userDetails = UserDetailsImpl.build(account);

        List<String> perrmissions = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        String accessToken = jwtUtils.generateToken(userDetails, perrmissions);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);
        redisTemplate.opsForValue().set(refreshToken, true, jwtRefreshExprition, TimeUnit.MINUTES);

        LoginResponse loginResponse = LoginResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();
        loginResponse.setCode(0);

        redisTemplate.opsForValue().getAndDelete(refreshTokenRequest.getRefreshToken());

        return ResponseEntity.ok().body(loginResponse);
    }

    @PostMapping("/changePassword")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        User user = userService.getByUsername(changePasswordRequest.getUsername());
        if (!userService.oldPasswordValidity(changePasswordRequest.getOldPassword(), user)) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.INVALID_CREDENTIALS.getCode()).message(ErrorCode.INVALID_CREDENTIALS.getMessage()).build());
        }

        String password = changePasswordRequest.getNewPassword();
        if (isValidPassword(password)) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(1).message("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter").build());
        }


        userService.changePassword(user, changePasswordRequest.getNewPassword());

        return ResponseEntity.ok().body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).build());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        String email = forgotPasswordRequest.getEmail().trim();
        User oUserModel = this.userService.getByEmail(email);

        if (oUserModel == null) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.NOT_FOUND.getCode()).message(ErrorCode.NOT_FOUND.getMessage()).build());
        }

        String sb = String.format("%s:%s", email, System.currentTimeMillis());
        String token = ServiceUtils.generateMD5(sb);

        redisTemplate.opsForValue().set(token, email, EXPIRE_MINUTES, TimeUnit.MINUTES);
        String verifyTokenUrl = this.verifyToken + token;
        Map<String, String> data = new HashMap<>();
        data.put("verifyTokenUrl", verifyTokenUrl);
        data.put("fullName", oUserModel.getFullName());
        data.put("userName", oUserModel.getUserName());

        String title = "Khôi phục mật khẩu tài khoản đăng nhập";
        String footer = "Hệ thống quản lý đối tượng được hỗ trợ sử dụng dịch vụ của Hà đẹp trai siêu cấp Vipro";
        data.put("txtFooter", footer);

        this.mailService.sendResetPasswordHtmlMail(new String[]{oUserModel.getEmail()}, data, title);


        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetToken forgotPasswordRequest) {
        String token = forgotPasswordRequest.getToken();

        String email = (String) redisTemplate.opsForValue().get(token);

        if (email == null) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.NOT_FOUND.getCode()).message(ErrorCode.NOT_FOUND.getMessage()).build());
        }

        User oUserModel = userService.getByEmail(email);
        if (oUserModel == null) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.NOT_FOUND.getCode()).message(ErrorCode.NOT_FOUND.getMessage()).build());
        }

        String password = forgotPasswordRequest.getPassword().trim();
        if (isValidPassword(password)) {
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(1).message("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter").build());
        }

        userService.forgetPassword(email, passwordEncoder.encode(forgotPasswordRequest.getPassword()));
        redisTemplate.delete(token);
        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).build());
    }


    private boolean isValidPassword(@NotNull String password) {
        // Check character length
        if (password.length() < 8) {
            return true;
        }
        // Check character must least one digit
        if (!password.matches(".*\\d.*")) {
            return true;
        }
        // Check character must least one lowercase letter
        if (!password.matches(".*[a-z].*")) {
            return true;
        }
        // Check character must least one uppercase letter
        if (!password.matches(".*[A-Z].*")) {
            return true;
        }
        // Check character must least one special character
        return !password.matches(".*[!@#$%^&*(),.?\":{}|<>].*");
    }
}
