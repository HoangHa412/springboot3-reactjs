package org.example.mycrud.controller;

import org.example.mycrud.entity.Permissions;
import org.example.mycrud.exception.ErrorCode;
import org.example.mycrud.mapper.PermissionMapper;
import org.example.mycrud.model.PermissionsDto;
import org.example.mycrud.model.response.BaseResponse;
import org.example.mycrud.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping("permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private PermissionMapper permissionMapper;

    @GetMapping
    public ResponseEntity<?> getAllPermission(){
        List<Permissions> permissions = permissionService.getAll();

        List<PermissionsDto> permissionsDto = new ArrayList<>();
        for(Permissions per: permissions){
            permissionsDto.add(permissionMapper.toPermissionDto(per));
        }
        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).content(permissionsDto).build());
    }

    @PostMapping
    public ResponseEntity<?> createPermission(@RequestBody PermissionsDto permissionsDto){
        Permissions permissions = permissionMapper.toPermission(permissionsDto);
        permissionService.createPermissions(permissions);
        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).content(permissions).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePermission(@PathVariable Integer id){
       if(permissionService.findById(id) != null ){
           permissionService.deletePermissionsById(id);
            return ok(new BaseResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null));
       }else{
           return ok(BaseResponse.builder().code(ErrorCode.USER_NOT_FOUND.getCode()).message(ErrorCode.USER_NOT_FOUND.getMessage()).build());
       }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> updatePermission(@RequestBody PermissionsDto permissionsDto, @PathVariable Integer id){
        Permissions permissions = permissionService.updatePermissionsById(permissionMapper.toPermission(permissionsDto), id);
        return ResponseEntity.ok()
                .body(BaseResponse.builder().code(ErrorCode.SUCCESS.getCode()).message(ErrorCode.SUCCESS.getMessage()).content(permissions).build());
    }
}
