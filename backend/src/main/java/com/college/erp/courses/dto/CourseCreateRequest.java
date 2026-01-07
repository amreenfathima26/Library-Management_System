package com.college.erp.courses.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseCreateRequest {
    @NotBlank(message = "Course name is required")
    @Size(max = 200, message = "Course name must not exceed 200 characters")
    private String courseName;
    
    @NotBlank(message = "Department is required")
    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;
    
    @NotNull(message = "Duration in years is required")
    @Min(value = 1, message = "Duration must be at least 1 year")
    @Max(value = 10, message = "Duration must not exceed 10 years")
    private Integer durationYears;
    
    @NotNull(message = "Fee per semester is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Fee must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Invalid fee format")
    private BigDecimal feePerSemester;
}

