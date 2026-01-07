package com.college.erp.library.repository;

import com.college.erp.library.model.LibraryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryTransactionRepository extends JpaRepository<LibraryTransaction, Long> {
    List<LibraryTransaction> findByStudentId(Long studentId);
    List<LibraryTransaction> findByBookId(Long bookId);
    
    @Query("SELECT lt FROM LibraryTransaction lt WHERE lt.student.id = :studentId AND lt.status = 'ISSUED'")
    List<LibraryTransaction> findActiveIssuesByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT lt FROM LibraryTransaction lt WHERE lt.book.id = :bookId AND lt.status = :status")
    List<LibraryTransaction> findByBookIdAndStatus(@Param("bookId") Long bookId, @Param("status") LibraryTransaction.TransactionStatus status);
    
    @Query("SELECT lt FROM LibraryTransaction lt JOIN FETCH lt.book JOIN FETCH lt.student WHERE lt.status = :status")
    List<LibraryTransaction> findByStatus(@Param("status") LibraryTransaction.TransactionStatus status);
    
    @Query("SELECT lt FROM LibraryTransaction lt JOIN FETCH lt.book JOIN FETCH lt.student")
    List<LibraryTransaction> findAllWithDetails();
    
    @Query("SELECT lt FROM LibraryTransaction lt JOIN FETCH lt.book JOIN FETCH lt.student WHERE lt.student.id = :studentId")
    List<LibraryTransaction> findByStudentIdWithDetails(@Param("studentId") Long studentId);
    
    @Query("SELECT lt FROM LibraryTransaction lt JOIN FETCH lt.book JOIN FETCH lt.student WHERE lt.student.id = :studentId AND lt.status = 'ISSUED'")
    List<LibraryTransaction> findActiveIssuesByStudentIdWithDetails(@Param("studentId") Long studentId);
}

