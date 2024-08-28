package org.example.mycrud.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatNotification {
    private Integer id;
    private String senderId;
    private String recipientId;
    private String content;
}
