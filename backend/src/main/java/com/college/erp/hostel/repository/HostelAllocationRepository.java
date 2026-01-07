package com.college.erp.hostel.repository;

import com.college.erp.hostel.model.HostelAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelAllocationRepository extends JpaRepository<HostelAllocation, Long> {
    List<HostelAllocation> findByStudentId(Long studentId);
    List<HostelAllocation> findByHostelId(Long hostelId);
    List<HostelAllocation> findByRoomId(Long roomId);
    
    @Query("SELECT ha FROM HostelAllocation ha WHERE ha.student.id = :studentId AND ha.status = 'ALLOCATED'")
    Optional<HostelAllocation> findActiveAllocationByStudentId(@Param("studentId") Long studentId);
}

