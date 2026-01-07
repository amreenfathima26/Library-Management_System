package com.college.erp.courses.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String courseName;
    private String department;
    private Integer durationYears;
    private BigDecimal feePerSemester;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

