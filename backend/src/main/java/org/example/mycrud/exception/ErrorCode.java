package org.example.mycrud.exception;


import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public enum ErrorCode {

    SERVER_ERROR(9999, "Internal Server Error"),
    SUCCESS(0, "SUCCESS"),
    NOT_FOUND(1, "Not found"),
    UNAUTHORIZED(2, "Token expired"),
    UNCATEGORIZED_EXCEPTION(3, "Uncategorized error"),
    USER_NOT_FOUND(4, "User not found"),
    USERNAME_EXISTED(5, "User name already exists"),
    INVALID_CREDENTIALS(6, "Invalid credentials"),
    FORBIDDEN(7, "You do not have permission"),
    REQUIRED_PARAMS(8, "REQUIRED_PARAMS"),
    REQUIRED_EMAIL(9, "REQUIRED_EMAIL"),
    REQUIRED_PASSWORD(10, "REQUIRED_PASSWORD"),
    REQUIRED_USERNAME(11, "REQUIRED_NAME"),
    REQUIRED_PHONE(12, "REQUIRED_PHONE"),
    REQUIRED_FULLNAME(13, "REQUIRED_FULLNAME"),
    BAD_REQUEST_PARAMS(14,"Bad request params"),
    INTERNAL_EXCEPTION(15,"exception"),
    ROLE_NAME_EXISTED(16, "Role name already exists"),
    ROLE_NAME_NOT_FOUND(17, "Role name not found");




    private Integer code;
    private String message;


}
