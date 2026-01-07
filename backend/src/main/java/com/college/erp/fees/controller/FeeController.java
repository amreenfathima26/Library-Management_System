package com.college.erp.fees.controller;

import com.college.erp.fees.dto.FeeTransactionDTO;
import com.college.erp.fees.dto.PaymentRequest;
import com.college.erp.fees.dto.RazorpayOrderResponse;
import com.college.erp.fees.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeeController {

    private final FeeService feeService;

    @PostMapping("/create-order")
    @PreAuthorize("hasAnyRole('ACCOUNTS', 'STUDENT')")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(@Valid @RequestBody PaymentRequest request) {
        RazorpayOrderResponse response = feeService.createRazorpayOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleRazorpayWebhook(@RequestBody Map<String, String> webhookData) {
        String orderId = webhookData.get("razorpay_order_id");
        String paymentId = webhookData.get("razorpay_payment_id");
        String signature = webhookData.get("razorpay_signature");

        feeService.handleRazorpayWebhook(orderId, paymentId, signature);
        return ResponseEntity.ok("Webhook processed successfully");
    }

    @PostMapping("/cash")
    @PreAuthorize("hasRole('ACCOUNTS')")
    public ResponseEntity<FeeTransactionDTO> recordCashPayment(@Valid @RequestBody PaymentRequest request) {
        FeeTransactionDTO transaction = feeService.recordCashPayment(request);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTS', 'STUDENT')")
    public ResponseEntity<List<FeeTransactionDTO>> getStudentFeeHistory(@PathVariable Long studentId) {
        List<FeeTransactionDTO> transactions = feeService.getStudentFeeHistory(studentId);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/{transactionId}/generate-receipt")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTS')")
    public ResponseEntity<String> generateReceipt(@PathVariable Long transactionId) {
        // Admin can generate receipts for viewing, but only ACCOUNTS can collect fees
        return ResponseEntity.ok("Receipt generation initiated");
    }
}

