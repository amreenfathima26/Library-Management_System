package com.college.erp.exams.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResponse {
    private int totalRecords;
    private int successCount;
    private int failureCount;
    private List<String> errors;
    private String message;
}



