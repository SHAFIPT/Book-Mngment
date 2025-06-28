# 📚 BookVault — Full-Stack Book Management System

A production-ready MERN (MongoDB, Express, React, Node.js) application designed to manage books, users, purchases, and analytics with role-based access (Admin, Author, Retail). Built with a scalable architecture, clean code practices, and thoughtful UX.

---

## 🌐 Live Demo

- **Frontend (Vercel)**: [https://book-mngment.vercel.app](https://book-mngment.vercel.app/)
- **Backend (Render)**: [https://book-mngment.onrender.com](https://book-mngment.onrender.com)

---

## 🧠 Project Overview

### 👥 Roles Supported
- **Admin**: Manage users, view all books, sales, and send bulk notifications.
- **Author**: Publish books, view sales, receive purchase notifications.
- **Retail User**: Browse books, purchase, and view personal history.

### 🔐 Auth Flow
- JWT-based access control with **refresh tokens** for persistent login.
- Secure cookie-based token storage for session management.

---

## ✅ Submission Requirements

### 1️⃣ **Logic for Computing `sellCount`**

Each book's `sellCount` represents the total quantity sold. This is computed using the `Purchase` model:

```ts
const purchases = await Purchase.find({ book: book._id });
const totalSales = purchases.reduce((sum, p) => sum + p.quantity, 0);

Used in:

Author dashboards (analytics)

Book listing (popularity)

Admin reporting (sales and revenue)

Additional metrics such as revenue are also computed from each purchase's price * quantity .

---

2️⃣ Mechanism for Sending Email Notifications
Email functionality is integrated using Nodemailer and used in two core scenarios:

📦 a. On Book Purchase
When a user purchases a book:

The PurchaseService triggers notificationService.notifyAuthorOnPurchase().

The author receives an email with:

Book title

Quantity sold

Total price

Purchaser info

📬 b. Monthly Summary Emails
A scheduled endpoint (/notify/monthly-summary) sends authors a monthly revenue and performance summary.

The email includes:

Monthly revenue

Sales count

Book-wise performance

Email configurations are stored securely in .env.

---

3️⃣ Database Design & Implementation

🧱 MongoDB Collections

| Collection  | Purpose                                                                |
| ----------- | ---------------------------------------------------------------------- |
| users       | Stores user info with roles: ADMIN, AUTHOR, RETAIL                     |
| books       | Contains book metadata like title, slug, price, authors, rating, etc.  |
| purchases   | Records each purchase with book, user, quantity, price, and timestamp  |
| reviews     | Stores user-submitted ratings and reviews for books (linked by bookId) |



🔐 ID Strategy
Custom prefixed IDs:

Users: A1, AU3, R5

Books: B101, B102

Ensures easy identification and avoids collisions.



⚙️ Optimizations
.lean() used for performance on read-heavy endpoints.

Aggregation pipelines for efficient revenue summaries.

MongoDB indexes created on searchable fields like bookId, userId, slug.



🧪 Tech Decisions
💡 Built with best practices in mind to ensure clean, scalable, and maintainable code:

🔁 Service–Repository Pattern
Promotes clear separation of concerns, enhances testability, and simplifies future scalability.

🧱 SOLID Principles
Strong foundation using Single Responsibility, Dependency Injection, and other principles to maintain a robust architecture.

🔐 Type Safety with TypeScript
Used DTOs and Interfaces for strong type enforcement and validation across layers.

⚙️ Atomic Operations
Avoided race conditions with atomic ID generation (instead of countDocuments), ensuring consistent and conflict-free creation.

🚀 Performance Optimization
Leveraged .lean() queries and MongoDB aggregations to handle large-scale reads and reporting efficiently.

🧩 Interface-Driven Design
Built with abstractions to allow easy swapping, testing, and scaling of services and data layers.



📂 Folder Structure
mathematica
Copy
Edit
BookMngment/
├── Backend/        → Express, Mongoose, Auth, Services
├── Frontend/       → React, Vite, Tailwind, Context API
└── README.md




📦 Tech Stack
Frontend: React + Vite + TailwindCSS

Backend: Node.js + Express + TypeScript

Database: MongoDB Atlas

Email: Nodemailer (SMTP)

Hosting: Vercel (FE) + Render (BE)




🛠️ Setup Instructions
bash
Copy
Edit
# Clone the repository
git clone https://github.com/SHAFIPT/Book-Mngment.git

# Backend Setup
cd Backend
npm install
cp .env.example .env
npm run dev

# Frontend Setup
cd ../Frontend
npm install
npm run dev