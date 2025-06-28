import { Router } from 'express';
import { bookController } from '../config/container';
import { authenticate } from '../middleware/authMiddleware';
import { checkUserActiveStatus } from '../middleware/checkUserActiveStatus';

const bookrouter = Router();

bookrouter.post('/', authenticate,checkUserActiveStatus, bookController.createBook);
bookrouter.get('/',authenticate , bookController.getBooks);
bookrouter.get('/:slug', (req, res, next) => bookController.getBookBySlug(req, res, next));
bookrouter.put('/:id', authenticate, checkUserActiveStatus, bookController.updateBook);
bookrouter.delete('/:id', authenticate, checkUserActiveStatus, bookController.deleteBook);

export default bookrouter;
