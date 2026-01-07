package com.college.erp.hostel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostelDTO {
    private Long id;
    private String hostelName;
    private Long wardenId;
    private String wardenName;
    private Integer totalRooms;
    private Integer totalCapacity;
    private Integer totalOccupied;
    private Integer availableBeds;
    private Double occupancyPercentage;
}

