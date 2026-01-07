package com.college.erp.library.service;

import com.college.erp.library.model.LibraryBook;
import com.college.erp.library.model.LibraryTransaction;
import com.college.erp.library.repository.LibraryBookRepository;
import com.college.erp.library.repository.LibraryTransactionRepository;
import com.college.erp.model.Student;
import com.college.erp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryBookRepository bookRepository;
    private final LibraryTransactionRepository transactionRepository;
    private final StudentRepository studentRepository;
    
    private static final int MAX_ISSUE_DAYS = 14;
    private static final BigDecimal FINE_PER_DAY = new BigDecimal("10.00");

    public List<LibraryBook> getAllBooks() {
        return bookRepository.findAll();
    }

    public LibraryBook getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    @Transactional
    public LibraryBook createBook(LibraryBook book) {
        if (book.getIsbn() != null && bookRepository.findByIsbn(book.getIsbn()).isPresent()) {
            throw new RuntimeException("Book with ISBN already exists");
        }
        return bookRepository.save(book);
    }

    @Transactional
    public LibraryTransaction issueBook(Long bookId, Long studentId) {
        LibraryBook book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available");
        }
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Check if student has too many active issues (optional limit)
        List<LibraryTransaction> activeIssues = transactionRepository.findActiveIssuesByStudentId(studentId);
        if (activeIssues.size() >= 5) {
            throw new RuntimeException("Student has reached maximum issue limit");
        }
        
        // Create transaction
        LibraryTransaction transaction = LibraryTransaction.builder()
                .book(book)
                .student(student)
                .issuedDate(LocalDate.now())
                .status(LibraryTransaction.TransactionStatus.ISSUED)
                .fineAmount(BigDecimal.ZERO)
                .build();
        
        // Save transaction first
        transaction = transactionRepository.save(transaction);
        
        // Update book availability
        int newAvailableQuantity = book.getAvailableQuantity() - 1;
        if (newAvailableQuantity < 0) {
            throw new RuntimeException("Book availability cannot be negative");
        }
        book.setAvailableQuantity(newAvailableQuantity);
        bookRepository.save(book);
        
        // Flush to ensure database is updated immediately
        transactionRepository.flush();
        bookRepository.flush();
        
        return transaction;
    }

    @Transactional
    public LibraryTransaction returnBook(Long transactionId) {
        LibraryTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (transaction.getStatus() == LibraryTransaction.TransactionStatus.RETURNED) {
            throw new RuntimeException("Book already returned");
        }
        
        // Set return date and status
        transaction.setReturnDate(LocalDate.now());
        transaction.setStatus(LibraryTransaction.TransactionStatus.RETURNED);
        
        // Calculate fine if overdue
        long daysSinceIssue = ChronoUnit.DAYS.between(transaction.getIssuedDate(), LocalDate.now());
        long daysOverdue = daysSinceIssue - MAX_ISSUE_DAYS;
        if (daysOverdue > 0) {
            BigDecimal fine = FINE_PER_DAY.multiply(BigDecimal.valueOf(daysOverdue));
            transaction.setFineAmount(fine);
        } else {
            transaction.setFineAmount(BigDecimal.ZERO);
        }
        
        // Save transaction
        transaction = transactionRepository.save(transaction);
        
        // Update book availability
        LibraryBook book = transaction.getBook();
        if (book == null) {
            throw new RuntimeException("Book not found in transaction");
        }
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookRepository.save(book);
        
        // Flush to ensure database is updated immediately
        transactionRepository.flush();
        bookRepository.flush();
        
        return transaction;
    }

    @Transactional(readOnly = true)
    public List<LibraryTransaction> getStudentTransactions(Long studentId) {
        return transactionRepository.findByStudentIdWithDetails(studentId);
    }

    @Transactional(readOnly = true)
    public List<LibraryTransaction> getActiveIssues(Long studentId) {
        return transactionRepository.findActiveIssuesByStudentIdWithDetails(studentId);
    }

    @Transactional
    public LibraryBook updateBook(Long id, LibraryBook bookData) {
        LibraryBook book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        // Check ISBN uniqueness if changed
        if (bookData.getIsbn() != null && !bookData.getIsbn().equals(book.getIsbn())) {
            if (bookRepository.findByIsbn(bookData.getIsbn()).isPresent()) {
                throw new RuntimeException("Book with ISBN already exists");
            }
        }
        
        book.setTitle(bookData.getTitle());
        book.setAuthor(bookData.getAuthor());
        book.setIsbn(bookData.getIsbn());
        book.setBranch(bookData.getBranch());
        book.setSubject(bookData.getSubject());
        book.setCategory(bookData.getCategory());
        
        // Update quantity - adjust available quantity accordingly
        int quantityDiff = bookData.getQuantity() - book.getQuantity();
        book.setQuantity(bookData.getQuantity());
        book.setAvailableQuantity(book.getAvailableQuantity() + quantityDiff);
        
        if (book.getAvailableQuantity() < 0) {
            book.setAvailableQuantity(0);
        }
        
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        LibraryBook book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        // Check if book has active issues
        List<LibraryTransaction> activeIssues = transactionRepository.findByBookIdAndStatus(
                id, LibraryTransaction.TransactionStatus.ISSUED);
        if (!activeIssues.isEmpty()) {
            throw new RuntimeException("Cannot delete book with active issues");
        }
        
        bookRepository.delete(book);
    }

    @Transactional(readOnly = true)
    public List<LibraryTransaction> getAllTransactions() {
        return transactionRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public List<LibraryTransaction> getIssuedBooks() {
        return transactionRepository.findByStatus(LibraryTransaction.TransactionStatus.ISSUED);
    }

    @Transactional(readOnly = true)
    public List<LibraryTransaction> getOverdueBooks() {
        LocalDate today = LocalDate.now();
        List<LibraryTransaction> issued = transactionRepository.findByStatus(LibraryTransaction.TransactionStatus.ISSUED);
        
        return issued.stream()
                .filter(t -> {
                    long daysSinceIssue = ChronoUnit.DAYS.between(t.getIssuedDate(), today);
                    return daysSinceIssue > MAX_ISSUE_DAYS;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.Map<String, Object> getFinesSummary() {
        List<LibraryTransaction> overdue = getOverdueBooks();
        BigDecimal totalFines = overdue.stream()
                .map(t -> {
                    long daysOverdue = ChronoUnit.DAYS.between(t.getIssuedDate(), LocalDate.now()) - MAX_ISSUE_DAYS;
                    return FINE_PER_DAY.multiply(BigDecimal.valueOf(Math.max(0, daysOverdue)));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal collectedFines = transactionRepository.findAll().stream()
                .filter(t -> t.getFineAmount() != null && t.getFineAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(LibraryTransaction::getFineAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("overdueCount", overdue.size());
        summary.put("totalPendingFines", totalFines);
        summary.put("totalCollectedFines", collectedFines);
        summary.put("totalFines", totalFines.add(collectedFines));
        return summary;
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getInventoryHealth() {
        List<LibraryBook> allBooks = bookRepository.findAll();
        
        // Calculate statistics
        int totalBooks = allBooks.size();
        int totalQuantity = allBooks.stream()
                .mapToInt(b -> b.getQuantity() != null ? b.getQuantity() : 0)
                .sum();
        int availableQuantity = allBooks.stream()
                .mapToInt(b -> b.getAvailableQuantity() != null ? b.getAvailableQuantity() : 0)
                .sum();
        int issuedQuantity = totalQuantity - availableQuantity;
        
        // Categorize books
        List<LibraryBook> healthyBooks = allBooks.stream()
                .filter(b -> b.getAvailableQuantity() != null && b.getAvailableQuantity() > 2)
                .collect(Collectors.toList());
        
        List<LibraryBook> lowStockBooks = allBooks.stream()
                .filter(b -> b.getAvailableQuantity() != null && 
                        b.getAvailableQuantity() > 0 && 
                        b.getAvailableQuantity() <= 2)
                .collect(Collectors.toList());
        
        List<LibraryBook> outOfStockBooks = allBooks.stream()
                .filter(b -> b.getAvailableQuantity() == null || b.getAvailableQuantity() == 0)
                .collect(Collectors.toList());
        
        // Calculate utilization rate
        double utilizationRate = totalQuantity > 0 
                ? ((double) issuedQuantity / totalQuantity) * 100.0 
                : 0.0;
        
        // Build response
        java.util.Map<String, Object> health = new java.util.HashMap<>();
        health.put("totalBooks", totalBooks);
        health.put("totalQuantity", totalQuantity);
        health.put("availableQuantity", availableQuantity);
        health.put("issuedQuantity", issuedQuantity);
        health.put("utilizationRate", Math.round(utilizationRate * 10.0) / 10.0); // Round to 1 decimal
        health.put("healthyBooksCount", healthyBooks.size());
        health.put("lowStockBooksCount", lowStockBooks.size());
        health.put("outOfStockBooksCount", outOfStockBooks.size());
        health.put("lowStockBooks", lowStockBooks);
        health.put("outOfStockBooks", outOfStockBooks);
        
        return health;
    }
}

