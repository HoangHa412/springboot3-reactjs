package org.example.mycrud.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.example.mycrud.entity.Permissions;
import org.example.mycrud.entity.Role;
import org.example.mycrud.entity.User;
import org.example.mycrud.exception.ErrorCode;
import org.example.mycrud.mapper.RoleMapper;
import org.example.mycrud.model.RoleDto;
import org.example.mycrud.model.UserDto;
import org.example.mycrud.model.response.BaseResponse;
import org.example.mycrud.service.PermissionService;
import org.example.mycrud.service.RoleService;
import org.example.mycrud.utils.JwtUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping("roles")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @Autowired
    private PermissionService permissionsService;

    @Autowired
    private JwtUtils jwtUtils;


    @GetMapping
    public ResponseEntity<?> getAllRoles(){
        List<Role> roles = roleService.getAll();

        List<RoleDto> roleDto = new ArrayList<>();
        for(Role role: roles){
            RoleDto dto = new RoleDto();
            dto.setName(role.getName());
            dto.setDescription(role.getDescription());
            dto.setUpdatedAt(LocalDateTime.now());
            dto.setCreatedAt(LocalDateTime.now());
            dto.setCreatedBy(role.getCreatedBy());
            dto.setUpdatedBy(role.getUpdatedBy());
            dto.setPermissions(role.getPermissions().stream().map(Permissions::getName).collect(Collectors.toSet()));
            roleDto.add(dto);
        }
        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).content(roleDto).build());
    }

    @DeleteMapping("{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Integer id){
        if(roleService.findById(id) != null){
            roleService.deleteRoleById(id);
            return ok(new BaseResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null));
        }else{
            return ok(BaseResponse.builder().code(ErrorCode.ROLE_NAME_NOT_FOUND.getCode()).message(ErrorCode.ROLE_NAME_NOT_FOUND.getMessage()).build());
        }
    }

    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody RoleDto roleDto, HttpServletRequest request){

        if(roleService.getRoleByName(roleDto.getName()).isPresent()){
            return ResponseEntity.badRequest()
                    .body(BaseResponse.builder().code(ErrorCode.ROLE_NAME_EXISTED.getCode()).message(ErrorCode.ROLE_NAME_EXISTED.getMessage()).build());
        }

        User userRequest = jwtUtils.getUserFromToken(request);
        if(userRequest == null){
            return ResponseEntity.badRequest()
                   .body(BaseResponse.builder().code(ErrorCode.FORBIDDEN.getCode()).message(ErrorCode.FORBIDDEN.getMessage()).build());
        }

        Role entity = new Role();
        entity.setName(roleDto.getName());
        entity.setDescription(roleDto.getDescription());
        entity.setCreatedAt(LocalDate.now());
        entity.setCreatedBy(userRequest.getUserName());
        Set<Permissions> permissions = new HashSet<>();
        roleDto.getPermissions().forEach(permissionsName ->{
            Optional<Permissions> permission = permissionsService.getPermissionsByName(permissionsName);
            permission.ifPresent(permissions::add);
        });
        entity.setPermissions(permissions);

        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).content(entity).build());
    }

    @PutMapping("{id}")
    public ResponseEntity<?> updateRole(@RequestBody RoleDto roleDto,@PathVariable Integer id){
        Role roleOptional = roleService.findById(id);
        if(roleOptional != null){
            roleOptional.setName(roleDto.getName());
            Set<Permissions> permissions = new HashSet<>();
            roleDto.getPermissions().forEach(permissionsName ->{
                Optional<Permissions> permission = permissionsService.getPermissionsByName(permissionsName);
                permission.ifPresent(permissions::add);
            });
            roleOptional.setPermissions(permissions);
            roleService.createRole(roleOptional);
        }
            return ResponseEntity.ok()
                   .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).content(roleOptional).build());
    }
}
