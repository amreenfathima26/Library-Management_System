from django.contrib import admin
from .models import Category, Author, Book

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'isbn', 'author', 'category', 'copies_available', 'copies_total')
    search_fields = ('title', 'isbn')
    list_filter = ('category', 'author')
