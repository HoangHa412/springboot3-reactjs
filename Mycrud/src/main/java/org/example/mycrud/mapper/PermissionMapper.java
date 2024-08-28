package org.example.mycrud.mapper;

import org.example.mycrud.entity.Permissions;
import org.example.mycrud.model.PermissionsDto;
import org.springframework.stereotype.Component;

@Component
public class PermissionMapper {

    public Permissions toPermission(PermissionsDto permissionsDto){
        Permissions permissions = new Permissions();
        permissions.setId(permissionsDto.getId());
        permissions.setName(permissionsDto.getName());
        permissions.setDescription(permissionsDto.getDescription());
        return permissions;
    }

    public PermissionsDto toPermissionDto(Permissions permissions){
        PermissionsDto permissionDto = new PermissionsDto();
        permissionDto.setId(permissions.getId());
        permissionDto.setName(permissions.getName());
        permissions.setDescription(permissions.getDescription());
        return permissionDto;
    }
}
