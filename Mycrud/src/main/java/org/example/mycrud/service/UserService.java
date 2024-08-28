package org.example.mycrud.service;

import org.example.mycrud.entity.User;

import java.util.List;

public interface UserService {
    List<User> getListUser();

    User getByID(Integer id);

    void deleteById(Integer id);

    User saveUser(User user);

    List<User> search(String keyword);

    User getByEmail(String email);

    User getByUsername(String username);

    Boolean checkUserName(String username);

    Boolean oldPasswordValidity(String oldPassword, User user);

    void changePassword(User user, String newPassword);

    void disConnect(User user);

    void addUser(User user);

    List<User> findAllUsersConnect();

    void forgetPassword(String email, String password);
}
