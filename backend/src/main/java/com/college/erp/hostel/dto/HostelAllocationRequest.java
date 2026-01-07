package com.college.erp.hostel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HostelAllocationRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotNull(message = "Hostel ID is required")
    private Long hostelId;
    
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    private LocalDate allocationDate;
}

