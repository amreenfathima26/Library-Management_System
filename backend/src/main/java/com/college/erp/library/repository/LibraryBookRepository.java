package com.college.erp.library.repository;

import com.college.erp.library.model.LibraryBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryBookRepository extends JpaRepository<LibraryBook, Long> {
    Optional<LibraryBook> findByIsbn(String isbn);
    List<LibraryBook> findByTitleContainingIgnoreCase(String title);
    List<LibraryBook> findByAuthorContainingIgnoreCase(String author);
    List<LibraryBook> findByAvailableQuantityGreaterThan(int quantity);
    List<LibraryBook> findByBranch(String branch);
    List<LibraryBook> findBySubject(String subject);
    List<LibraryBook> findByCategory(String category);
    List<LibraryBook> findByBranchAndSubject(String branch, String subject);
    List<LibraryBook> findByBranchAndCategory(String branch, String category);
    List<LibraryBook> findBySubjectAndCategory(String subject, String category);
    List<LibraryBook> findByBranchAndSubjectAndCategory(String branch, String subject, String category);
}

