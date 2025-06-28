import { AuthController } from "../controller/authController";
import { BookController } from "../controller/bookController";
import { AuthRepository } from "../repository/Implimentaion/AuthRepository";
import { AuthService } from "../services/Implimentation/auth.Service";
import { BookService } from "../services/Implimentation/Book.Service";
import { PurchaseController } from '../controller/PurchaseController';
import { PurchaseRepository } from "../repository/Implimentaion/PurchaseRepository";
import { PurchaseService } from "../services/Implimentation/Purchase.Service";
import { AdminRepository } from "../repository/Implimentaion/AdminRepository";
import { AdminService } from "../services/Implimentation/Admin.service";
import { AdminController } from "../controller/AdminController";
import { NotificationRepository } from "../repository/Implimentaion/NotificationRepository";
import { EmailUtil } from "../utils/email.util";
import { NotificationService } from "../services/Implimentation/Notification.service";
import { NotificationController } from "../controller/NotificationController";
import { ReviewRepository } from "../repository/Implimentaion/ReviewRepository";
import { ReviewService } from "../services/Implimentation/Review.service";
import { ReviewController } from "../controller/ReviewController";
import { Review } from "../model/Review";
import { BookRepository } from "../repository/Implimentaion/BookRepository";

const authRepo = new AuthRepository();
const authService = new AuthService(authRepo);
export const authController = new AuthController(authService);

const bookRepo = new BookRepository();
const bookService = new BookService(bookRepo);
export const bookController = new BookController(bookService);

const notificationRepo = new NotificationRepository();
const emailUtil = new EmailUtil(); // You must implement this
export const notificationService = new NotificationService(notificationRepo, emailUtil);
export const notificationController = new NotificationController(notificationService);

const purchaseRepo = new PurchaseRepository();
const purchaseService = new PurchaseService(purchaseRepo, notificationService);
export const purchaseController = new PurchaseController(purchaseService);

const adminRepo = new AdminRepository();
const adminService = new AdminService(adminRepo, bookService);
export const adminController = new AdminController(bookService, adminService);

// Repository
const reviewRepository = new ReviewRepository(Review);
const reviewService = new ReviewService(reviewRepository);
export const reviewController = new ReviewController(reviewService);