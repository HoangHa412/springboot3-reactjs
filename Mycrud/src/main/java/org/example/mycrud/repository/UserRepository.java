package org.example.mycrud.repository;

import org.example.mycrud.entity.User;
import org.example.mycrud.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Query("select u from User u where u.userName like %?1%")
    List<User> search(String keyword);

    Optional<User> findUsersByUserName(String name);

    Boolean existsUserByUserName(String username);

    User findUsersByEmail(String email);

    Optional<User> findByEmail(String email);

    List<User> findAllByStatus(Status status);


//    @Transactional
//    @Modifying
//    @Query("update User u set u.password = ?2 where u.email = ?1")
//    void updatePassword(String email, String password);



}
