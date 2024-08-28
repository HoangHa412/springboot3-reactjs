package org.example.mycrud.service.Impl;

import org.example.mycrud.entity.User;
import org.example.mycrud.model.Status;
import org.example.mycrud.repository.RoleRepository;
import org.example.mycrud.repository.UserRepository;
import org.example.mycrud.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoleRepository roleRepository;


    @Override
    public List<User> getListUser() {
        return userRepository.findAll();
    }

    @Override
    public User getByID(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }

    @Override
    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public List<User> search(String keyword) {
        return userRepository.search(keyword);
    }


    @Override
    public User getByEmail(String email) {
        return userRepository.findUsersByEmail(email.trim());
    }

    @Override
    public User getByUsername(String username) {
        return userRepository.findUsersByUserName(username).orElse(null);
    }

    @Override
    public Boolean checkUserName(String username) {
        return userRepository.existsUserByUserName(username);
    }

    @Override
    public Boolean oldPasswordValidity(String oldPassword, User user) {
        return passwordEncoder.matches(oldPassword, user.getPassword());
    }

    @Override
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void disConnect(User user) {
        var storedUser = userRepository.findUsersByUserName(user.getUserName());
        if(storedUser.isPresent()){
            storedUser.get().setStatus(Status.OFFLINE);
            userRepository.save(storedUser.get());
        }
    }

    @Override
    public void addUser(User user) {
        var storedUser = userRepository.findUsersByUserName(user.getUserName());
        if(storedUser.isPresent()){
            storedUser.get().setStatus(Status.ONLINE);
            userRepository.save(storedUser.get());
        }
    }

    @Override
    public List<User> findAllUsersConnect() {
        return userRepository.findAllByStatus(Status.ONLINE);
    }

    @Override
    public void forgetPassword(String email, String password) {
        //set user by email
        User oCurrentUser = userRepository.findByEmail(email.trim()).orElse(null);

        oCurrentUser.setPassword(password);
        //TODO send mail
        userRepository.save(oCurrentUser);
    }

}