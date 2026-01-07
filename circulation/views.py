from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import Transaction, Reservation
from .forms import IssueBookForm, ReturnBookForm
from catalog.models import Book
from django.contrib import messages

@login_required
def reserve_book(request, book_id):
    if not request.user.is_student():
        messages.error(request, "Only students can reserve books.")
        return redirect('book_list')
    
    book = get_object_or_404(Book, id=book_id)
    
    # Check if already reserved by this user
    existing = Reservation.objects.filter(user=request.user, book=book, status='active').exists()
    if existing:
        messages.warning(request, f"You have already reserved '{book.title}'.")
    else:
        Reservation.objects.create(user=request.user, book=book)
        messages.success(request, f"Successfully reserved '{book.title}'.")
        
    return redirect('dashboard')


@login_required
def issue_book(request):
    if not (request.user.is_librarian() or request.user.is_admin()):
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = IssueBookForm(request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            book = transaction.book
            if book.copies_available > 0:
                book.copies_available -= 1
                book.save()
                transaction.save()
                return redirect('dashboard')
            else:
                form.add_error('book', 'This book is not available.')
    else:
        form = IssueBookForm()
    
    return render(request, 'circulation/issue_book.html', {'form': form})

@login_required
def return_book_view(request, transaction_id=None):
    if not (request.user.is_librarian() or request.user.is_admin()):
        return redirect('dashboard')
    
    if request.method == 'POST':
        transaction_id = request.POST.get('transaction_id')
        transaction = get_object_or_404(Transaction, id=transaction_id, status='issued')
        
        # Calculate fine before saving return
        transaction.return_date = timezone.now()
        fine = transaction.calculate_fine()
        transaction.fine_amount = fine
        transaction.status = 'returned'
        
        # Update book availability
        book = transaction.book
        book.copies_available += 1
        book.save()
        
        transaction.save()
        return render(request, 'circulation/return_success.html', {'transaction': transaction, 'fine': fine})
    
    # List all issued transactions for the librarian to choose from
    issued_transactions = Transaction.objects.filter(status='issued').select_related('user', 'book')
    return render(request, 'circulation/return_book.html', {'transactions': issued_transactions, 'now': timezone.now()})
