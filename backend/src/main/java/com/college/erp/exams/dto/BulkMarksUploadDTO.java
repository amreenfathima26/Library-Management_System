package com.college.erp.exams.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkMarksUploadDTO {
    private String studentUid;
    private Long courseId;
    private String subjectName;
    private BigDecimal marks;
    private LocalDate examDate;
    private Integer semester;
}



