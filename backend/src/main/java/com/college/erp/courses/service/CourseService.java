package com.college.erp.courses.service;

import com.college.erp.courses.dto.CourseCreateRequest;
import com.college.erp.courses.dto.CourseDTO;
import com.college.erp.courses.dto.CourseUpdateRequest;
import com.college.erp.model.Course;
import com.college.erp.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        System.out.println("📚 Total courses found in database: " + courses.size());
        courses.forEach(course -> {
            System.out.println("  - Course ID: " + course.getId() + ", Name: " + course.getCourseName() + ", Department: " + course.getDepartment());
        });
        
        List<CourseDTO> courseDTOs = courses.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        System.out.println("✅ Returning " + courseDTOs.size() + " courses as DTOs");
        return courseDTOs;
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        return mapToDTO(course);
    }

    public List<CourseDTO> getCoursesByDepartment(String department) {
        return courseRepository.findByDepartment(department).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseDTO createCourse(CourseCreateRequest request) {
        // Check if course with same name already exists
        courseRepository.findAll().stream()
                .filter(c -> c.getCourseName().equalsIgnoreCase(request.getCourseName()))
                .findFirst()
                .ifPresent(c -> {
                    throw new RuntimeException("Course with name '" + request.getCourseName() + "' already exists");
                });

        Course course = Course.builder()
                .courseName(request.getCourseName())
                .department(request.getDepartment())
                .durationYears(request.getDurationYears())
                .feePerSemester(request.getFeePerSemester())
                .build();

        course = courseRepository.save(course);
        return mapToDTO(course);
    }

    @Transactional
    public CourseDTO updateCourse(Long id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Check if another course with same name exists (excluding current course)
        courseRepository.findAll().stream()
                .filter(c -> c.getCourseName().equalsIgnoreCase(request.getCourseName()))
                .filter(c -> !c.getId().equals(id))
                .findFirst()
                .ifPresent(c -> {
                    throw new RuntimeException("Course with name '" + request.getCourseName() + "' already exists");
                });

        course.setCourseName(request.getCourseName());
        course.setDepartment(request.getDepartment());
        course.setDurationYears(request.getDurationYears());
        course.setFeePerSemester(request.getFeePerSemester());

        course = courseRepository.save(course);
        return mapToDTO(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Check if any students are enrolled in this course
        // This would require checking the students table
        // For now, we'll allow deletion but in production you might want to add this check
        
        courseRepository.delete(course);
    }

    private CourseDTO mapToDTO(Course course) {
        return CourseDTO.builder()
                .id(course.getId())
                .courseName(course.getCourseName())
                .department(course.getDepartment())
                .durationYears(course.getDurationYears())
                .feePerSemester(course.getFeePerSemester())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}

