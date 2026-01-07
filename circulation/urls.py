from django.urls import path
from . import views

urlpatterns = [
    path('issue/', views.issue_book, name='issue_book'),
    path('return/', views.return_book_view, name='return_book'),
    path('reserve/<int:book_id>/', views.reserve_book, name='reserve_book'),
]
