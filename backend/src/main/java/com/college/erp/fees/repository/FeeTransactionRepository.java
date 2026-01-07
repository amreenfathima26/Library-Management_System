package com.college.erp.fees.repository;

import com.college.erp.fees.model.FeeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeTransactionRepository extends JpaRepository<FeeTransaction, Long> {
    List<FeeTransaction> findByStudentId(Long studentId);
    List<FeeTransaction> findByStatus(FeeTransaction.TransactionStatus status);
    Optional<FeeTransaction> findByRazorpayOrderId(String razorpayOrderId);
    Optional<FeeTransaction> findByReceiptNumber(String receiptNumber);
}

