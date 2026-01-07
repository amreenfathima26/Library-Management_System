package com.college.erp.library.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "library_books")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryBook {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 300)
    private String title;
    
    @Column(nullable = false, length = 200)
    private String author;
    
    @Column(unique = true, length = 50)
    private String isbn;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;
    
    @Column(name = "available_quantity", nullable = false)
    @Builder.Default
    private Integer availableQuantity = 1;
    
    @Column(length = 100)
    private String branch;
    
    @Column(length = 100)
    private String subject;
    
    @Column(length = 100)
    private String category;
    
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
        return availableQuantity > 0;
    }
}

