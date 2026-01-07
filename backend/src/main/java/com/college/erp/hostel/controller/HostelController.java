package com.college.erp.hostel.controller;

import com.college.erp.hostel.dto.HostelAllocationRequest;
import com.college.erp.hostel.dto.HostelAllocationDTO;
import com.college.erp.hostel.dto.HostelDTO;
import com.college.erp.hostel.model.Hostel;
import com.college.erp.hostel.model.HostelAllocation;
import com.college.erp.hostel.model.HostelRoom;
import com.college.erp.hostel.service.HostelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hostels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HostelController {

    private final HostelService hostelService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<List<HostelDTO>> getAllHostels() {
        return ResponseEntity.ok(hostelService.getAllHostels());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HostelDTO> createHostel(@RequestBody Hostel hostel) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hostelService.createHostel(hostel));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<HostelDTO> getHostelById(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getHostelById(id));
    }

    @GetMapping("/{id}/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<List<HostelRoom>> getHostelRooms(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getHostelRooms(id));
    }

    @GetMapping("/{id}/rooms/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<List<HostelRoom>> getAvailableRooms(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getAvailableRooms(id));
    }

    @PostMapping("/{id}/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<HostelRoom> createRoom(@PathVariable Long id, @RequestBody HostelRoom room) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hostelService.createRoom(id, room));
    }

    @PutMapping("/{id}/rooms/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<HostelRoom> updateRoom(
            @PathVariable Long id,
            @PathVariable Long roomId,
            @RequestBody HostelRoom room) {
        return ResponseEntity.ok(hostelService.updateRoom(id, roomId, room));
    }

    @DeleteMapping("/{id}/rooms/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id, @PathVariable Long roomId) {
        hostelService.deleteRoom(id, roomId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<HostelAllocation> allocateStudent(@Valid @RequestBody HostelAllocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hostelService.allocateStudent(request));
    }

    @PostMapping("/deallocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<Void> deallocateStudent(@RequestParam Long studentId) {
        hostelService.deallocateStudent(studentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN', 'STUDENT')")
    public ResponseEntity<List<HostelAllocation>> getStudentAllocations(@PathVariable Long studentId) {
        return ResponseEntity.ok(hostelService.getStudentAllocations(studentId));
    }

    @GetMapping("/{id}/allocations")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<List<HostelAllocationDTO>> getHostelAllocations(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getHostelAllocations(id));
    }

    @GetMapping("/allocations")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_WARDEN')")
    public ResponseEntity<List<HostelAllocationDTO>> getAllAllocations() {
        return ResponseEntity.ok(hostelService.getAllAllocations());
    }
}

