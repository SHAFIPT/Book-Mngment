import Counter from '../model/Counter';

export const getNextBookId = async (): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { key: 'bookId' },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  return `book-${counter.count}`;
};
