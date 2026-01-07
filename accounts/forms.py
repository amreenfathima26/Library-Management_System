from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'role', 'enrollment_no', 'phone')

    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        enrollment_no = cleaned_data.get('enrollment_no')

        if role == 'student' and not enrollment_no:
            self.add_error('enrollment_no', 'Enrollment number is required for students.')
        
        return cleaned_data
