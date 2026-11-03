# MT-LABEXAM — Library Book Management

A Node.js lab project with two independent servers and in-memory book data. No database is used.

## Requirements

- Node.js 18 or newer
- npm

## Install

```sh
npm install
```

## Run the HTTP/FS server (Part A)

```sh
npm run start:http
```

This server listens on `http://localhost:3000`. Open `http://localhost:3000/home` for the browser catalogue, which loads books and adds new records through the HTTP routes.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Welcome page in HTML |
| GET | `/books` | List books as JSON |
| POST | `/add-book` | Add a book (JSON: `id`, `title`, `author`, `price`) |
| GET | `/about` | Application information |
| GET | `/home` | Reads and serves `public/index.html` using `fs` |

Example request:

```sh
curl -X POST http://localhost:3000/add-book \
  -H 'Content-Type: application/json' \
  -d '{"id":4,"title":"Clean Code","author":"Robert C. Martin","price":550}'
```

## Run the Express REST API (Part B)

Open a second terminal:

```sh
npm run start:api
```

This server listens on `http://localhost:4000`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/books` | List all books |
| GET | `/books/:id` | Get a book by ID |
| POST | `/books` | Add a book; `title`, `author`, and `price` are required; `id` is assigned if omitted |
| PUT | `/books/:id` | Update provided book fields |
| DELETE | `/books/:id` | Delete a book |

Example Express API request:

```sh
curl -X POST http://localhost:4000/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"Clean Code","author":"Robert C. Martin","price":550,"category":"Programming"}'
```

Data resets to the sample records whenever its server process restarts. The `screenshots/` directory includes browser captures of the HTTP home and welcome pages, Express `GET /books` and `GET /books/1`, EchoAPI `GET`, `POST`, `PUT`, and `DELETE` responses, and the GitHub commit history.
