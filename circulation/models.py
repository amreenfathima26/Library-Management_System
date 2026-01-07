from django.db import models
from django.conf import settings
from catalog.models import Book
from django.utils import timezone
from datetime import timedelta

def get_due_date():
    return timezone.now() + timedelta(days=14)

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('issued', 'Issued'),
        ('returned', 'Returned'),
        ('lost', 'Lost'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(default=get_due_date)
    return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='issued')
    fine_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    def calculate_fine(self):
        if self.return_date and self.return_date > self.due_date:
            overdue_days = (self.return_date - self.due_date).days
            # Fine logic: 10 units per day
            return overdue_days * 10
        elif not self.return_date and timezone.now() > self.due_date:
             overdue_days = (timezone.now() - self.due_date).days
             return overdue_days * 10
        return 0

    def save(self, *args, **kwargs):
        if self.status == 'returned' and not self.return_date:
            self.return_date = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.status})"

class Reservation(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    reservation_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"Reservation: {self.user.username} - {self.book.title}"
