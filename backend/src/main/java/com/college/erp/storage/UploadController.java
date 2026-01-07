package com.college.erp.storage;

import com.college.erp.students.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UploadController {

    private final FileStorageService fileStorageService;
    private final StudentService studentService;

    @PostMapping("/student/{id}/photo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS')")
    public ResponseEntity<Map<String, String>> uploadStudentPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String photoPath = fileStorageService.storeStudentPhoto(file, id);
            studentService.updateStudentPhoto(id, photoPath);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Photo uploaded successfully");
            response.put("photoPath", photoPath);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload photo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/student/{id}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS')")
    public ResponseEntity<Map<String, String>> uploadStudentDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType) {
        try {
            String documentPath = fileStorageService.storeStudentDocument(file, id, documentType);
            studentService.addStudentDocument(id, documentPath, documentType);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Document uploaded successfully");
            response.put("documentPath", documentPath);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload document: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/student/{id}/photo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS', 'ACCOUNTS', 'HOSTEL_WARDEN', 'LIBRARIAN', 'EXAM_CELL', 'STUDENT')")
    public ResponseEntity<byte[]> getStudentPhoto(@PathVariable Long id) {
        try {
            return fileStorageService.getStudentPhoto(id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/student/{id}/documents/{documentType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMISSIONS', 'ACCOUNTS', 'HOSTEL_WARDEN', 'LIBRARIAN', 'EXAM_CELL', 'STUDENT')")
    public ResponseEntity<byte[]> getStudentDocument(
            @PathVariable Long id,
            @PathVariable String documentType) {
        try {
            return fileStorageService.getStudentDocument(id, documentType);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/receipt/{receiptNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTS', 'STUDENT')")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable String receiptNumber) {
        try {
            return fileStorageService.getReceiptPDF(receiptNumber);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}

