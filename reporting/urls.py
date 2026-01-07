from django.urls import path
from . import views

urlpatterns = [
    path('export/books/excel/', views.export_books_excel, name='export_books_excel'),
    path('export/transactions/pdf/', views.export_transactions_pdf, name='export_transactions_pdf'),
]
