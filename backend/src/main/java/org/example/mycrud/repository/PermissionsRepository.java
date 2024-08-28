package org.example.mycrud.repository;

import org.example.mycrud.entity.Permissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface PermissionsRepository extends JpaRepository<Permissions, Integer> {
    Optional<Permissions> findByName(String name);
}
