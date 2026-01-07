package com.college.erp.fees.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotNull(message = "Semester is required")
    private Integer semester;
    
    @NotNull(message = "Payment mode is required")
    private String paymentMode; // RAZORPAY or CASH
}

