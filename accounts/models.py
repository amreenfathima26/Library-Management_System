from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('librarian', 'Librarian'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    enrollment_no = models.CharField(max_length=20, blank=True, null=True, unique=True, help_text="Required for students")
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def is_admin(self):
        return self.role == 'admin'
    
    def is_librarian(self):
        return self.role == 'librarian'
    
    def is_student(self):
        return self.role == 'student'
