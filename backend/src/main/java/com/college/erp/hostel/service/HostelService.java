package com.college.erp.hostel.service;

import com.college.erp.hostel.dto.HostelAllocationRequest;
import com.college.erp.hostel.dto.HostelAllocationDTO;
import com.college.erp.hostel.dto.HostelDTO;
import com.college.erp.hostel.model.Hostel;
import com.college.erp.hostel.model.HostelAllocation;
import com.college.erp.hostel.model.HostelRoom;
import com.college.erp.hostel.repository.HostelAllocationRepository;
import com.college.erp.hostel.repository.HostelRepository;
import com.college.erp.hostel.repository.HostelRoomRepository;
import com.college.erp.model.Student;
import com.college.erp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostelService {

    private final HostelRepository hostelRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final HostelAllocationRepository hostelAllocationRepository;
    private final StudentRepository studentRepository;

    public List<HostelDTO> getAllHostels() {
        return hostelRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public HostelDTO getHostelById(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
        return mapToDTO(hostel);
    }

    @Transactional
    public HostelDTO createHostel(Hostel hostel) {
        hostel = hostelRepository.save(hostel);
        return mapToDTO(hostel);
    }

    public List<HostelRoom> getHostelRooms(Long hostelId) {
        return hostelRoomRepository.findByHostelId(hostelId);
    }

    public List<HostelRoom> getAvailableRooms(Long hostelId) {
        return hostelRoomRepository.findAvailableRooms(hostelId);
    }

    @Transactional
    public HostelRoom createRoom(Long hostelId, HostelRoom room) {
        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new RuntimeException("Hostel not found"));
        
        if (hostelRoomRepository.findByHostelIdAndRoomNumber(hostelId, room.getRoomNumber()).isPresent()) {
            throw new RuntimeException("Room number already exists in this hostel");
        }
        
        room.setHostel(hostel);
        room = hostelRoomRepository.save(room);
        
        // Update hostel total rooms
        hostel.setTotalRooms(hostel.getTotalRooms() + 1);
        hostelRepository.save(hostel);
        
        return room;
    }

    @Transactional
    public HostelRoom updateRoom(Long hostelId, Long roomId, HostelRoom updatedRoom) {
        HostelRoom room = hostelRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (!room.getHostel().getId().equals(hostelId)) {
            throw new RuntimeException("Room does not belong to this hostel");
        }
        
        // Check if room number is being changed and if it conflicts
        if (!room.getRoomNumber().equals(updatedRoom.getRoomNumber())) {
            if (hostelRoomRepository.findByHostelIdAndRoomNumber(hostelId, updatedRoom.getRoomNumber()).isPresent()) {
                throw new RuntimeException("Room number already exists in this hostel");
            }
        }
        
        // Validate capacity - cannot be less than occupied beds
        if (updatedRoom.getCapacity() < room.getOccupiedBeds()) {
            throw new RuntimeException("Capacity cannot be less than occupied beds");
        }
        
        room.setRoomNumber(updatedRoom.getRoomNumber());
        room.setCapacity(updatedRoom.getCapacity());
        
        return hostelRoomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Long hostelId, Long roomId) {
        HostelRoom room = hostelRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (!room.getHostel().getId().equals(hostelId)) {
            throw new RuntimeException("Room does not belong to this hostel");
        }
        
        // Check if room has active allocations
        List<HostelAllocation> activeAllocations = hostelAllocationRepository.findByRoomId(roomId)
                .stream()
                .filter(alloc -> alloc.getStatus() == HostelAllocation.AllocationStatus.ALLOCATED)
                .collect(Collectors.toList());
        
        if (!activeAllocations.isEmpty()) {
            throw new RuntimeException("Cannot delete room with active allocations. Please deallocate students first.");
        }
        
        Hostel hostel = room.getHostel();
        hostelRoomRepository.delete(room);
        
        // Update hostel total rooms
        hostel.setTotalRooms(hostel.getTotalRooms() - 1);
        hostelRepository.save(hostel);
    }

    @Transactional
    public HostelAllocation allocateStudent(HostelAllocationRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        HostelRoom room = hostelRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        
        if (!room.isAvailable()) {
            throw new RuntimeException("Room is full");
        }
        
        // Check if student already has an active allocation
        if (hostelAllocationRepository.findActiveAllocationByStudentId(request.getStudentId()).isPresent()) {
            throw new RuntimeException("Student already has an active hostel allocation");
        }
        
        HostelAllocation allocation = HostelAllocation.builder()
                .student(student)
                .hostel(room.getHostel())
                .room(room)
                .allocationDate(request.getAllocationDate() != null ? request.getAllocationDate() : LocalDate.now())
                .status(HostelAllocation.AllocationStatus.ALLOCATED)
                .build();
        
        allocation = hostelAllocationRepository.save(allocation);
        
        // Update room occupancy
        room.setOccupiedBeds(room.getOccupiedBeds() + 1);
        hostelRoomRepository.save(room);
        
        return allocation;
    }

    @Transactional
    public void deallocateStudent(Long studentId) {
        HostelAllocation allocation = hostelAllocationRepository.findActiveAllocationByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("No active allocation found for student"));
        
        allocation.setStatus(HostelAllocation.AllocationStatus.VACATED);
        allocation.setDeallocationDate(LocalDate.now());
        hostelAllocationRepository.save(allocation);
        
        // Update room occupancy
        HostelRoom room = allocation.getRoom();
        room.setOccupiedBeds(room.getOccupiedBeds() - 1);
        hostelRoomRepository.save(room);
    }

    public List<HostelAllocation> getStudentAllocations(Long studentId) {
        return hostelAllocationRepository.findByStudentId(studentId);
    }

    public List<HostelAllocationDTO> getHostelAllocations(Long hostelId) {
        List<HostelAllocation> allocations = hostelAllocationRepository.findByHostelId(hostelId);
        return allocations.stream()
                .map(this::mapAllocationToDTO)
                .collect(Collectors.toList());
    }

    public List<HostelAllocationDTO> getAllAllocations() {
        List<HostelAllocation> allocations = hostelAllocationRepository.findAll();
        return allocations.stream()
                .map(this::mapAllocationToDTO)
                .collect(Collectors.toList());
    }

    private HostelAllocationDTO mapAllocationToDTO(HostelAllocation allocation) {
        return HostelAllocationDTO.builder()
                .id(allocation.getId())
                .studentId(allocation.getStudent().getId())
                .studentUid(allocation.getStudent().getStudentUid())
                .studentName(allocation.getStudent().getFirstName() + " " + allocation.getStudent().getLastName())
                .studentEmail(allocation.getStudent().getEmail())
                .hostelId(allocation.getHostel().getId())
                .hostelName(allocation.getHostel().getHostelName())
                .roomId(allocation.getRoom().getId())
                .roomNumber(allocation.getRoom().getRoomNumber())
                .allocationDate(allocation.getAllocationDate())
                .deallocationDate(allocation.getDeallocationDate())
                .status(allocation.getStatus())
                .build();
    }

    private HostelDTO mapToDTO(Hostel hostel) {
        List<HostelRoom> rooms = hostelRoomRepository.findByHostelId(hostel.getId());
        int totalCapacity = rooms.stream().mapToInt(HostelRoom::getCapacity).sum();
        int totalOccupied = rooms.stream().mapToInt(HostelRoom::getOccupiedBeds).sum();
        int availableBeds = totalCapacity - totalOccupied;
        double occupancyPercentage = totalCapacity > 0 ? (totalOccupied * 100.0 / totalCapacity) : 0.0;
        
        return HostelDTO.builder()
                .id(hostel.getId())
                .hostelName(hostel.getHostelName())
                .wardenId(hostel.getWarden() != null ? hostel.getWarden().getId() : null)
                .wardenName(hostel.getWarden() != null ? hostel.getWarden().getUsername() : null)
                .totalRooms(hostel.getTotalRooms())
                .totalCapacity(totalCapacity)
                .totalOccupied(totalOccupied)
                .availableBeds(availableBeds)
                .occupancyPercentage(occupancyPercentage)
                .build();
    }
}

