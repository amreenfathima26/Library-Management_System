package com.college.erp.fees.repository;

import com.college.erp.fees.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByStudentId(Long studentId);
    Optional<Receipt> findByReceiptNumber(String receiptNumber);
    Optional<Receipt> findByTransactionId(Long transactionId);
}

