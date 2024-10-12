package org.example.mycrud.controller;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.example.mycrud.entity.Role;
import org.example.mycrud.entity.User;
import org.example.mycrud.exception.CustomException;
import org.example.mycrud.exception.ErrorCode;
import org.example.mycrud.model.Status;
import org.example.mycrud.model.UserDto;
import org.example.mycrud.model.response.BaseResponse;
import org.example.mycrud.service.RoleService;
import org.example.mycrud.service.UserService;
import org.example.mycrud.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.ResponseEntity.ok;

@JsonInclude(JsonInclude.Include.NON_NULL)
@RestController
@RequestMapping("users")
@CrossOrigin("*")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private JwtUtils jwtUtils;


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> index(@Param("name") String name) {
        try{
            List<User> users = userService.getListUser();
//        if (name != null) {
//            users = userService.search(name);
//        }
            List<UserDto> dtoList = new ArrayList<>();
            for (User user : users) {
                UserDto userDto = new UserDto();
                userDto.setId(user.getId());
                userDto.setUsername(user.getUserName());
                userDto.setEmail(user.getEmail());
                userDto.setPhone(user.getPhone());
                userDto.setFullname(user.getFullName());
                userDto.setCreatedAt(user.getCreatedAt());
                userDto.setCreatedBy(user.getCreatedBy());
                userDto.setUpdatedAt(user.getUpdatedAt());
                userDto.setUpdatedBy(user.getUpdatedBy());
                userDto.setStatus(user.getStatus());
                userDto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
                dtoList.add(userDto);
            }

            return ok().body(BaseResponse.builder()
                    .code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).content(dtoList).build());
        }catch (Exception e) {
            throw handlerException(e);
        }
    }

    @PostMapping("/save")
    public ResponseEntity<BaseResponse<User>> saveUser(@RequestBody UserDto userDto, HttpServletRequest request) {
        try{
            BaseResponse<User> response = new BaseResponse<>();
            Integer id = jwtUtils.getUserIdFromJwtToken(request);
            User account = userService.getByID(id);

            if (userDto == null) {
                response.setCode(ErrorCode.REQUIRED_PARAMS.getCode());
                response.setMessage(ErrorCode.REQUIRED_PARAMS.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            if (userDto.getUsername() == null || StringUtils.isBlank(userDto.getUsername())) {
                response.setCode(ErrorCode.REQUIRED_USERNAME.getCode());
                response.setMessage(ErrorCode.REQUIRED_USERNAME.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            if (userDto.getPassword() == null || StringUtils.isBlank(userDto.getPassword())) {
                response.setCode(ErrorCode.REQUIRED_PASSWORD.getCode());
                response.setMessage(ErrorCode.REQUIRED_PASSWORD.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            if (userDto.getFullname() == null || StringUtils.isEmpty(userDto.getFullname())) {
                response.setCode(ErrorCode.REQUIRED_FULLNAME.getCode());
                response.setMessage(ErrorCode.REQUIRED_FULLNAME.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            if (userDto.getEmail() == null || StringUtils.isEmpty(userDto.getEmail())) {
                response.setCode(ErrorCode.REQUIRED_EMAIL.getCode());
                response.setMessage(ErrorCode.REQUIRED_EMAIL.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            if (userDto.getPhone() == null) {
                response.setCode(ErrorCode.REQUIRED_PHONE.getCode());
                response.setMessage(ErrorCode.REQUIRED_PHONE.getMessage());
                return ResponseEntity.badRequest().body(response);
            }


            if (userService.checkUserName(userDto.getUsername())) {
                response.setCode(ErrorCode.USERNAME_EXISTED.getCode());
                response.setMessage(ErrorCode.USERNAME_EXISTED.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            User user = new User();
            user.setUserName(userDto.getUsername());
            user.setPassword(userDto.getPassword());
            user.setFullName(userDto.getFullname());
            user.setEmail(userDto.getEmail());
            user.setPhone(userDto.getPhone());
            user.setCreatedAt(LocalDateTime.now());
            user.setCreatedBy(account.getUserName());
            user.setStatus(Status.OFFLINE);
            Set<Role> roles = new HashSet<>();
            userDto.getRoles().forEach(roleName -> {
                Optional<Role> role = roleService.getRoleByName(roleName);
                role.ifPresent(roles::add);
            });
            user.setRoles(roles);
            userService.saveUser(user);
            response.setCode(ErrorCode.SUCCESS.getCode());
            response.setMessage(ErrorCode.SUCCESS.getMessage());
            response.setContent(user);
            return ResponseEntity.ok().body(response);
        }catch (Exception e){
            throw handlerException(e);
        }
    }

    @GetMapping("{id}")
    public ResponseEntity<BaseResponse<UserDto>> getUserById(@PathVariable Integer id){
        try{
            BaseResponse<UserDto>  response = new BaseResponse<>();
            User user = userService.getByID(id);
            if(user == null){
                response.setCode(ErrorCode.USER_NOT_FOUND.getCode());
                response.setMessage(ErrorCode.USER_NOT_FOUND.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            UserDto dto = new UserDto();
            dto.setId(user.getId());
            dto.setUsername(user.getUserName());
            dto.setFullname(user.getFullName());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhone());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());
            dto.setCreatedBy(user.getCreatedBy());
            dto.setUpdatedBy(user.getUpdatedBy());
            dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));

            response.setCode(ErrorCode.SUCCESS.getCode());
            response.setMessage(ErrorCode.SUCCESS.getMessage());
            response.setContent(dto);
            return ResponseEntity.ok().body(response);
        }catch (Exception e){
            throw handlerException(e);
        }

    }

    @DeleteMapping("/delete/{id}")
    @ResponseBody
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try{
            if (userService.getByID(id) != null) {
                userService.deleteById(id);
                return ok(new BaseResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null));
            } else {
                return ok(BaseResponse.builder().code(ErrorCode.USER_NOT_FOUND.getCode()).message(ErrorCode.USER_NOT_FOUND.getMessage()).build());
            }
        }catch (Exception e){
            throw handlerException(e);
        }
    }

    @PutMapping(value = "/edit")
    @ResponseBody
    public ResponseEntity<BaseResponse<?>> editUser(@RequestBody UserDto userDto, HttpServletRequest request) {
        try{
            BaseResponse response = new BaseResponse<>();
            String userNameFromJwtToken = jwtUtils.getUserNameFromToken(request);

            User user = userService.getByID(userDto.getId());

            if (userDto.getFullname() == null || StringUtils.isEmpty(userDto.getFullname())) {
                response.setCode(ErrorCode.REQUIRED_FULLNAME.getCode());
                response.setMessage(ErrorCode.REQUIRED_FULLNAME.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            if (userDto.getEmail() == null || StringUtils.isEmpty(userDto.getEmail())) {
                response.setCode(ErrorCode.REQUIRED_EMAIL.getCode());
                response.setMessage(ErrorCode.REQUIRED_EMAIL.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            if (userDto.getPhone() == null) {
                response.setCode(ErrorCode.REQUIRED_PHONE.getCode());
                response.setMessage(ErrorCode.REQUIRED_PHONE.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

            user.setFullName(userDto.getFullname());
            user.setEmail(userDto.getEmail());
            user.setPhone(userDto.getPhone());
            user.setUpdatedAt(LocalDateTime.now());
            user.setUpdatedBy(userNameFromJwtToken);
            Set<Role> roles = new HashSet<>();
            userDto.getRoles().forEach(roleName -> {
                Optional<Role> role = roleService.getRoleByName(roleName);
                role.ifPresent(roles::add);
            });
            user.setRoles(roles);
            userService.saveUser(user);
            response.setCode(ErrorCode.SUCCESS.getCode());
            response.setMessage(ErrorCode.SUCCESS.getMessage());
            response.setContent(user);
            return ResponseEntity.ok().body(response);
        }catch (Exception e) {
            throw handlerException(e);
        }
    }

    private CustomException handlerException(Exception exception){
        String cause = "";
        if(exception.getCause() != null){
            cause = exception.getCause().getClass().getCanonicalName();
        }

        if(exception instanceof CustomException){
            throw new CustomException(HttpStatus.SC_OK, ((CustomException) exception).getCode(), exception.getMessage());
        } else if(exception instanceof IllegalArgumentException || cause.contains("IncorrectParameterException")
        || cause.contains("SQLGrammarException")){
            return new CustomException(HttpStatus.SC_INTERNAL_SERVER_ERROR, ErrorCode.BAD_REQUEST_PARAMS.getCode(), exception.getMessage());
        } else {
            return new CustomException(HttpStatus.SC_INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_EXCEPTION.getCode(), exception.getMessage());
        }
    }


}
