import express from 'express';

const app = express();
const PORT = 4000;
const books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350, category: 'Fiction' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 450, category: 'Self-help' },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', price: 550, category: 'Programming' },
];

app.use(express.json());

function validateBook(body, { requiredFields = ['title', 'author', 'price'] } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Request body must be a JSON object.';
  const missingFields = requiredFields.filter((field) => !Object.hasOwn(body, field));
  if (missingFields.length) return `Missing required field(s): ${missingFields.join(', ')}.`;
  if (Object.hasOwn(body, 'title') && (typeof body.title !== 'string' || !body.title.trim())) return 'Title must be a non-empty string.';
  if (Object.hasOwn(body, 'author') && (typeof body.author !== 'string' || !body.author.trim())) return 'Author must be a non-empty string.';
  if (Object.hasOwn(body, 'price') && (!Number.isFinite(body.price) || body.price < 0)) return 'Price must be a non-negative number.';
  if (Object.hasOwn(body, 'category') && (typeof body.category !== 'string' || !body.category.trim())) return 'Category must be a non-empty string.';
  if (Object.hasOwn(body, 'id') && (!Number.isInteger(Number(body.id)) || Number(body.id) < 1)) return 'ID must be a positive integer.';
  return null;
}

app.get('/books', (request, response) => response.json(books));

app.get('/books/:id', (request, response) => {
  const id = Number(request.params.id);
  const book = books.find((item) => item.id === id);
  if (!Number.isInteger(id) || !book) return response.status(404).json({ error: 'Book not found' });
  return response.json(book);
});

app.post('/books', (request, response) => {
  const validationError = validateBook(request.body);
  if (validationError) return response.status(400).json({ error: validationError });
  const id = request.body.id === undefined ? Math.max(0, ...books.map((book) => book.id)) + 1 : Number(request.body.id);
  if (books.some((book) => book.id === id)) return response.status(409).json({ error: `A book with id ${id} already exists.` });
  const book = { id, title: request.body.title.trim(), author: request.body.author.trim(), price: request.body.price, category: request.body.category?.trim() ?? 'Uncategorized' };
  books.push(book);
  return response.status(201).json({ message: 'Book added successfully', book });
});

app.put('/books/:id', (request, response) => {
  const id = Number(request.params.id);
  const bookIndex = books.findIndex((item) => item.id === id);
  if (!Number.isInteger(id) || bookIndex === -1) return response.status(404).json({ error: 'Book not found' });
  const validationError = validateBook(request.body, { requiredFields: [] });
  if (validationError) return response.status(400).json({ error: validationError });
  const editableFields = ['title', 'author', 'price', 'category'];
  if (!editableFields.some((field) => Object.hasOwn(request.body, field))) {
    return response.status(400).json({ error: 'Provide at least one field to update: title, author, price, or category.' });
  }
  const updatedBook = { ...books[bookIndex] };
  for (const field of ['title', 'author', 'price', 'category']) {
    if (Object.hasOwn(request.body, field)) updatedBook[field] = typeof request.body[field] === 'string' ? request.body[field].trim() : request.body[field];
  }
  books[bookIndex] = updatedBook;
  return response.json({ message: 'Book updated successfully', book: updatedBook });
});

app.delete('/books/:id', (request, response) => {
  const id = Number(request.params.id);
  const bookIndex = books.findIndex((item) => item.id === id);
  if (!Number.isInteger(id) || bookIndex === -1) return response.status(404).json({ error: 'Book not found' });
  const [deletedBook] = books.splice(bookIndex, 1);
  return response.json({ message: 'Book deleted successfully', book: deletedBook });
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && 'body' in error) return response.status(400).json({ error: 'Request body must contain valid JSON.' });
  return next(error);
});

app.use((request, response) => response.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => console.log(`Express Server running at http://localhost:${PORT}`));
