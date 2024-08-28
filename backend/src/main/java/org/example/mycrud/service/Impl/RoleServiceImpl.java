package org.example.mycrud.service.Impl;

import org.example.mycrud.entity.Role;
import org.example.mycrud.repository.PermissionsRepository;
import org.example.mycrud.repository.RoleRepository;
import org.example.mycrud.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionsRepository permissionsRepository;

    @Override
    public Role createRole(Role role) {
       return roleRepository.save(role);
    }

    @Override
    public void deleteRoleById(Integer id) {
        roleRepository.deleteById(id);
    }

    @Override
    public Role findById(Integer id) {
        return roleRepository.findById(id).orElse(null);
    }

    @Override
    public List<Role> getAll() {
        return roleRepository.findAll();
    }

    @Override
    public Optional<Role> getRoleByName(String name) {
        return roleRepository.findByName(name);
    }
}
