# Smart Library System

**Author**: Amreen Fathima
**Project**: Final Year B.Tech Project

## Overview
The Smart Library System is a comprehensive web-based application designed to manage library operations efficiently. Built with Django (Python), it streamlines catalog management, book circulation, and member interactions.

## Features

### 1. User Roles & Authentication
- **Students**: Can browse books, view their issue history, and check their dashboard.
- **Librarians**: Manage books, issue/return books, and view reports.
- **Admin**: Full control over the system, including user management.

### 2. Catalog Management
- Add, update, and delete books.
- Categorize books by genre, author, and language.
- "seed_books.py" script available to populate the database with sample data.

### 3. Circulation System
- **Issue Books**: Librarians can issue books to students.
- **Return Books**: Track returns and calculate fines (if any).
- **History**: detailed history of all transactions.

### 4. Reporting & Dashboard
- Visual dashboards for Students and Librarians.
- Stats on total books, books issued, and active members.

## Technical Stack
- **Backend**: Django (Python)
- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Deployment**: Vercel Ready

## Project Structure
- `library_system/`: Main project settings and configuration.
- `accounts/`: User authentication and profile management.
- `catalog/`: Book management logic.
- `circulation/`: Issue and return logic.
- `reporting/`: Analytics and views.
- `templates/`: HTML templates for all pages.
- `static/`: CSS, JS, and image assets.

## Local Setup
1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. **Run Setup Script**:
   ```bash
   setup.bat
   ```
   *Alternatively, install requirements manually:*
   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

3. **Run the Server**:
   ```bash
   run.bat
   ```
   or
   ```bash
   python manage.py runserver
   ```

4. **Access the App**:
   Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

## Deployment
This project is configured for deployment on Vercel. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
