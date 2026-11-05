# 📋 Tasks API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

> 🚧 **Unfinished project.** This API covers the basic CRUD flow, but it has known bugs and no tests. It was built as a learning exercise and is kept public as a reference. See [⚠️ Known Issues](#️-known-issues) before using it.

A task management REST API built with the **Node.js native HTTP module**, with no web framework. It stores data in a local JSON file, supports searching tasks, and can import tasks from a CSV file. 📝

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [📥 Importing Tasks from CSV](#-importing-tasks-from-csv)
- [📡 API Reference](#-api-reference)
- [🗄️ Data Storage](#️-data-storage)
- [⚠️ Known Issues](#️-known-issues)
- [🗺️ Roadmap](#️-roadmap)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)
- [📚 References](#-references)

---

## ✨ Features

- ➕ **Create** a task with a title and a description
- 📋 **List** all tasks
- 🔍 **Search** tasks by title or description
- ✏️ **Update** a task's title and description
- 🗑️ **Delete** a task
- ✔️ **Complete** a task (stores the completion timestamp)
- 📥 **Import** tasks in bulk from a CSV file
- 🕒 Automatic `created_at` and `updated_at` timestamps

---

## 🧰 Tech Stack

| Layer     | Technology                                                 |
| --------- | ---------------------------------------------------------- |
| Runtime   | [Node.js](https://nodejs.org/) (ES Modules)                |
| HTTP      | Native [`http`](https://nodejs.org/api/http.html) module   |
| Storage   | JSON file (`database.json`)                                |
| CSV       | [csv-parse](https://csv.js.org/parse/)                     |

---

## 📁 Project Structure

```text
tasks-api/
├── src/
│   ├── csv/
│   │   ├── csv.js               # Script that sends data.csv to the API
│   │   └── data.csv             # Sample tasks to import
│   ├── middleware/
│   │   └── json.js              # Reads the request body and parses JSON
│   ├── utils/
│   │   ├── build-route-path.js  # Turns a route like /tasks/:id into a RegExp
│   │   └── extract-query-params.js # Parses the query string
│   ├── database.js              # JSON-file database class
│   ├── routes.js                # All HTTP routes and handlers
│   └── server.js                # HTTP server entry point (port 3335)
├── database.json                # Data file, created on first run
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18.11 or later (required by `node --watch` and the global `fetch` used by the CSV script)
- npm (comes with Node.js)

### 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/smkhb/tasks-api.git
cd tasks-api

# 2. Install dependencies
npm install

# 3. Start the server in watch mode
npm run dev
```

The API will be available at **http://localhost:3335** 🎉

> ℹ️ The port is hardcoded to `3335` in `src/server.js`. There is no `.env` file.

---

## 📥 Importing Tasks from CSV

The file `src/csv/data.csv` contains sample tasks with the header `title,description`. The `csv.js` script reads it and sends one `POST /tasks` request per row.

With the server running, in another terminal:

```bash
node src/csv/csv.js
```

Each row's response is logged to the console. ⚠️ Running the script again **adds the same tasks again**, because nothing checks for duplicates.

---

## 📡 API Reference

Base URL: `http://localhost:3335`

Request bodies are JSON. Each task has this shape:

```json
{
  "id": "7664e4bb-07b6-492c-917f-5b839ed0c910",
  "title": "Buy groceries",
  "description": "Go to the supermarket and buy food",
  "completed_at": null,
  "created_at": "2024-06-27T14:28:36.514Z",
  "updated_at": "2024-06-27T14:28:36.514Z"
}
```

`completed_at` is `null` until the task is completed.

### 📋 Endpoints

| Method   | Route                  | Description                              | Body                             | Success response        |
| -------- | ---------------------- | ---------------------------------------- | -------------------------------- | ----------------------- |
| `GET`    | `/tasks`               | 📋 List all tasks                        | —                                | `200` JSON array        |
| `GET`    | `/tasks?search=<text>` | 🔍 List tasks matching `<text>`          | —                                | `200` JSON array        |
| `POST`   | `/tasks`               | ➕ Create a task                          | `{ "title", "description" }`     | `200` created task      |
| `PUT`    | `/tasks/:id`           | ✏️ Update a task's title and description | `{ "title", "description" }`     | `204` no content        |
| `DELETE` | `/tasks/:id`           | 🗑️ Delete a task                         | —                                | `200` empty body        |
| `PATCH`  | `/tasks/:id/complete`  | ✔️ Mark a task as completed              | —                                | `200` empty body        |

Any other route returns `404` with no body.

### 🔍 Search

`search` matches tasks whose **title or description contains** the given text.

- ⚠️ The match is **case-sensitive**: `search=Teste` finds "Teste A", but `search=teste` does not.
- Spaces can be written as `+`. Percent-encoding (`%20`) is not decoded (see [Known Issues](#️-known-issues)).

### 📦 Examples

```bash
# Create a task
curl -X POST http://localhost:3335/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Study", "description": "Review Node.js streams"}'

# List tasks
curl http://localhost:3335/tasks

# Search tasks
curl "http://localhost:3335/tasks?search=Study"

# Update a task (both fields are required, see Known Issues)
curl -X PUT http://localhost:3335/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Study", "description": "Review Node.js streams and buffers"}'

# Mark a task as completed
curl -X PATCH http://localhost:3335/tasks/<id>/complete

# Delete a task
curl -X DELETE http://localhost:3335/tasks/<id>
```

---

## 🗄️ Data Storage

Tasks are stored in `database.json` at the project root:

- 📄 The file is created automatically the first time the server runs.
- 💾 Every write (create, update, delete, complete) rewrites the whole file.
- 🧠 The file is also loaded into memory when the server starts, and all reads use that copy.

This is fine for learning and small local tests. It is **not** suitable for production. See the Roadmap below.

> 🔒 `database.json` is git-ignored, so your local data is never committed.

---

## ⚠️ Known Issues

These issues were found by reading the code and by running the API locally. Items marked 🔬 were confirmed by running the server. Items marked 📖 come from code reading only.

**🟠 Bugs**

- 🧹 **`PUT` without `description` erases the description.** 🔬 Missing fields become `undefined`, so `PUT` with only `title` saves the task without a `description` field.
- 🫥 **`PUT` returns `204` even when the task does not exist.** 🔬 The result of the update is ignored.
- 🔤 **Search is case-sensitive.** 🔬 `search=teste` does not match "Teste A".
- 🔗 **Query values are not URL-decoded.** 📖 `search=Buy%20groceries` will not match "Buy groceries". Use `+` for spaces.
- 🪪 **`DELETE` and `PATCH .../complete` return `200` with `null` for unknown IDs.** 🔬 They should return `404`.
- ✔️ **Completing a task again overwrites `completed_at`.** 📖 There is no check for an already completed task.
- 📭 **Listing or searching when there are no tasks may fail.** 📖 `select` returns the string `"Table not found"` when the table is missing, and `.filter` on that string throws when `search` is used.

**🟡 Limitations**

- 🧾 **No input validation.** Titles and descriptions are not checked for type, presence or length.
- 🧵 **Concurrent writes are not safe.** 📖 Writes use `fs.writeFile` without waiting for it to finish, so overlapping writes could leave `database.json` incomplete.
- 📥 **CSV import is not idempotent.** Running `csv.js` twice creates duplicate tasks. 📖 The script was not executed in this review.
- 🧪 **No automated tests.** `npm test` is a placeholder.
- 📦 **No Node.js version pinned** (no `engines` field or `.nvmrc`).

---

## 🗺️ Roadmap

- [ ] Validate request bodies (required fields, types, length)
- [ ] Return `404` for unknown task IDs
- [ ] Keep unchanged fields on `PUT`
- [ ] Case-insensitive search
- [ ] Decode URL query values
- [ ] Prevent duplicate tasks on CSV import
- [ ] Replace the JSON file with a real database (e.g. SQLite)
- [ ] Add automated tests
- [ ] Add an `engines` field and an `.env`-based port

---

## 🧪 Testing

There are no automated tests yet. `npm test` is a placeholder and currently exits with an error. To check the API manually, use the `curl` examples above or an HTTP client such as Insomnia or Postman.

---

## 🤝 Contributing

Contributions are welcome! 🎉

1. Fork the project
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Fixes for the items in [⚠️ Known Issues](#️-known-issues) are especially welcome.

---

## 📚 References

- 📝 [Rocketseat Ignite Node.js: Desafio 01](https://github.com/rocketseat-education/ignite-nodejs-01-fundamentos-nodejs-challenge), the challenge this project is based on

