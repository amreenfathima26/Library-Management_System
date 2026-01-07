package com.college.erp.users.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    private String password; // Optional - only update if provided
    
    @NotNull(message = "Role is required")
    private String role;
    
    @NotNull(message = "Status is required")
    private String status; // ACTIVE or DISABLED
}

