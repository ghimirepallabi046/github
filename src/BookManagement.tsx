
import { useState, useEffect } from "react";
import "./BookManagement.css";

type Book = {
  id: number;
  bookId: string;
  bookName: string;
  author: string;
  quantity: number;
};

function BookManagement() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem("books");
    return saved ? JSON.parse(saved) : [];
  });

  const [bookId, setBookId] = useState("");
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  const clearForm = () => {
    setBookId("");
    setBookName("");
    setAuthor("");
    setQuantity("");
    setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !bookId.trim() ||
      !bookName.trim() ||
      !author.trim() ||
      quantity === ""
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
      alert("Quantity must be a positive whole number.");
      return;
    }

    const duplicate = books.some(
      (book) =>
        book.bookId.toLowerCase() === bookId.trim().toLowerCase() &&
        book.id !== editId
    );

    if (duplicate) {
      alert("Book ID already exists.");
      return;
    }

    if (editId !== null) {
      setBooks(
        books.map((book) =>
          book.id === editId
            ? {
              ...book,
              bookId: bookId.trim(),
              bookName: bookName.trim(),
              author: author.trim(),
              quantity: Number(quantity),
            }
            : book
        )
      );

      alert("Book updated successfully!");
    } else {
      const newBook: Book = {
        id: Date.now(),
        bookId: bookId.trim(),
        bookName: bookName.trim(),
        author: author.trim(),
        quantity: Number(quantity),
      };

      setBooks([...books, newBook]);
      alert("Book added successfully!");
    }

    clearForm();
  };

  const handleEdit = (book: Book) => {
    setBookId(book.bookId);
    setBookName(book.bookName);
    setAuthor(book.author);
    setQuantity(String(book.quantity));
    setEditId(book.id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      setBooks(books.filter((book) => book.id !== id));
      alert("Book deleted successfully!");
    }
  };

  const filteredBooks = books.filter((book) =>
    `${book.bookId} ${book.bookName} ${book.author}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className= "book-management" >
    <h1>Book Management </h1>
      < p > Manage all library books in one place.</p>

        < form className = "book-form" onSubmit = { handleSubmit } >
          <h2>{ editId !== null ? "Edit Book" : "Add New Book"
} </h2>

  < label > Book ID </label>
    < input
type = "text"
value = { bookId }
onChange = {(e) => setBookId(e.target.value)}
placeholder = "Enter Book ID"
required
  />

  <label>Book Name </label>
    < input
type = "text"
value = { bookName }
onChange = {(e) => setBookName(e.target.value)}
placeholder = "Enter Book Name"
required
  />

  <label>Author </label>
  < input
type = "text"
value = { author }
onChange = {(e) => setAuthor(e.target.value)}
placeholder = "Enter Author Name"
required
  />

  <label>Quantity </label>
  < input
type = "number"
min = "1"
step = "1"
value = { quantity }
onChange = {(e) => setQuantity(e.target.value)}
placeholder = "Enter Quantity"
required
  />

  <button type="submit" >
    { editId !== null ? "Update Book" : "Add Book"}
</button>

{
  editId !== null && (
    <button type="button" onClick = { clearForm } >
      Cancel
      </button>
        )
}
</form>

  < div className = "book-list-section" >
    <h2>Book List </h2>

      < input
type = "text"
placeholder = "Search by Book ID, Name or Author..."
value = { search }
onChange = {(e) => setSearch(e.target.value)}
        />

  < div className = "book-table-wrapper" >
    <table>
    <thead>
    <tr>
    <th>Book ID </th>
      < th > Book Name </th>
        < th > Author </th>
        < th > Quantity </th>
        < th > Action </th>
        </tr>
        </thead>

        <tbody>
{
  filteredBooks.length > 0 ? (
    filteredBooks.map((book) => (
      <tr key= { book.id } >
      <td>{ book.bookId } </td>
      < td > { book.bookName } </td>
      < td > { book.author } </td>
      < td > { book.quantity } </td>
      < td >
      <button
                        type="button"
                        onClick = {() => handleEdit(book)}
                      >
  Edit
  </button>

  < button
type = "button"
onClick = {() => handleDelete(book.id)}
                      >
  Delete
  </button>
  </td>
  </tr>
                ))
              ) : (
  <tr>
  <td colSpan= { 5} > No books found.</td>
    </tr>
              )}
</tbody>
  </table>
  </div>

  < h3 > Total Book Records: { books.length } </h3>
    < h3 > Total Book Copies: {
      books.reduce(
        (total, book) => total + book.quantity,
        0
      )
    } </h3>
      </div>
      </div>
  );
}

export default BookManagement;
