package com.college.erp.fees.service;

import com.college.erp.fees.dto.FeeTransactionDTO;
import com.college.erp.fees.dto.PaymentRequest;
import com.college.erp.fees.dto.RazorpayOrderResponse;
import com.college.erp.fees.model.FeeTransaction;
import com.college.erp.fees.model.Receipt;
import com.college.erp.fees.razorpay.RazorpayService;
import com.college.erp.fees.repository.FeeTransactionRepository;
import com.college.erp.fees.repository.ReceiptRepository;
import com.college.erp.model.Student;
import com.college.erp.repository.StudentRepository;
import com.college.erp.storage.FileStorageService;
import com.razorpay.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeeService {

    private final FeeTransactionRepository feeTransactionRepository;
    private final ReceiptRepository receiptRepository;
    private final StudentRepository studentRepository;
    private final RazorpayService razorpayService;
    private final FileStorageService fileStorageService;

    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(PaymentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String receiptNumber = generateReceiptNumber();
        
        try {
            Order order = razorpayService.createOrder(
                    request.getAmount().longValue(),
                    "INR",
                    receiptNumber
            );

            FeeTransaction transaction = FeeTransaction.builder()
                    .student(student)
                    .amount(request.getAmount())
                    .paymentMode(FeeTransaction.PaymentMode.RAZORPAY)
                    .razorpayOrderId(order.get("id"))
                    .receiptNumber(receiptNumber)
                    .semester(request.getSemester())
                    .status(FeeTransaction.TransactionStatus.PENDING)
                    .build();

            feeTransactionRepository.save(transaction);

            return RazorpayOrderResponse.builder()
                    .orderId(order.get("id"))
                    .amount(order.get("amount").toString())
                    .currency(order.get("currency"))
                    .keyId(razorpayService.getKeyId())
                    .build();
        } catch (Exception e) {
            log.error("Error creating Razorpay order", e);
            throw new RuntimeException("Failed to create payment order", e);
        }
    }

    @Transactional
    public void handleRazorpayWebhook(String orderId, String paymentId, String signature) {
        FeeTransaction transaction = feeTransactionRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (razorpayService.verifySignature(orderId, paymentId, signature)) {
            transaction.setRazorpayPaymentId(paymentId);
            transaction.setRazorpaySignature(signature);
            transaction.setStatus(FeeTransaction.TransactionStatus.SUCCESS);
            transaction.setPaidAt(LocalDateTime.now());
            feeTransactionRepository.save(transaction);

            // Generate receipt
            generateReceipt(transaction);
        } else {
            transaction.setStatus(FeeTransaction.TransactionStatus.FAILED);
            feeTransactionRepository.save(transaction);
            throw new RuntimeException("Invalid payment signature");
        }
    }

    @Transactional
    public FeeTransactionDTO recordCashPayment(PaymentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String receiptNumber = generateReceiptNumber();

        FeeTransaction transaction = FeeTransaction.builder()
                .student(student)
                .amount(request.getAmount())
                .paymentMode(FeeTransaction.PaymentMode.CASH)
                .receiptNumber(receiptNumber)
                .semester(request.getSemester())
                .status(FeeTransaction.TransactionStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();

        transaction = feeTransactionRepository.save(transaction);
        
        // Generate receipt
        generateReceipt(transaction);

        return mapToDTO(transaction);
    }

    public List<FeeTransactionDTO> getStudentFeeHistory(Long studentId) {
        List<FeeTransaction> transactions = feeTransactionRepository.findByStudentId(studentId);
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void generateReceipt(FeeTransaction transaction) {
        if (receiptRepository.findByTransactionId(transaction.getId()).isPresent()) {
            return; // Receipt already generated
        }

        try {
            String pdfPath = fileStorageService.generateReceiptPDF(transaction);
            
            Receipt receipt = Receipt.builder()
                    .student(transaction.getStudent())
                    .transaction(transaction)
                    .receiptNumber(transaction.getReceiptNumber())
                    .pdfPath(pdfPath)
                    .build();

            receiptRepository.save(receipt);
        } catch (Exception e) {
            log.error("Error generating receipt", e);
            throw new RuntimeException("Failed to generate receipt", e);
        }
    }

    private String generateReceiptNumber() {
        String year = String.valueOf(Year.now().getValue());
        String prefix = "RCP" + year;
        
        int maxSeq = 0;
        List<FeeTransaction> transactions = feeTransactionRepository.findAll();
        
        for (FeeTransaction t : transactions) {
            if (t.getReceiptNumber().startsWith(prefix)) {
                try {
                    int seq = Integer.parseInt(t.getReceiptNumber().substring(7));
                    if (seq > maxSeq) {
                        maxSeq = seq;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid receipt numbers
                }
            }
        }
        
        int nextSeq = maxSeq + 1;
        return prefix + String.format("%06d", nextSeq);
    }

    private FeeTransactionDTO mapToDTO(FeeTransaction transaction) {
        return FeeTransactionDTO.builder()
                .id(transaction.getId())
                .studentId(transaction.getStudent().getId())
                .studentName(transaction.getStudent().getFirstName() + " " + transaction.getStudent().getLastName())
                .studentUid(transaction.getStudent().getStudentUid())
                .amount(transaction.getAmount())
                .paymentMode(transaction.getPaymentMode())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .receiptNumber(transaction.getReceiptNumber())
                .semester(transaction.getSemester())
                .status(transaction.getStatus())
                .paidAt(transaction.getPaidAt())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}

