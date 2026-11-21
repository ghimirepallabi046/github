
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const app = express();

app.use(cors());
app.use(express.json());

// ================= MYSQL CONNECTION =================

const db = mysql.createConnection({
    host: "localhost",
    user: "library_app",
    password: process.env.DB_PASSWORD,
    database: "school_library_db"
});
db.connect((err) => {
    if (err) {
        console.error("MySQL Connection Failed:", err.message);
    } else {
        console.log("MySQL Connected Successfully!");
    }
});

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
    res.json({
        message: "School Library Backend is Running!"
    });
});

// =====================================================
//                    ADMIN LOGIN
// =====================================================

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        return res.status(200).json({
            success: true,
            message: "Login Successful!"
        });
    }

    return res.status(401).json({
        success: false,
        message: "Invalid Email or Password"
    });
});

// =====================================================
//                    BOOK MANAGEMENT
// =====================================================

// GET ALL BOOKS
app.get("/books", (req, res) => {
    db.query("SELECT * FROM books ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// GET SINGLE BOOK
app.get("/books/:id", (req, res) => {
    db.query(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.length === 0) {
                return res.status(404).json({ message: "Book not found" });
            }

            res.json(result[0]);
        }
    );
});

// ADD BOOK
app.post("/books", (req, res) => {
    const { title, author, category, quantity } = req.body;
    const qty = Number(quantity);

    if (
        !title?.trim() ||
        !author?.trim() ||
        !category?.trim() ||
        !Number.isInteger(qty) ||
        qty < 1
    ) {
        return res.status(400).json({
            message: "Invalid book details."
        });
    }

    const sql = `
        INSERT INTO books
        (title, author, category, quantity, available)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title.trim(), author.trim(), category.trim(), qty, qty],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                message: "Book Added Successfully!",
                bookId: result.insertId
            });
        }
    );
});

// UPDATE BOOK
app.put("/books/:id", (req, res) => {
    const id = Number(req.params.id);
    const { title, author, category, quantity, available } = req.body;

    const qty = Number(quantity);
    const avail = Number(available);

    if (
        !Number.isInteger(id) ||
        id < 1 ||
        !title?.trim() ||
        !author?.trim() ||
        !category?.trim() ||
        !Number.isInteger(qty) ||
        !Number.isInteger(avail) ||
        qty < 1 ||
        avail < 0 ||
        avail > qty
    ) {
        return res.status(400).json({
            message: "Invalid book details."
        });
    }

    const sql = `
        UPDATE books
        SET title = ?, author = ?, category = ?,
            quantity = ?, available = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [title.trim(), author.trim(), category.trim(), qty, avail, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Book not found" });
            }

            res.json({ message: "Book Updated Successfully!" });
        }
    );
});

// DELETE BOOK
app.delete("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid book ID." });
    }

    db.query("SELECT * FROM books WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (Number(result[0].available) !== Number(result[0].quantity)) {
            return res.status(400).json({
                message: "Return all issued copies before deleting."
            });
        }

        db.query("DELETE FROM books WHERE id = ?", [id], (deleteErr) => {
            if (deleteErr) {
                return res.status(500).json({ error: deleteErr.message });
            }

            res.json({ message: "Book Deleted Successfully!" });
        });
    });
});

// =====================================================
//                   STUDENT MANAGEMENT
// =====================================================

const studentFields = [
    "student_id",
    "full_name",
    "dob",
    "gender",
    "class_level",
    "section",
    "roll_number",
    "father_name",
    "mother_name",
    "guardian_name",
    "parent_phone",
    "emergency_contact",
    "address",
    "admission_date"
];

function getStudentValues(body) {
    return studentFields.map((field) => {
        const value = body[field];
        return value === undefined || value === "" ? null : value;
    });
}

function validStudent(body, includeId = false) {
    const classLevel = Number(body.class_level);

    return (
        (!includeId || body.student_id?.trim()) &&
        body.full_name?.trim() &&
        Number.isInteger(classLevel) &&
        classLevel >= 1 &&
        classLevel <= 10
    );
}

// GET ALL STUDENTS
app.get("/students", (req, res) => {
    db.query(
        "SELECT * FROM students ORDER BY id DESC",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json(result);
        }
    );
});

