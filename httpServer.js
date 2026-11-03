import http from 'node:http';
import { readFile } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 350 },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 450 },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', price: 550 },
];

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload, null, 2));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Request body must contain valid JSON'));
      }
    });
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
  const { pathname } = requestUrl;

  if (request.method === 'GET' && pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html><head><title>Library</title></head><body><h1>Welcome to the Library Book Management Server</h1><p>Browse <a href="/books">the books</a> or open the <a href="/home">library home page</a>.</p></body></html>');
    return;
  }

  if (request.method === 'GET' && pathname === '/books') {
    sendJson(response, 200, books);
    return;
  }

  if (request.method === 'POST' && pathname === '/add-book') {
    try {
      const book = await readRequestBody(request);
      if (!book || !['id', 'title', 'author', 'price'].every((field) => Object.hasOwn(book, field)) ||
          !Number.isInteger(Number(book.id)) || !String(book.title).trim() || !String(book.author).trim() ||
          !Number.isFinite(Number(book.price)) || Number(book.price) < 0) {
        sendJson(response, 400, { error: 'Required fields: integer id, non-empty title, non-empty author, and non-negative price.' });
        return;
      }
      if (books.some((existingBook) => existingBook.id === Number(book.id))) {
        sendJson(response, 409, { error: `A book with id ${Number(book.id)} already exists.` });
        return;
      }
      const newBook = { id: Number(book.id), title: String(book.title).trim(), author: String(book.author).trim(), price: Number(book.price) };
      books.push(newBook);
      sendJson(response, 201, { message: 'Book added successfully', book: newBook });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method === 'GET' && pathname === '/about') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html><head><title>About</title></head><body><h1>About this application</h1><p>A Node.js library book management demo using the built-in HTTP and FS modules.</p><p><a href="/">Return home</a></p></body></html>');
    return;
  }

  if (request.method === 'GET' && pathname === '/home') {
    readFile(join(currentDirectory, 'public', 'index.html'), 'utf8', (error, html) => {
      if (error) {
        sendJson(response, 500, { error: 'Unable to read the library home page.' });
        return;
      }
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(html);
    });
    return;
  }

  sendJson(response, 404, { error: 'Route not found' });
});

server.listen(PORT, () => console.log(`HTTP Server running at http://localhost:${PORT}`));
