
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./BookManagement.css";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  quantity: number;
  available: number;
}

const API_URL = "http://localhost:5000";

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    quantity: "1",
  });

  // ================= GET BOOKS FROM MYSQL =================

  async function loadBooks() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/books`);

      if (!response.ok) {
        throw new Error("Unable to load books.");
      }

      const data: Book[] = await response.json();

      const formattedBooks = data.map((book) => ({
        ...book,
        id: Number(book.id),
        quantity: Number(book.quantity),
        available: Number(book.available),
      }));

      setBooks(formattedBooks);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  // ================= BOOK STATISTICS =================

  const totalCopies = books.reduce(
    (sum, book) => sum + book.quantity,
    0
  );

  const availableCopies = books.reduce(
    (sum, book) => sum + book.available,
    0
  );

  // ================= SEARCH BOOKS =================

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ================= RESET FORM =================

  function resetForm() {
    setForm({
      title: "",
      author: "",
      category: "",
      quantity: "1",
    });

    setEditingId(null);
  }

  // ================= ADD AND UPDATE BOOK =================

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const quantity = Number(form.quantity);

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.category.trim() ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      setMessage("Please enter valid book details.");
      return;
    }

    const existingBook =
      editingId !== null
        ? books.find((book) => book.id === editingId)
        : undefined;

    if (editingId !== null && !existingBook) {
      setMessage("Book not found. Please refresh.");
      return;
    }

    const issuedCopies = existingBook
      ? existingBook.quantity - existingBook.available
      : 0;

    if (quantity < issuedCopies) {
      setMessage(
        `You cannot set quantity below ${issuedCopies} issued copies.`
      );
      return;
    }

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      quantity,
      available: quantity - issuedCopies,
    };

    try {
      setSaving(true);

      const url =
        editingId !== null
          ? `${API_URL}/books/${editingId}`
          : `${API_URL}/books`;

      const response = await fetch(url, {
        method: editingId !== null ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Unable to save book."
        );
      }

      setMessage(
        editingId !== null
          ? "Book Updated Successfully!"
          : "Book Added Successfully!"
      );

      resetForm();
      await loadBooks();

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  // ================= EDIT BOOK =================

  function editBook(book: Book) {
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      quantity: String(book.quantity),
    });

    setEditingId(book.id);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ================= DELETE BOOK =================

  async function deleteBook(id: number) {
    const book = books.find((item) => item.id === id);

    if (!book) return;

    if (book.available !== book.quantity) {
      setMessage("Return all issued copies before deleting.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Unable to delete book."
        );
      }

      setMessage("Book Deleted Successfully!");

      if (editingId === id) {
        resetForm();
      }

      await loadBooks();

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  // ================= USER INTERFACE =================

  return (
    <div className="book-management">

      <header className="book-header">
        <p className="book-subtitle">
          SCHOOL LIBRARY MANAGEMENT SYSTEM
        </p>

        <h1>📚 Book Management</h1>

        <p>Add, search, update and manage your library books.</p>
      </header>

      {/* STATISTICS */}

      <div className="book-stats">

        <div className="book-stat-card">
          <span>📘</span>
          <p>Book Titles</p>
          <h2>{books.length}</h2>
        </div>

        <div className="book-stat-card">
          <span>📚</span>
          <p>Total Copies</p>
          <h2>{totalCopies}</h2>
        </div>

        <div className="book-stat-card">
          <span>✅</span>
          <p>Available Copies</p>
          <h2>{availableCopies}</h2>
        </div>

      </div>

      {/* BOOK FORM */}

      <section className="book-form">

        <h2>
          {editingId !== null ? "✏️ Edit Book" : "➕ Add New Book"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="book-form-grid">

            <label>
              Book Title

              <input
                type="text"
                placeholder="Enter book title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />
            </label>

            <label>
              Author

              <input
                type="text"
                placeholder="Enter author name"
                value={form.author}
                onChange={(e) =>
                  setForm({ ...form, author: e.target.value })
                }
                required
              />
            </label>

            <label>
              Category

              <input
                type="text"
                placeholder="e.g. Science"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                required
              />
            </label>

            <label>
              Total Copies

              <input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                required
              />
            </label>

          </div>

          {message && (
            <p className="book-message" role="status">
              {message}
            </p>
          )}

          <div className="book-form-actions">

            <button type="submit" disabled={saving}>
              {saving
                ? "Please wait..."
                : editingId !== null
                  ? "Save Changes"
                  : "Add Book"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </section>

      {/* BOOK LIST */}

      <section className="book-list-section">

        <div className="book-list-header">

          <h2>📖 All Books</h2>

          <input
            type="text"
            placeholder="Search title, author, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search books"
          />

        </div>

        <div className="book-table-wrapper">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Copies</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan={8} className="empty-message">
                    Loading books...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-message">
                    No books found. Add a new book or try another search.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id}>

                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td>{book.quantity}</td>
                    <td>{book.available}</td>

                    <td>
                      <span
                        className={
                          book.available > 0
                            ? "book-status available"
                            : "book-status unavailable"
                        }
                      >
                        {book.available > 0
                          ? "Available"
                          : "Out of stock"}
                      </span>
                    </td>

                    <td className="book-actions">

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => editBook(book)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteBook(book.id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}
