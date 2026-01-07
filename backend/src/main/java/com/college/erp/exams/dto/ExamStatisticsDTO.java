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
public class ExamStatisticsDTO {
    private Long totalStudents;
    private Long examsConducted;
    private Long resultsPublished;
    private Long pendingResults;
    private BigDecimal averagePassPercentage;
    private BigDecimal averageAttendancePercentage;
}

