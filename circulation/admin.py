from django.contrib import admin
from .models import Transaction, Reservation

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'issue_date', 'due_date', 'status', 'fine_amount')
    list_filter = ('status', 'issue_date')
    search_fields = ('user__username', 'book__title')

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'reservation_date', 'status')
    list_filter = ('status',)
