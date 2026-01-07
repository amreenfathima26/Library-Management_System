package com.college.erp.hostel.dto;

import com.college.erp.hostel.model.HostelAllocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostelAllocationDTO {
    private Long id;
    private Long studentId;
    private String studentUid;
    private String studentName;
    private String studentEmail;
    private Long hostelId;
    private String hostelName;
    private Long roomId;
    private String roomNumber;
    private LocalDate allocationDate;
    private LocalDate deallocationDate;
    private HostelAllocation.AllocationStatus status;
}

