import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_system.settings')
try:
    django.setup()
except Exception as e:
    print(f"Setup error: {e}")

from catalog.models import Category, Author, Book
from accounts.models import CustomUser

def seed_data():
    # Create categories
    categories = ['Computer Science', 'Physics', 'Mathematics', 'Literature', 'History', 'Biology', 'Engineering', 'Fiction', 'Business']
    cat_objs = [Category.objects.get_or_create(name=name)[0] for name in categories]

    # Create authors
    authors = [
        'Robert C. Martin', 'Andrew Hunt', 'Donald Knuth', 'Richard Feynman', 
        'Stephen Hawking', 'Jane Austen', 'George Orwell', 'Charles Dickens',
        'Mark Twain', 'Leo Tolstoy', 'F. Scott Fitzgerald', 'Ernest Hemingway',
        'J.K. Rowling', 'George R.R. Martin', 'Agatha Christie'
    ]
    auth_objs = [Author.objects.get_or_create(name=name)[0] for name in authors]

    # Create 50+ books
    for i in range(55):
        title = f"Fundamental of {random.choice(categories)} Vol. {i+1}"
        isbn = f"978012345{i:03d}"
        
        # Avoid duplicate ISBNs if script is rerun
        if Book.objects.filter(isbn=isbn).exists():
            continue
            
        Book.objects.create(
            title=title,
            isbn=isbn,
            author=random.choice(auth_objs),
            category=random.choice(cat_objs),
            publication_year=random.randint(2000, 2024),
            copies_total=random.randint(5, 20),
            copies_available=random.randint(1, 10),
            location=f"Shelf {random.choice('ABCDE')}-{random.randint(1, 20)}"
        )
    
    print(f"Successfully ensured 50+ books in database.")

if __name__ == '__main__':
    seed_data()
