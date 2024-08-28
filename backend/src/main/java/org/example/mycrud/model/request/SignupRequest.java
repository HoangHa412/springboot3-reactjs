package org.example.mycrud.model.request;

import lombok.*;
import org.jetbrains.annotations.NotNull;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {
    private String username;
    @NotNull
    private String password;
    @NonNull
    private String cfPassword;
    private Set<String> roles;
}
