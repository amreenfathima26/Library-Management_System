package com.college.erp.hostel.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hostel_rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostelRoom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    @JsonIgnore
    private Hostel hostel;
    
    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 1;
    
    @Column(name = "occupied_beds", nullable = false)
    @Builder.Default
    private Integer occupiedBeds = 0;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public boolean isAvailable() {
        return occupiedBeds < capacity;
    }
}

