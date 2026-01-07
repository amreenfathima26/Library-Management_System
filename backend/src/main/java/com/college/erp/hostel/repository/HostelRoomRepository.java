package com.college.erp.hostel.repository;

import com.college.erp.hostel.model.HostelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelRoomRepository extends JpaRepository<HostelRoom, Long> {
    List<HostelRoom> findByHostelId(Long hostelId);
    
    @Query("SELECT hr FROM HostelRoom hr WHERE hr.hostel.id = :hostelId AND hr.capacity > hr.occupiedBeds")
    List<HostelRoom> findAvailableRooms(@Param("hostelId") Long hostelId);
    
    Optional<HostelRoom> findByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
}

