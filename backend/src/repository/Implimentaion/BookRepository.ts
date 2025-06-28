import Book, { IBook } from '../../model/Book';
import Purchase from '../../model/Purchase';
import User from '../../model/User';
import { BookFilters, BookLeanDocument, BookResponse, BookStats, IBooks } from '../../types/BookTypes';
import { BaseRepository } from '../BaseRepository';
import { Types } from 'mongoose';
import { IBookRepository } from '../Interface/IBookRepository';

export class BookRepository extends BaseRepository<IBook> implements IBookRepository {
  constructor() {
    super(Book);
  }

  async create(data: Partial<IBook>): Promise<IBook> {
    const doc = new this.model(data);
    return await doc.save();
  }

  async countBooks(): Promise<number> {
    return this.model.countDocuments();
  }

  async findAll(): Promise<IBook[]> {
    return this.model.find().populate('authors', 'name email'); 
  }

  async findBySlug(slug: string): Promise<IBook | null> {
    return this.model.findOne({ slug });
  }

  async update(id: string, data: Partial<IBook>): Promise<IBook | null> {
    return this.model.findOneAndUpdate({ bookId: id }, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ bookId: id });
  }
      
  async getBookStats(userId: string, role: string): Promise<any[]> {
    let books: IBook[];
  
    if (role === 'AUTHOR') {
      // Filter books by authors field containing userId
      books = await this.model.find({ authors: userId }).populate('authors', 'name email');
    } else {
      // Admin can see all books
      books = await this.findAll();
    }
  
    const stats = await Promise.all(
      books.map(async (book) => {
        const purchases = await Purchase.find({ book: book._id });
  
        const totalSales = purchases.reduce((sum, p) => sum + p.quantity, 0);
        const totalRevenue = purchases.reduce((sum, p) => sum + p.quantity * p.price, 0);
  
        return {
          ...book.toObject(),
          sellCount: totalSales,
          revenue: totalRevenue
        };
      })
    );
  
    return stats;
  }  
  async getBooksWithFilters(userId: string, role: string, filters?: BookFilters): Promise<BookResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

      // Build match query with proper typing
    const matchQuery: Record<string, any> = {};

    if (role === 'AUTHOR') {
        matchQuery.authors = new Types.ObjectId(userId);
      } else {
        matchQuery.status = 'approved'; 
      }

    // Apply search filter
    if (filters?.search) {
        matchQuery.$or = [
            { title: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
        ];
    }

    // Apply price filters
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        matchQuery.price = {};
        if (filters.minPrice !== undefined) {
            matchQuery.price.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
            matchQuery.price.$lte = filters.maxPrice;
        }
    }

    // Apply price range filter
    if (filters?.priceRange) {
        switch (filters.priceRange) {
            case 'low':
                matchQuery.price = { $lt: 300 };
                break;
            case 'medium':
                matchQuery.price = { $gte: 300, $lt: 700 };
                break;
            case 'high':
                matchQuery.price = { $gte: 700 };
                break;
        }
    }

    // Apply author filter
    if (filters?.author) {
        matchQuery.authors = new Types.ObjectId(filters.author);
    }

    // Get books with basic info using proper typing
    const books = await this.model
        .find(matchQuery)
        .populate('authors', 'name email')
        .lean() as unknown as BookLeanDocument[]

    // Calculate stats for each book
    const booksWithStats: BookStats[] = await Promise.all(
        books.map(async (book) => {
            const purchases = await Purchase.find({ book: book._id });
            const totalSales = purchases.reduce((sum, p) => sum + p.quantity, 0);
            const totalRevenue = purchases.reduce((sum, p) => sum + p.quantity * p.price, 0);

            return {
                _id: book._id,
                bookId: book.bookId,
                title: book.title,
                slug: book.slug,
                authors: book.authors,
                description: book.description,
                price: book.price,
                status: book.status,
                createdAt: book.createdAt,
                updatedAt: book.updatedAt,
                sellCount: totalSales,
                revenue: totalRevenue,
                rating: 0, // You can implement rating calculation here
                reviews: 0, // You can implement reviews count here
            };
        })
    );

    // Apply sorting
    if (filters?.sortBy) {
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        booksWithStats.sort((a, b) => {
            const aValue = this.getSortValue(a, filters.sortBy!);
            const bValue = this.getSortValue(b, filters.sortBy!);
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder * aValue.localeCompare(bValue);
            }
            return sortOrder * ((aValue as number) - (bValue as number));
        });
    }

    // Apply pagination
    const totalBooks = booksWithStats.length;
    const paginatedBooks = booksWithStats.slice(skip, skip + limit);

    // Transform to IBooks format
    const transformedBooks: IBooks[] = paginatedBooks.map(book => {
        const baseBook = {
            bookId: book.bookId,
            title: book.title,
            description: book.description,
            price: book.price,
            authors: book.authors.map(author => author.name),
            sellCount: book.sellCount,
            revenue: book.revenue,
            rating: book.rating,
            reviews: book.reviews,
        };
    
        // Add status only for Author and Admin
        if (role === 'AUTHOR' || role === 'ADMIN') {
            return {
                ...baseBook,
                status: book.status
            };
        }
    
        return baseBook;
    });

    // Get available authors for filters
    const availableAuthors = await User.find(
        role === 'AUTHOR' ? { _id: userId } : { role: 'AUTHOR' },
        'name _id'
    ).lean();

    // Get price range
    const priceRange = await this.model.aggregate([
        ...(role === 'AUTHOR' ? [{ $match: { authors: new Types.ObjectId(userId) } }] : []),
        {
            $group: {
                _id: null,
                min: { $min: '$price' },
                max: { $max: '$price' }
            }
        }
    ]);

    const totalPages = Math.ceil(totalBooks / limit);

    return {
        books: transformedBooks,
        pagination: {
            currentPage: page,
            totalPages,
            totalBooks,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit,
        },
        filters: {
            appliedFilters: filters || {},
            availableAuthors: availableAuthors.map(author => ({
                id: author._id.toString(),
                name: author.name
            })),
            priceRange: priceRange[0] || { min: 0, max: 1000 },
        },
    };
}

private getSortValue(book: BookStats, sortBy: string): string | number {
    switch (sortBy) {
        case 'title':
            return book.title;
        case 'price':
            return book.price;
        case 'rating':
            return book.rating || 0;
        case 'sellCount':
            return book.sellCount;
        case 'createdAt':
            return new Date(book.createdAt).getTime();
        default:
            return book.title;
    }
}
}
