package com.college.erp.exams.service;

import com.college.erp.exams.model.Attendance;
import com.college.erp.exams.model.Exam;
import com.college.erp.exams.repository.AttendanceRepository;
import com.college.erp.exams.repository.ExamRepository;
import com.college.erp.model.Course;
import com.college.erp.model.Student;
import com.college.erp.repository.CourseRepository;
import com.college.erp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.college.erp.exams.dto.BulkMarksUploadDTO;
import com.college.erp.exams.dto.BulkUploadResponse;
import com.college.erp.exams.dto.CoursePerformanceDTO;
import com.college.erp.exams.dto.ExamStatisticsDTO;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public Exam createExam(Exam exam) {
        Student student = studentRepository.findById(exam.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Course course = courseRepository.findById(exam.getCourse().getId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        exam.setStudent(student);
        exam.setCourse(course);
        
        // Calculate grade based on marks
        exam.setGrade(calculateGrade(exam.getMarks()));
        
        return examRepository.save(exam);
    }

    public List<Exam> getStudentExams(Long studentId) {
        return examRepository.findByStudentId(studentId);
    }

    public List<Exam> getCourseExams(Long courseId) {
        return examRepository.findByCourseId(courseId);
    }

    @Transactional
    public Attendance markAttendance(Long studentId, Long courseId, LocalDate date, Attendance.AttendanceStatus status) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Check if attendance already exists for this date
        List<Attendance> existing = attendanceRepository.findByStudentAndCourseAndDateRange(
                studentId, courseId, date, date);
        
        if (!existing.isEmpty()) {
            Attendance att = existing.get(0);
            att.setStatus(status);
            return attendanceRepository.save(att);
        }
        
        Attendance attendance = Attendance.builder()
                .student(student)
                .course(course)
                .date(date)
                .status(status)
                .build();
        
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getCourseAttendance(Long courseId) {
        return attendanceRepository.findByCourseId(courseId);
    }

    private String calculateGrade(BigDecimal marks) {
        if (marks.compareTo(new BigDecimal("90")) >= 0) return "A+";
        if (marks.compareTo(new BigDecimal("80")) >= 0) return "A";
        if (marks.compareTo(new BigDecimal("70")) >= 0) return "B+";
        if (marks.compareTo(new BigDecimal("60")) >= 0) return "B";
        if (marks.compareTo(new BigDecimal("50")) >= 0) return "C+";
        if (marks.compareTo(new BigDecimal("40")) >= 0) return "C";
        return "F";
    }

    // Statistics methods for Admin
    public ExamStatisticsDTO getExamStatistics() {
        long totalStudents = studentRepository.count();
        long totalExams = examRepository.count();
        
        // Count passed exams (marks >= 40)
        long passedExams = examRepository.findAll().stream()
                .filter(e -> e.getMarks().compareTo(new BigDecimal("40")) >= 0)
                .count();
        
        BigDecimal passPercentage = totalExams > 0
                ? new BigDecimal(passedExams).divide(new BigDecimal(totalExams), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        
        // Calculate average attendance
        long totalAttendanceRecords = attendanceRepository.count();
        long presentRecords = attendanceRepository.findAll().stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();
        
        BigDecimal attendancePercentage = totalAttendanceRecords > 0
                ? new BigDecimal(presentRecords).divide(new BigDecimal(totalAttendanceRecords), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        
        return ExamStatisticsDTO.builder()
                .totalStudents(totalStudents)
                .examsConducted(totalExams)
                .resultsPublished(totalExams) // All exams have results
                .pendingResults(0L) // Can be calculated based on business logic
                .averagePassPercentage(passPercentage.setScale(2, RoundingMode.HALF_UP))
                .averageAttendancePercentage(attendancePercentage.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    public List<CoursePerformanceDTO> getCoursePerformance(Long courseId, Integer semester) {
        List<Exam> exams;
        if (courseId != null && semester != null) {
            // Filter by course and semester
            List<Student> students = studentRepository.findByCourseAndSemester(courseId, semester);
            exams = examRepository.findAll().stream()
                    .filter(e -> e.getCourse().getId().equals(courseId) && 
                            students.contains(e.getStudent()))
                    .collect(Collectors.toList());
        } else if (courseId != null) {
            exams = examRepository.findByCourseId(courseId);
        } else {
            exams = examRepository.findAll();
        }
        
        // Group by course, semester, and subject
        Map<String, List<Exam>> grouped = exams.stream()
                .collect(Collectors.groupingBy(e -> 
                    e.getCourse().getId() + "_" + 
                    (e.getStudent().getSemester() != null ? e.getStudent().getSemester() : "0") + "_" + 
                    e.getSubjectName()));
        
        List<CoursePerformanceDTO> performance = new ArrayList<>();
        
        for (Map.Entry<String, List<Exam>> entry : grouped.entrySet()) {
            List<Exam> examList = entry.getValue();
            if (examList.isEmpty()) continue;
            
            Exam firstExam = examList.get(0);
            long total = examList.size();
            long passed = examList.stream()
                    .filter(e -> e.getMarks().compareTo(new BigDecimal("40")) >= 0)
                    .count();
            long failed = total - passed;
            
            BigDecimal avgMarks = examList.stream()
                    .map(Exam::getMarks)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(total), 2, RoundingMode.HALF_UP);
            
            BigDecimal passPercent = total > 0
                    ? new BigDecimal(passed).divide(new BigDecimal(total), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    : BigDecimal.ZERO;
            
            performance.add(CoursePerformanceDTO.builder()
                    .courseId(firstExam.getCourse().getId())
                    .courseName(firstExam.getCourse().getCourseName())
                    .semester(firstExam.getStudent().getSemester())
                    .subjectName(firstExam.getSubjectName())
                    .totalStudents((long) examList.stream().map(e -> e.getStudent().getId()).distinct().count())
                    .appeared(total)
                    .passed(passed)
                    .failed(failed)
                    .passPercentage(passPercent.setScale(2, RoundingMode.HALF_UP))
                    .averageMarks(avgMarks)
                    .build());
        }
        
        return performance;
    }

    public List<CoursePerformanceDTO> getAttendanceOverview(Long courseId, Integer semester) {
        List<Attendance> attendanceList;
        if (courseId != null) {
            attendanceList = attendanceRepository.findByCourseId(courseId);
        } else {
            attendanceList = attendanceRepository.findAll();
        }
        
        // Filter by semester if provided
        if (semester != null) {
            List<Long> studentIds = studentRepository.findBySemester(semester).stream()
                    .map(Student::getId)
                    .collect(Collectors.toList());
            attendanceList = attendanceList.stream()
                    .filter(a -> studentIds.contains(a.getStudent().getId()))
                    .collect(Collectors.toList());
        }
        
        // Group by course and semester
        Map<String, List<Attendance>> grouped = attendanceList.stream()
                .collect(Collectors.groupingBy(a -> 
                    a.getCourse().getId() + "_" + 
                    (a.getStudent().getSemester() != null ? a.getStudent().getSemester() : "0")));
        
        List<CoursePerformanceDTO> overview = new ArrayList<>();
        
        for (Map.Entry<String, List<Attendance>> entry : grouped.entrySet()) {
            List<Attendance> attList = entry.getValue();
            if (attList.isEmpty()) continue;
            
            Attendance first = attList.get(0);
            long total = attList.size();
            long present = attList.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                    .count();
            long absent = total - present;
            
            BigDecimal avgAttendance = total > 0
                    ? new BigDecimal(present).divide(new BigDecimal(total), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    : BigDecimal.ZERO;
            
            // Count students with low attendance (<75%)
            long lowAttendanceCount = attList.stream()
                    .collect(Collectors.groupingBy(a -> a.getStudent().getId()))
                    .values().stream()
                    .filter(studentAtts -> {
                        long studentPresent = studentAtts.stream()
                                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                                .count();
                        BigDecimal studentPercent = studentAtts.size() > 0
                                ? new BigDecimal(studentPresent).divide(new BigDecimal(studentAtts.size()), 4, RoundingMode.HALF_UP)
                                .multiply(new BigDecimal("100"))
                                : BigDecimal.ZERO;
                        return studentPercent.compareTo(new BigDecimal("75")) < 0;
                    })
                    .count();
            
            overview.add(CoursePerformanceDTO.builder()
                    .courseId(first.getCourse().getId())
                    .courseName(first.getCourse().getCourseName())
                    .semester(first.getStudent().getSemester())
                    .totalStudents((long) attList.stream().map(a -> a.getStudent().getId()).distinct().count())
                    .appeared(present)
                    .failed(absent)
                    .passPercentage(avgAttendance.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }
        
        return overview;
    }

    @Transactional
    public BulkUploadResponse bulkUploadMarks(MultipartFile file, Long courseId, Integer semester, LocalDate examDate) {
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        try {
            InputStream inputStream = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);

            // Skip header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    // Expected columns: Student UID, Subject Name, Marks
                    Cell studentUidCell = row.getCell(0);
                    Cell subjectCell = row.getCell(1);
                    Cell marksCell = row.getCell(2);

                    if (studentUidCell == null || subjectCell == null || marksCell == null) {
                        errors.add("Row " + (i + 1) + ": Missing required data");
                        failureCount++;
                        continue;
                    }

                    String studentUid = getCellValueAsString(studentUidCell);
                    String subjectName = getCellValueAsString(subjectCell);
                    BigDecimal marks = getCellValueAsBigDecimal(marksCell);

                    if (studentUid == null || studentUid.trim().isEmpty()) {
                        errors.add("Row " + (i + 1) + ": Student UID is required");
                        failureCount++;
                        continue;
                    }

                    if (subjectName == null || subjectName.trim().isEmpty()) {
                        errors.add("Row " + (i + 1) + ": Subject Name is required");
                        failureCount++;
                        continue;
                    }

                    if (marks == null || marks.compareTo(BigDecimal.ZERO) < 0 || marks.compareTo(new BigDecimal("100")) > 0) {
                        errors.add("Row " + (i + 1) + ": Invalid marks (must be 0-100)");
                        failureCount++;
                        continue;
                    }

                    // Find student by UID
                    Student student = studentRepository.findByStudentUid(studentUid.trim())
                            .orElse(null);
                    if (student == null) {
                        errors.add("Row " + (i + 1) + ": Student with UID " + studentUid + " not found");
                        failureCount++;
                        continue;
                    }

                    // Use courseId from parameter or student's course
                    Course course;
                    if (courseId != null) {
                        course = courseRepository.findById(courseId)
                                .orElse(null);
                        if (course == null) {
                            errors.add("Row " + (i + 1) + ": Course not found");
                            failureCount++;
                            continue;
                        }
                    } else {
                        course = student.getCourse();
                    }

                    // Use semester from parameter or student's semester
                    Integer studentSemester = semester != null ? semester : student.getSemester();

                    // Use examDate from parameter or current date
                    LocalDate examDateToUse = examDate != null ? examDate : LocalDate.now();

                    // Create exam record
                    Exam exam = Exam.builder()
                            .student(student)
                            .course(course)
                            .subjectName(subjectName.trim())
                            .marks(marks)
                            .examDate(examDateToUse)
                            .grade(calculateGrade(marks))
                            .build();

                    examRepository.save(exam);
                    successCount++;

                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                    failureCount++;
                }
            }

            workbook.close();
            inputStream.close();

        } catch (Exception e) {
            errors.add("File processing error: " + e.getMessage());
            failureCount++;
        }

        int totalRecords = successCount + failureCount;
        String message = String.format("Upload completed: %d successful, %d failed out of %d total records",
                successCount, failureCount, totalRecords);

        return BulkUploadResponse.builder()
                .totalRecords(totalRecords)
                .successCount(successCount)
                .failureCount(failureCount)
                .errors(errors)
                .message(message)
                .build();
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case NUMERIC:
                return BigDecimal.valueOf(cell.getNumericCellValue());
            case STRING:
                try {
                    return new BigDecimal(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return null;
                }
            default:
                return null;
        }
    }

    // Get results organized by Department, Year, Semester
    public List<Map<String, Object>> getResultsByDepartmentYearSemester(Long courseId, Integer semester, String department) {
        List<Exam> exams;
        
        if (courseId != null && semester != null) {
            List<Student> students = studentRepository.findByCourseAndSemester(courseId, semester);
            exams = examRepository.findAll().stream()
                    .filter(e -> e.getCourse().getId().equals(courseId) && 
                            students.contains(e.getStudent()))
                    .collect(Collectors.toList());
        } else if (courseId != null) {
            exams = examRepository.findByCourseId(courseId);
        } else {
            exams = examRepository.findAll();
        }

        // Filter by department if provided
        if (department != null && !department.isEmpty()) {
            exams = exams.stream()
                    .filter(e -> e.getCourse().getDepartment().equals(department))
                    .collect(Collectors.toList());
        }

        // Group by Department -> Year -> Semester -> Subject
        Map<String, Map<Integer, Map<Integer, Map<String, List<Exam>>>>> grouped = exams.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCourse().getDepartment(),
                        Collectors.groupingBy(
                                e -> {
                                    Integer sem = e.getStudent().getSemester();
                                    if (sem == null) return 1;
                                    int year = (int) Math.ceil(sem / 2.0);
                                    return year == 0 ? 1 : year;
                                },
                                Collectors.groupingBy(
                                        e -> e.getStudent().getSemester() != null ? e.getStudent().getSemester() : 0,
                                        Collectors.groupingBy(Exam::getSubjectName)
                                )
                        )
                ));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Map<Integer, Map<Integer, Map<String, List<Exam>>>>> deptEntry : grouped.entrySet()) {
            String dept = deptEntry.getKey();
            for (Map.Entry<Integer, Map<Integer, Map<String, List<Exam>>>> yearEntry : deptEntry.getValue().entrySet()) {
                Integer year = yearEntry.getKey();
                for (Map.Entry<Integer, Map<String, List<Exam>>> semEntry : yearEntry.getValue().entrySet()) {
                    Integer sem = semEntry.getKey();
                    for (Map.Entry<String, List<Exam>> subjectEntry : semEntry.getValue().entrySet()) {
                        String subject = subjectEntry.getKey();
                        List<Exam> examList = subjectEntry.getValue();
                        
                        Map<String, Object> record = new java.util.HashMap<>();
                        record.put("department", dept);
                        record.put("year", year);
                        record.put("semester", sem);
                        record.put("subject", subject);
                        record.put("courseName", examList.get(0).getCourse().getCourseName());
                        record.put("totalStudents", examList.stream().map(e -> e.getStudent().getId()).distinct().count());
                        record.put("totalExams", examList.size());
                        record.put("passed", examList.stream().filter(e -> e.getMarks().compareTo(new BigDecimal("40")) >= 0).count());
                        record.put("failed", examList.stream().filter(e -> e.getMarks().compareTo(new BigDecimal("40")) < 0).count());
                        record.put("averageMarks", examList.stream()
                                .map(Exam::getMarks)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(new BigDecimal(examList.size()), 2, RoundingMode.HALF_UP));
                        record.put("exams", examList);
                        result.add(record);
                    }
                }
            }
        }
        
        return result;
    }

    public byte[] generateStudentReportPDF(Long studentId) throws Exception {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Exam> exams = examRepository.findByStudentId(studentId);
        
        // Use iText to generate PDF
        com.itextpdf.text.Document document = new com.itextpdf.text.Document(com.itextpdf.text.PageSize.A4);
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
        com.itextpdf.text.pdf.PdfWriter.getInstance(document, baos);
        document.open();

        // Title
        com.itextpdf.text.Font titleFont = com.itextpdf.text.FontFactory.getFont(
                com.itextpdf.text.FontFactory.HELVETICA_BOLD, 20, com.itextpdf.text.BaseColor.BLACK);
        com.itextpdf.text.Paragraph title = new com.itextpdf.text.Paragraph("STUDENT EXAM REPORT", titleFont);
        title.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Student Info
        com.itextpdf.text.Font infoFont = com.itextpdf.text.FontFactory.getFont(
                com.itextpdf.text.FontFactory.HELVETICA, 12, com.itextpdf.text.BaseColor.BLACK);
        document.add(new com.itextpdf.text.Paragraph("Student UID: " + student.getStudentUid(), infoFont));
        document.add(new com.itextpdf.text.Paragraph("Name: " + student.getFirstName() + " " + student.getLastName(), infoFont));
        document.add(new com.itextpdf.text.Paragraph("Course: " + student.getCourse().getCourseName(), infoFont));
        document.add(new com.itextpdf.text.Paragraph("Semester: " + student.getSemester(), infoFont));
        document.add(new com.itextpdf.text.Paragraph(" "));

        // Results Table
        if (!exams.isEmpty()) {
            com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 2f, 1f, 1f, 1f});

            // Header
            com.itextpdf.text.Font headerFont = com.itextpdf.text.FontFactory.getFont(
                    com.itextpdf.text.FontFactory.HELVETICA_BOLD, 10);
            table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Subject", headerFont)));
            table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Exam Date", headerFont)));
            table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Marks", headerFont)));
            table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Grade", headerFont)));
            table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Status", headerFont)));

            // Data
            com.itextpdf.text.Font dataFont = com.itextpdf.text.FontFactory.getFont(
                    com.itextpdf.text.FontFactory.HELVETICA, 9);
            for (Exam exam : exams) {
                table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(exam.getSubjectName(), dataFont)));
                table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(exam.getExamDate().toString(), dataFont)));
                table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(exam.getMarks().toString(), dataFont)));
                table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(exam.getGrade() != null ? exam.getGrade() : "N/A", dataFont)));
                String status = exam.getMarks().compareTo(new BigDecimal("40")) >= 0 ? "PASS" : "FAIL";
                table.addCell(new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(status, dataFont)));
            }

            document.add(table);
        } else {
            document.add(new com.itextpdf.text.Paragraph("No exam records found.", infoFont));
        }

        document.close();
        return baos.toByteArray();
    }
}

