from django import forms
from .models import Transaction
from accounts.models import CustomUser
from catalog.models import Book

class IssueBookForm(forms.ModelForm):
    # Filter users to only students
    user = forms.ModelChoiceField(queryset=CustomUser.objects.filter(role='student'), label="Student")
    # Filter books to only available ones, actually we should handle this in view to show all but validate availability
    book = forms.ModelChoiceField(queryset=Book.objects.filter(copies_available__gt=0), label="Available Book")

    class Meta:
        model = Transaction
        fields = ['user', 'book']

class ReturnBookForm(forms.Form):
    transaction_id = forms.IntegerField(label="Transaction ID", widget=forms.TextInput(attrs={'class': 'form-control'}))
