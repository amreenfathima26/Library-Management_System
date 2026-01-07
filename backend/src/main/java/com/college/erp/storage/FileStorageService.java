package com.college.erp.storage;

import com.college.erp.exams.dto.CoursePerformanceDTO;
import com.college.erp.exams.dto.ExamStatisticsDTO;
import com.college.erp.fees.model.FeeTransaction;
import com.college.erp.fees.model.Receipt;
import com.college.erp.fees.repository.ReceiptRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.DocumentException;
import lombok.extern.slf4j.Slf4j;
import com.college.erp.model.Student;
import com.college.erp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileStorageService {

    private final StudentRepository studentRepository;
    private final ReceiptRepository receiptRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.student-photos}")
    private String studentPhotosDir;

    @Value("${file.student-documents}")
    private String studentDocumentsDir;

    @Value("${file.receipts}")
    private String receiptsDir;

    public String storeStudentPhoto(MultipartFile file, Long studentId) throws IOException {
        createDirectoryIfNotExists(studentPhotosDir);
        String fileName = "student_" + studentId + "_" + System.currentTimeMillis() + 
                         getFileExtension(file.getOriginalFilename());
        Path targetLocation = Paths.get(studentPhotosDir).resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return targetLocation.toString();
    }

    public String storeStudentDocument(MultipartFile file, Long studentId, String documentType) throws IOException {
        createDirectoryIfNotExists(studentDocumentsDir);
        String fileName = "student_" + studentId + "_" + documentType + "_" + 
                         System.currentTimeMillis() + getFileExtension(file.getOriginalFilename());
        Path targetLocation = Paths.get(studentDocumentsDir).resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return targetLocation.toString();
    }

    public String generateReceiptPDF(FeeTransaction transaction) throws IOException, DocumentException {
        createDirectoryIfNotExists(receiptsDir);
        String fileName = "receipt_" + transaction.getReceiptNumber() + ".pdf";
        Path filePath = Paths.get(receiptsDir).resolve(fileName);

        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(filePath.toFile()));
        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.BLACK);
        Paragraph title = new Paragraph("FEE PAYMENT RECEIPT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Receipt Details Table
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(20);

        addTableRow(table, "Receipt Number:", transaction.getReceiptNumber());
        addTableRow(table, "Student UID:", transaction.getStudent().getStudentUid());
        addTableRow(table, "Student Name:", 
                   transaction.getStudent().getFirstName() + " " + transaction.getStudent().getLastName());
        addTableRow(table, "Amount:", "₹" + transaction.getAmount());
        addTableRow(table, "Payment Mode:", transaction.getPaymentMode().name());
        addTableRow(table, "Semester:", String.valueOf(transaction.getSemester()));
        if (transaction.getPaidAt() != null) {
            addTableRow(table, "Paid At:", 
                       transaction.getPaidAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")));
        }

        document.add(table);
        document.close();

        return filePath.toString();
    }

    private void addTableRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
        labelCell.setBorder(Rectangle.NO_BORDER);
        PdfPCell valueCell = new PdfPCell(new Phrase(value));
        valueCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void createDirectoryIfNotExists(String directory) {
        File dir = new File(directory);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot) : "";
    }

    public byte[] getFileAsBytes(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        return Files.readAllBytes(path);
    }

    public ResponseEntity<byte[]> getStudentPhoto(Long studentId) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (student.getPhotoPath() == null || student.getPhotoPath().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        byte[] imageBytes = Files.readAllBytes(Paths.get(student.getPhotoPath()));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }

    public ResponseEntity<byte[]> getStudentDocument(Long studentId, String documentType) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (student.getDocumentsPath() == null || student.getDocumentsPath().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        // Parse documents JSON
        String docsJson = student.getDocumentsPath();
        String documentPath = extractDocumentPath(docsJson, documentType);
        
        if (documentPath == null || documentPath.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        byte[] fileBytes = Files.readAllBytes(Paths.get(documentPath));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", documentType + ".pdf");
        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }

    private String extractDocumentPath(String json, String documentType) {
        // Simple JSON parsing
        if (json == null || json.isEmpty()) return null;
        json = json.replace("{", "").replace("}", "").replace("\"", "");
        String[] pairs = json.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            if (keyValue.length == 2 && keyValue[0].trim().equals(documentType)) {
                return keyValue[1].trim();
            }
        }
        return null;
    }

    public ResponseEntity<byte[]> getReceiptPDF(String receiptNumber) throws IOException {
        Receipt receipt = receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new RuntimeException("Receipt not found"));
        
        if (receipt.getPdfPath() == null || receipt.getPdfPath().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        byte[] fileBytes = Files.readAllBytes(Paths.get(receipt.getPdfPath()));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "receipt_" + receiptNumber + ".pdf");
        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }

    public byte[] generateExamReportPDF(
            ExamStatisticsDTO statistics,
            List<CoursePerformanceDTO> performance,
            String reportType) throws IOException, DocumentException {
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);
        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.BLACK);
        Paragraph title = new Paragraph("EXAM REPORT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        // Report Date
        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
        Paragraph date = new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")), dateFont);
        date.setAlignment(Element.ALIGN_CENTER);
        date.setSpacingAfter(20);
        document.add(date);

        // Statistics Section
        if (statistics != null) {
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph sectionTitle = new Paragraph("Statistics Overview", sectionFont);
            sectionTitle.setSpacingBefore(10);
            sectionTitle.setSpacingAfter(10);
            document.add(sectionTitle);

            PdfPTable statsTable = new PdfPTable(2);
            statsTable.setWidthPercentage(100);
            statsTable.setSpacingBefore(10);

            addTableRow(statsTable, "Total Students:", String.valueOf(statistics.getTotalStudents()));
            addTableRow(statsTable, "Exams Conducted:", String.valueOf(statistics.getExamsConducted()));
            addTableRow(statsTable, "Results Published:", String.valueOf(statistics.getResultsPublished()));
            addTableRow(statsTable, "Pending Results:", String.valueOf(statistics.getPendingResults()));
            addTableRow(statsTable, "Average Pass %:", statistics.getAveragePassPercentage() + "%");
            addTableRow(statsTable, "Average Attendance %:", statistics.getAverageAttendancePercentage() + "%");

            document.add(statsTable);
            document.add(new Paragraph(" ")); // Spacing
        }

        // Performance Section
        if (performance != null && !performance.isEmpty()) {
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph sectionTitle = new Paragraph("Course Performance", sectionFont);
            sectionTitle.setSpacingBefore(10);
            sectionTitle.setSpacingAfter(10);
            document.add(sectionTitle);

            PdfPTable perfTable = new PdfPTable(7);
            perfTable.setWidthPercentage(100);
            perfTable.setSpacingBefore(10);
            perfTable.setWidths(new float[]{2f, 1f, 2f, 1f, 1f, 1f, 1.5f});

            // Header row
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            addTableHeader(perfTable, "Course", headerFont);
            addTableHeader(perfTable, "Semester", headerFont);
            addTableHeader(perfTable, "Subject", headerFont);
            addTableHeader(perfTable, "Appeared", headerFont);
            addTableHeader(perfTable, "Passed", headerFont);
            addTableHeader(perfTable, "Failed", headerFont);
            addTableHeader(perfTable, "Pass %", headerFont);

            // Data rows
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (CoursePerformanceDTO item : performance) {
                perfTable.addCell(new PdfPCell(new Phrase(item.getCourseName() != null ? item.getCourseName() : "N/A", dataFont)));
                perfTable.addCell(new PdfPCell(new Phrase(item.getSemester() != null ? String.valueOf(item.getSemester()) : "N/A", dataFont)));
                perfTable.addCell(new PdfPCell(new Phrase(item.getSubjectName() != null ? item.getSubjectName() : "N/A", dataFont)));
                perfTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getAppeared()), dataFont)));
                perfTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getPassed() != null ? item.getPassed() : 0), dataFont)));
                perfTable.addCell(new PdfPCell(new Phrase(String.valueOf(item.getFailed() != null ? item.getFailed() : 0), dataFont)));
                perfTable.addCell(new PdfPCell(new Phrase(item.getPassPercentage() != null ? item.getPassPercentage() + "%" : "0%", dataFont)));
            }

            document.add(perfTable);
        } else {
            Paragraph noData = new Paragraph("No performance data available.", 
                    FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.GRAY));
            noData.setSpacingBefore(10);
            document.add(noData);
        }

        document.close();
        return baos.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }
}