// GET SINGLE STUDENT
app.get("/students/:id", (req, res) => {
    db.query(
        "SELECT * FROM students WHERE id = ? OR student_id = ?",
        [req.params.id, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.length === 0) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.json(result[0]);
        }
    );
});

// ADD STUDENT
app.post("/students", (req, res) => {
    if (!validStudent(req.body, true)) {
        return res.status(400).json({
            message: "Student ID, name and valid class (1-10) are required."
        });
    }

    const values = getStudentValues(req.body);
    const placeholders = studentFields.map(() => "?").join(", ");

    const sql = `
        INSERT INTO students (${studentFields.join(", ")})
        VALUES (${placeholders})
    `;

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
            message: "Student Added Successfully!",
            id: result.insertId
        });
    });
});

// UPDATE STUDENT
app.put("/students/:id", (req, res) => {
    if (!validStudent(req.body)) {
        return res.status(400).json({
            message: "Student name and valid class (1-10) are required."
        });
    }

    const updateFields = studentFields.filter(
        (field) => field !== "student_id"
    );

    const values = updateFields.map((field) => {
        const value = req.body[field];
        return value === undefined || value === "" ? null : value;
    });

    const sql = `
        UPDATE students
        SET ${updateFields.map((field) => `${field} = ?`).join(", ")}
        WHERE id = ?
    `;

    db.query(sql, [...values, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({ message: "Student Updated Successfully!" });
    });
});

// DELETE STUDENT
app.delete("/students/:id", (req, res) => {
    db.query(
        "DELETE FROM students WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found" });
            }

            res.json({ message: "Student Deleted Successfully!" });
        }
    );
});

// =====================================================
//                    ACADEMIC RESULTS
// =====================================================

const subjects = [
    "english",
    "nepali",
    "mathematics",
    "science",
    "social_studies"
];

function validMarks(body) {
    return subjects.every((subject) => {
        const mark = body[subject];

        return (
            mark !== undefined &&
            mark !== "" &&
            Number.isInteger(Number(mark)) &&
            Number(mark) >= 0 &&
            Number(mark) <= 100
        );
    });
}

// GET ALL RESULTS
app.get("/results", (req, res) => {
    const sql = `
        SELECT
            ar.*,
            s.full_name AS student_name,
            s.class_level,
            s.roll_number
        FROM academic_results ar
        JOIN students s ON ar.student_id = s.student_id
        ORDER BY ar.id DESC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// GET RESULT BY STUDENT ID
app.get("/results/:studentId", (req, res) => {
    const sql = `
        SELECT ar.*, s.full_name AS student_name,
               s.class_level, s.roll_number
        FROM academic_results ar
        JOIN students s ON ar.student_id = s.student_id
        WHERE ar.student_id = ?
    `;

    db.query(sql, [req.params.studentId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.json(result[0]);
    });
});

// ADD RESULT
app.post("/results", (req, res) => {
    const { student_id } = req.body;

    if (!student_id?.trim() || !validMarks(req.body)) {
        return res.status(400).json({
            message: "Enter Student ID and all marks between 0 and 100."
        });
    }

    const marks = subjects.map((subject) => Number(req.body[subject]));

    const sql = `
        INSERT INTO academic_results
        (student_id, ${subjects.join(", ")})
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [student_id.trim(), ...marks], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
            message: "Academic Result Added Successfully!",
            id: result.insertId
        });
    });
});

// UPDATE RESULT
app.put("/results/:studentId", (req, res) => {
    if (!validMarks(req.body)) {
        return res.status(400).json({
            message: "All marks must be between 0 and 100."
        });
    }

    const marks = subjects.map((subject) => Number(req.body[subject]));

    const sql = `
        UPDATE academic_results
        SET ${subjects.map((subject) => `${subject} = ?`).join(", ")}
        WHERE student_id = ?
    `;

    db.query(sql, [...marks, req.params.studentId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.json({ message: "Academic Result Updated Successfully!" });
    });
});

// DELETE RESULT
app.delete("/results/:studentId", (req, res) => {
    db.query(
        "DELETE FROM academic_results WHERE student_id = ?",
        [req.params.studentId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Result not found" });
            }

            res.json({ message: "Academic Result Deleted Successfully!" });
        }
    );
});

// =====================================================
//                    START SERVER
// =====================================================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
