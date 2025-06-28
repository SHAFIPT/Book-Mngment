export enum Messages {
  // Auth messages
  REGISTER_SUCCESS = 'User registered successfully',
  LOGIN_SUCCESS = 'Login successful',
  INVALID_CREDENTIALS = 'Invalid email or password',
  UNAUTHORIZED = 'Unauthorized access',
  SERVER_ERROR = 'Internal server error',
  REFRESH_SUCCESS = 'Access token refreshed successfully',
  EMAIL_ALREADY_EXISTS = 'Email already exists',
  VALIDATION_FAILED = 'Validation failed',
  ACCOUNT_INACTIVE = 'Your account has been blocked by the admin',
  LOGOUT_SUCCESS = 'User logged out successfully',

  // Book messages
  BOOK_CREATED = 'Book created successfully',
  BOOK_FETCHED = 'Book fetched successfully',
  BOOK_UPDATED = 'Book updated successfully',
  BOOK_DELETED = 'Book deleted successfully',
  BOOKS_LISTED = 'Books listed successfully',
  BOOK_NOT_FOUND = 'Book not found',

  // Review messages
  REVIEW_ADDED = 'Review added successfully',
  REVIEWS_FETCHED = 'Book reviews fetched successfully',
  RATING_FETCHED = 'Book rating fetched successfully',

  // Notification messages
  AUTHOR_NOTIFIED = 'Notification sent to author',
  MONTHLY_SUMMARY_SENT = 'Monthly summary sent to authors',
  BOOK_ANNOUNCEMENT_SENT = 'Book announcement sent to retail users',
  BULK_EMAIL_SENT = 'Bulk email sent successfully',

  // Purchase messages
  PURCHASE_SUCCESS = 'Purchase successful',
  PURCHASE_HISTORY_FETCHED = 'Purchase history fetched successfully',
  REVENUE_SUMMARY_FETCHED = 'Revenue summary fetched successfully',
}
