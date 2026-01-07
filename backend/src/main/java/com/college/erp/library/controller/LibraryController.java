package com.college.erp.library.controller;

import com.college.erp.library.model.LibraryBook;
import com.college.erp.library.model.LibraryTransaction;
import com.college.erp.library.service.LibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping("/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'STUDENT')")
    public ResponseEntity<List<LibraryBook>> getAllBooks() {
        return ResponseEntity.ok(libraryService.getAllBooks());
    }

    @PostMapping("/books")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<LibraryBook> createBook(@RequestBody LibraryBook book) {
        return ResponseEntity.status(HttpStatus.CREATED).body(libraryService.createBook(book));
    }

    @GetMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'STUDENT')")
    public ResponseEntity<LibraryBook> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(libraryService.getBookById(id));
    }

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<LibraryTransaction> issueBook(
            @RequestParam Long bookId,
            @RequestParam Long studentId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(libraryService.issueBook(bookId, studentId));
    }

    @PostMapping("/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<LibraryTransaction> returnBook(@RequestParam Long transactionId) {
        return ResponseEntity.ok(libraryService.returnBook(transactionId));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'STUDENT')")
    public ResponseEntity<List<LibraryTransaction>> getStudentTransactions(@PathVariable Long studentId) {
        return ResponseEntity.ok(libraryService.getStudentTransactions(studentId));
    }

    @GetMapping("/student/{studentId}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'STUDENT')")
    public ResponseEntity<List<LibraryTransaction>> getActiveIssues(@PathVariable Long studentId) {
        return ResponseEntity.ok(libraryService.getActiveIssues(studentId));
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<LibraryBook> updateBook(
            @PathVariable Long id,
            @RequestBody LibraryBook book) {
        return ResponseEntity.ok(libraryService.updateBook(id, book));
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        libraryService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<LibraryTransaction>> getAllTransactions() {
        return ResponseEntity.ok(libraryService.getAllTransactions());
    }

    @GetMapping("/transactions/issued")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<LibraryTransaction>> getIssuedBooks() {
        return ResponseEntity.ok(libraryService.getIssuedBooks());
    }

    @GetMapping("/transactions/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<LibraryTransaction>> getOverdueBooks() {
        return ResponseEntity.ok(libraryService.getOverdueBooks());
    }

    @GetMapping("/fines/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<java.util.Map<String, Object>> getFinesSummary() {
        return ResponseEntity.ok(libraryService.getFinesSummary());
    }

    @GetMapping("/inventory/health")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<java.util.Map<String, Object>> getInventoryHealth() {
        return ResponseEntity.ok(libraryService.getInventoryHealth());
    }
}

