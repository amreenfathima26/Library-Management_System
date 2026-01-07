from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from accounts.models import CustomUser
from catalog.models import Book
from circulation.models import Transaction, Reservation
from django.db.models import Count, Sum
from django.utils import timezone

def home(request):
    import os
    from django.conf import settings
    image_path = os.path.join(settings.BASE_DIR, 'static', 'images', 'library_hero.png')
    context = {
        'static_image_exists': os.path.exists(image_path)
    }
    return render(request, 'index.html', context)

@login_required
def dashboard(request):
    user = request.user
    context = {'user': user, 'now': timezone.now()}
    
    if user.role == 'admin':
        context.update({
            'total_students': CustomUser.objects.filter(role='student').count(),
            'total_librarians': CustomUser.objects.filter(role='librarian').count(),
            'total_books': Book.objects.count(),
            'total_issued': Transaction.objects.filter(status='issued').count(),
            'recent_transactions': Transaction.objects.all().order_by('-issue_date')[:5],
        })
        return render(request, 'dashboard_admin.html', context)
        
    elif user.role == 'librarian':
        context.update({
            'total_books': Book.objects.count(),
            'pending_returns': Transaction.objects.filter(status='issued').count(),
            'today_issues': Transaction.objects.filter(issue_date__date=timezone.now().date()).count(),
            'recent_issues': Transaction.objects.filter(status='issued').order_by('-issue_date')[:10],
        })
        return render(request, 'dashboard_librarian.html', context)
        
    else: # Student
        my_transactions = Transaction.objects.filter(user=user).order_by('-issue_date')
        my_reservations = Reservation.objects.filter(user=user).order_by('-reservation_date')
        total_fine = Transaction.objects.filter(user=user).aggregate(Sum('fine_amount'))['fine_amount__sum'] or 0
        
        context.update({
            'my_issues': my_transactions.filter(status='issued'),
            'my_history': my_transactions.filter(status='returned')[:5],
            'my_reservations': my_reservations,
            'total_fine': total_fine,
        })
        return render(request, 'dashboard_student.html', context)
