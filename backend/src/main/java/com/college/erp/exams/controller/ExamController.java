package com.college.erp.exams.controller;

import com.college.erp.exams.dto.BulkUploadResponse;
import com.college.erp.exams.dto.CoursePerformanceDTO;
import com.college.erp.exams.dto.ExamStatisticsDTO;
import com.college.erp.exams.model.Attendance;
import com.college.erp.exams.model.Exam;
import com.college.erp.exams.service.ExamService;
import com.college.erp.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExamController {

    private final ExamService examService;
    private final FileStorageService fileStorageService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createExam(exam));
    }

    @GetMapping("/student/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL', 'STUDENT')")
    public ResponseEntity<List<Exam>> getStudentExams(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getStudentExams(id));
    }

    @GetMapping("/course/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<List<Exam>> getCourseExams(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getCourseExams(id));
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<Attendance> markAttendance(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam LocalDate date,
            @RequestParam String status) {
        Attendance.AttendanceStatus attendanceStatus = Attendance.AttendanceStatus.valueOf(status.toUpperCase());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(examService.markAttendance(studentId, courseId, date, attendanceStatus));
    }

    @GetMapping("/attendance/student/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL', 'STUDENT')")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getStudentAttendance(id));
    }

    @GetMapping("/attendance/course/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<List<Attendance>> getCourseAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getCourseAttendance(id));
    }

    // Statistics endpoints for Admin
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<com.college.erp.exams.dto.ExamStatisticsDTO> getExamStatistics() {
        return ResponseEntity.ok(examService.getExamStatistics());
    }

    @GetMapping("/performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<List<com.college.erp.exams.dto.CoursePerformanceDTO>> getCoursePerformance(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(examService.getCoursePerformance(courseId, semester));
    }

    @GetMapping("/attendance-overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<List<CoursePerformanceDTO>> getAttendanceOverview(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(examService.getAttendanceOverview(courseId, semester));
    }

    @GetMapping("/report/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<byte[]> generateExamReportPDF(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(defaultValue = "Performance") String reportType) {
        try {
            ExamStatisticsDTO statistics = examService.getExamStatistics();
            List<CoursePerformanceDTO> performance = examService.getCoursePerformance(courseId, semester);
            
            byte[] pdfBytes = fileStorageService.generateExamReportPDF(statistics, performance, reportType);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "exam_report_" + 
                    (courseId != null ? "course_" + courseId : "all") + 
                    (semester != null ? "_sem_" + semester : "") + "_" + 
                    java.time.LocalDate.now().toString() + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/bulk-upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<BulkUploadResponse> bulkUploadMarks(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate examDate) {
        try {
            BulkUploadResponse response = examService.bulkUploadMarks(file, courseId, semester, examDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            BulkUploadResponse errorResponse = BulkUploadResponse.builder()
                    .totalRecords(0)
                    .successCount(0)
                    .failureCount(0)
                    .errors(List.of("Error processing file: " + e.getMessage()))
                    .message("Bulk upload failed")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/results/organized")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL')")
    public ResponseEntity<List<Map<String, Object>>> getResultsOrganized(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(examService.getResultsByDepartmentYearSemester(courseId, semester, department));
    }

    @GetMapping("/student/{studentId}/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXAM_CELL', 'STUDENT')")
    public ResponseEntity<byte[]> generateStudentReport(@PathVariable Long studentId) {
        try {
            byte[] pdfBytes = examService.generateStudentReportPDF(studentId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "student_report_" + studentId + ".pdf");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

