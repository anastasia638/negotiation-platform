package com.marketplace.dto;

import com.marketplace.model.UserType;

public class AuthResponse {

    private String token;
    private Long userId;
    private String email;
    private String name;
    private UserType userType;

    public AuthResponse(String token, Long userId, String email, String name, UserType userType) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.userType = userType;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public UserType getUserType() { return userType; }
}
