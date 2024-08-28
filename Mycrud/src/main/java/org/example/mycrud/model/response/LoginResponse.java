package org.example.mycrud.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;


@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse extends BaseResponse<Object> {
    private String accessToken;
    private String refreshToken;

}
