package com.college.erp.hostel.model;

import com.college.erp.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hostels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hostel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "hostel_name", nullable = false, length = 100)
    private String hostelName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warden_id")
    private User warden;
    
    @Column(name = "total_rooms", nullable = false)
    @Builder.Default
    private Integer totalRooms = 0;
    
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
}

