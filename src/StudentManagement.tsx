
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./StudentManagement.css";

const API_URL = "http://localhost:5000";

type Student = {
    id: number;
    student_id: string;
    full_name: string;
    dob: string | null;
    gender: string | null;
    class_level: number;
    section: string | null;
    roll_number: number | null;
    father_name: string | null;
    mother_name: string | null;
    guardian_name: string | null;
    parent_phone: string | null;
    emergency_contact: string | null;
    address: string | null;
    admission_date: string | null;
};

type StudentForm = {
    student_id: string;
    full_name: string;
    dob: string;
    gender: string;
    class_level: string;
    section: string;
    roll_number: string;
    father_name: string;
    mother_name: string;
    guardian_name: string;
    parent_phone: string;
    emergency_contact: string;
    address: string;
    admission_date: string;
};

const emptyForm: StudentForm = {
    student_id: "",
    full_name: "",
    dob: "",
    gender: "",
    class_level: "",
    section: "",
    roll_number: "",
    father_name: "",
    mother_name: "",
    guardian_name: "",
    parent_phone: "",
    emergency_contact: "",
    address: "",
    admission_date: "",
};

function dateValue(value: string | null) {
    if (!value) return "";
    return value.substring(0, 10);
}

export default function StudentManagement() {
    const [students, setStudents] = useState<Student[]>([]);
    const [form, setForm] = useState<StudentForm>(emptyForm);
    const [editId, setEditId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function fetchStudents() {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/students`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || data.message);

            setStudents(data);
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load students.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStudents();
    }, []);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");
        setError("");

        const classLevel = Number(form.class_level);
        const rollNumber = form.roll_number
            ? Number(form.roll_number)
            : null;

        if (!editId && !form.student_id.trim()) {
            setError("Please enter Student ID.");
            return;
        }

        if (!form.full_name.trim() || !Number.isInteger(classLevel) ||
            classLevel < 1 || classLevel > 10) {
            setError("Enter student name and a valid class (1–10).");
            return;
        }

        if (form.roll_number && (!Number.isInteger(rollNumber) || rollNumber! < 1)) {
            setError("Enter a valid roll number.");
            return;
        }

        const payload = {
            ...form,
            class_level: classLevel,
            roll_number: rollNumber,
        };

        try {
            const response = await fetch(
                editId ? `${API_URL}/students/${editId}` : `${API_URL}/students`,
                {
                    method: editId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || data.message);

            setMessage(data.message || "Student saved successfully!");
            setForm(emptyForm);
            setEditId(null);
            await fetchStudents();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save student.");
        }
    }

    function handleEdit(student: Student) {
        setEditId(student.id);

        setForm({
            student_id: student.student_id,
            full_name: student.full_name,
            dob: dateValue(student.dob),
            gender: student.gender || "",
            class_level: String(student.class_level),
            section: student.section || "",
            roll_number: student.roll_number?.toString() || "",
            father_name: student.father_name || "",
            mother_name: student.mother_name || "",
            guardian_name: student.guardian_name || "",
            parent_phone: student.parent_phone || "",
            emergency_contact: student.emergency_contact || "",
            address: student.address || "",
            admission_date: dateValue(student.admission_date),
        });

        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Are you sure you want to delete this student?")) {
            return;
        }

        setMessage("");
        setError("");

        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || data.message);

            setMessage(data.message || "Student deleted successfully!");
            await fetchStudents();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to delete student.");
        }
    }

    function cancelEdit() {
        setEditId(null);
        setForm(emptyForm);
        setMessage("");
        setError("");
    }

    const filteredStudents = useMemo(() => {
        const term = search.toLowerCase().trim();

        return students.filter((student) =>
            [
                student.student_id,
                student.full_name,
                String(student.class_level),
                student.section || "",
                String(student.roll_number || ""),
            ].some((value) => value.toLowerCase().includes(term))
        );
    }, [students, search]);

    return (
        <div className="student-management">
            <h1>Student Management</h1>
            <p className="student-subtitle">
                Add, view, update and manage student records.
            </p>

            {message && <div className="student-success">{message}</div>}
            {error && <div className="student-error">{error}</div>}

            <form className="student-form" onSubmit={handleSubmit}>
                <h2>{editId ? "Update Student" : "Add New Student"}</h2>

                <div className="student-form-grid">
                    <label>
                        Student ID *
                        <input
                            name="student_id"
                            value={form.student_id}
                            onChange={handleChange}
                            placeholder="e.g. stu001"
                            required={!editId}
                            disabled={editId !== null}
                        />
                    </label>

                    <label>
                        Full Name *
                        <input
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            required
                        />
                    </label>

                    <label>
                        Date of Birth
                        <input
                            type="date"
                            name="dob"
                            value={form.dob}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Gender
                        <select name="gender" value={form.gender} onChange={handleChange}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>

                    <label>
                        Class (1–10) *
                        <select
                            name="class_level"
                            value={form.class_level}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Class</option>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>Class {n}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Section
                        <input
                            name="section"
                            value={form.section}
                            onChange={handleChange}
                            placeholder="e.g. A"
                        />
                    </label>

                    <label>
                        Roll Number
                        <input
                            type="number"
                            min="1"
                            name="roll_number"
                            value={form.roll_number}
                            onChange={handleChange}
                            placeholder="Enter roll number"
                        />
                    </label>

                    <label>
                        Father's Name
                        <input
                            name="father_name"
                            value={form.father_name}
                            onChange={handleChange}
                            placeholder="Father's name"
                        />
                    </label>

                    <label>
                        Mother's Name
                        <input
                            name="mother_name"
                            value={form.mother_name}
                            onChange={handleChange}
                            placeholder="Mother's name"
                        />
                    </label>

                    <label>
                        Guardian Name
                        <input
                            name="guardian_name"
                            value={form.guardian_name}
                            onChange={handleChange}
                            placeholder="Guardian name"
                        />
                    </label>

                    <label>
                        Parent Phone
                        <input
                            type="tel"
                            name="parent_phone"
                            value={form.parent_phone}
                            onChange={handleChange}
                            placeholder="Parent phone number"
                        />
                    </label>

                    <label>
                        Emergency Contact
                        <input
                            type="tel"
                            name="emergency_contact"
                            value={form.emergency_contact}
                            onChange={handleChange}
                            placeholder="Emergency phone number"
                        />
                    </label>

                    <label className="student-full-width">
                        Address
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Enter address"
                            rows={2}
                        />
                    </label>

                    <label>
                        Admission Date
                        <input
                            type="date"
                            name="admission_date"
                            value={form.admission_date}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="student-form-buttons">
                    <button type="submit" className="student-submit">
                        {editId ? "Update Student" : "Add Student"}
                    </button>

                    {editId !== null && (
                        <button type="button" className="student-cancel" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="student-list-section">
                <div className="student-list-heading">
                    <h2>Student Records ({students.length})</h2>
                    <input
                        className="student-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by ID, name, class..."
                    />
                </div>

                {loading ? (
                    <p>Loading students...</p>
                ) : (
                    <div className="student-table-wrapper">
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Full Name</th>
                                    <th>Class</th>
                                    <th>Section</th>
                                    <th>Roll No.</th>
                                    <th>Parent Phone</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="student-empty">
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.student_id}</td>
                                            <td>{student.full_name}</td>
                                            <td>{student.class_level}</td>
                                            <td>{student.section || "-"}</td>
                                            <td>{student.roll_number ?? "-"}</td>
                                            <td>{student.parent_phone || "-"}</td>
                                            <td>
                                                <div className="student-actions">
                                                    <button
                                                        type="button"
                                                        className="student-edit"
                                                        onClick={() => handleEdit(student)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="student-delete"
                                                        onClick={() => handleDelete(student.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
