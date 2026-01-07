from django.shortcuts import render
from django.http import HttpResponse
from circulation.models import Transaction
from catalog.models import Book
import pandas as pd
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.contrib.auth.decorators import login_required
from io import BytesIO

@login_required
def export_books_excel(request):
    if not request.user.is_admin():
        return HttpResponse("Unauthorized", status=401)
    
    books = Book.objects.all().values('title', 'isbn', 'author__name', 'category__name', 'copies_total', 'copies_available')
    df = pd.DataFrame(list(books))
    
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Books')
    
    output.seek(0)
    response = HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=books_inventory.xlsx'
    return response

@login_required
def export_transactions_pdf(request):
    if not request.user.is_admin():
        return HttpResponse("Unauthorized", status=401)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="transactions_report.pdf"'
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 750, "Library Transaction Report")
    
    p.setFont("Helvetica", 10)
    y = 700
    p.drawString(50, y, "Student")
    p.drawString(150, y, "Book")
    p.drawString(350, y, "Issue Date")
    p.drawString(450, y, "Status")
    p.line(50, y-5, 550, y-5)
    
    y -= 20
    transactions = Transaction.objects.all()[:20] # Top 20 for demo
    for t in transactions:
        if y < 50:
            p.showPage()
            y = 750
        p.drawString(50, y, str(t.user.username))
        p.drawString(150, y, str(t.book.title)[:40])
        p.drawString(350, y, t.issue_date.strftime('%Y-%m-%d'))
        p.drawString(450, y, str(t.status))
        y -= 15
        
    p.showPage()
    p.save()
    
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    return response
