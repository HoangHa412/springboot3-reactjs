package org.example.mycrud.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomException extends RuntimeException {

    private Integer statusCode;
    private Integer code;
    private String errorMessage;

    public CustomException(Integer code, String errorMessage) {
        this.errorMessage = errorMessage;
        this.code = code;
    }

    public CustomException(Integer statusCode, Integer code, String errorMessage) {
        super(errorMessage);
        this.statusCode = statusCode;
        this.code = code;
    }

    public String getMessage(){
        if(errorMessage != null){
            return errorMessage + " " + super.getMessage();
        }
        return super.getMessage();
    }
}
