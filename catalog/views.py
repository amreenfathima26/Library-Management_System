from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Book
from .forms import BookForm
from django.db.models import Q

def book_list(request):
    query = request.GET.get('q')
    if query:
        books = Book.objects.filter(
            Q(title__icontains=query) | 
            Q(author__name__icontains=query) | 
            Q(category__name__icontains=query)
        )
    else:
        books = Book.objects.all()
    return render(request, 'catalog/book_list.html', {'books': books})

@login_required
def add_book(request):
    if not (request.user.is_librarian() or request.user.is_admin()):
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES)
        if form.is_valid():
            book = form.save(commit=False)
            book.copies_available = book.copies_total # Initialize available copies
            book.save()
            return redirect('book_list')
    else:
        form = BookForm()
    return render(request, 'catalog/book_form.html', {'form': form})
