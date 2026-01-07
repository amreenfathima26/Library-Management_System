package com.college.erp.exams.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoursePerformanceDTO {
    private Long courseId;
    private String courseName;
    private Integer semester;
    private String subjectName;
    private Long totalStudents;
    private Long appeared;
    private Long passed;
    private Long failed;
    private BigDecimal passPercentage;
    private BigDecimal averageMarks;
}

