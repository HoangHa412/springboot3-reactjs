package org.example.mycrud.service;

import org.example.mycrud.entity.Role;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;

public interface RoleService {

    Role createRole(Role role);

    void deleteRoleById(Integer id);

    Role findById(Integer id);

    List<Role> getAll();

    Optional<Role> getRoleByName(String name);
}
