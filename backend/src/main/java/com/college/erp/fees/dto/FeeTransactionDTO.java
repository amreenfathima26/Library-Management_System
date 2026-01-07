package com.college.erp.fees.dto;

import com.college.erp.fees.model.FeeTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeTransactionDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentUid;
    private BigDecimal amount;
    private FeeTransaction.PaymentMode paymentMode;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String receiptNumber;
    private Integer semester;
    private FeeTransaction.TransactionStatus status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}

