package com.college.erp.dashboard.service;

import com.college.erp.fees.model.FeeTransaction;
import com.college.erp.fees.repository.FeeTransactionRepository;
import com.college.erp.hostel.repository.HostelRoomRepository;
import com.college.erp.library.repository.LibraryTransactionRepository;
import com.college.erp.model.Student;
import com.college.erp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final FeeTransactionRepository feeTransactionRepository;
    private final HostelRoomRepository hostelRoomRepository;
    private final LibraryTransactionRepository libraryTransactionRepository;

    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Total Students
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.findByStatus(Student.StudentStatus.ACTIVE).size();
        overview.put("total_students", totalStudents);
        overview.put("active_students", activeStudents);
        
        // Fees Collected
        BigDecimal totalFeesCollected = feeTransactionRepository.findAll().stream()
                .filter(t -> t.getStatus() == FeeTransaction.TransactionStatus.SUCCESS)
                .map(FeeTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        LocalDate startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
        
        BigDecimal monthlyFees = feeTransactionRepository.findAll().stream()
                .filter(t -> t.getStatus() == FeeTransaction.TransactionStatus.SUCCESS)
                .filter(t -> t.getPaidAt() != null && 
                        t.getPaidAt().toLocalDate().isAfter(startOfMonth.minusDays(1)) &&
                        t.getPaidAt().toLocalDate().isBefore(endOfMonth.plusDays(1)))
                .map(FeeTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        overview.put("total_fees_collected", totalFeesCollected);
        overview.put("monthly_fees_collected", monthlyFees);
        
        // Hostel Occupancy
        long totalRooms = hostelRoomRepository.count();
        int totalCapacity = hostelRoomRepository.findAll().stream()
                .mapToInt(r -> r.getCapacity()).sum();
        int totalOccupied = hostelRoomRepository.findAll().stream()
                .mapToInt(r -> r.getOccupiedBeds()).sum();
        double occupancyPercentage = totalCapacity > 0 ? (totalOccupied * 100.0 / totalCapacity) : 0.0;
        
        overview.put("hostel_total_rooms", totalRooms);
        overview.put("hostel_total_capacity", totalCapacity);
        overview.put("hostel_total_occupied", totalOccupied);
        overview.put("hostel_occupancy_percentage", occupancyPercentage);
        
        // Library Statistics
        long totalBooks = libraryTransactionRepository.count();
        long issuedBooks = libraryTransactionRepository.findAll().stream()
                .filter(t -> t.getStatus() == com.college.erp.library.model.LibraryTransaction.TransactionStatus.ISSUED)
                .count();
        
        overview.put("total_books_issued", totalBooks);
        overview.put("currently_issued_books", issuedBooks);
        
        return overview;
    }
}

