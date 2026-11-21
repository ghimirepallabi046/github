
import { useEffect, useState } from "react";

type Student = {
    id: number;
    studentId: string;
    name: string;
    className: string;
    rollNo: string;
    email: string;
};

type Result = {
    studentId: string;
    studentName: string;
    english: number;
    nepali: number;
    mathematics: number;
    science: number;
    socialStudies: number;
};

export default function AcademicResults() {

    // Get students from localStorage
    const students: Student[] = (() => {
        try {
            return JSON.parse(localStorage.getItem("students") || "[]");
        } catch {
            return [];
        }
    })();

    // Student result form
    const [form, setForm] = useState<Result>({
        studentId: "",
        studentName: "",
        english: 0,
        nepali: 0,
        mathematics: 0,
        science: 0,
        socialStudies: 0,
    });

    // Search state
    const [search, setSearch] = useState("");

    // Get saved results
    const [results, setResults] = useState<Result[]>(() => {
        try {
            return JSON.parse(localStorage.getItem("results") || "[]");
        } catch {
            return [];
        }
    });

    // Save results automatically
    useEffect(() => {
        localStorage.setItem("results", JSON.stringify(results));
    }, [results]);

    // Select student
    const handleStudentChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedStudent = students.find(
            (student) => student.studentId === e.target.value
        );

        setForm({
            ...form,
            studentId: selectedStudent?.studentId || "",
            studentName: selectedStudent?.name || "",
        });
    };

    // Handle marks input
    const handleMarksChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: Number(e.target.value),
        });
    };

    // Save result
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const marks = [
            form.english,
            form.nepali,
            form.mathematics,
            form.science,
            form.socialStudies,
        ];

        if (marks.some((mark) => mark < 0 || mark > 100)) {
            alert("Marks must be between 0 and 100.");
            return;
        }

        if (!form.studentId) {
            alert("Please select a student.");
            return;
        }

        const alreadyExists = results.some(
            (result) => result.studentId === form.studentId
        );

        if (alreadyExists) {
            alert("Result for this student already exists!");
            return;
        }

        setResults((previous) => [...previous, form]);

        alert("Result saved successfully!");

        setForm({
            studentId: "",
            studentName: "",
            english: 0,
            nepali: 0,
            mathematics: 0,
            science: 0,
            socialStudies: 0,
        });
    };

    // Search by Student ID or Name
    const filteredResults = results.filter((result) =>
        result.studentId.toLowerCase().includes(search.toLowerCase()) ||
        result.studentName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: "25px" }}>

            <h2>Academic Result Management</h2>

            <form onSubmit={handleSubmit}>

                <label>Select Student:</label>
                <br />

                <select
                    value={form.studentId}
                    onChange={handleStudentChange}
                    required
                    style={{
                        padding: "10px",
                        margin: "10px 0",
                        width: "250px"
                    }}
                >
                    <option value="">-- Select Student ID --</option>

                    {students.map((student) => (
                        <option key={student.id} value={student.studentId}>
                            {student.studentId}
                        </option>
                    ))}
                </select>

                <br />

                <label>Student Name:</label>
                <br />

                <input
                    value={form.studentName}
                    placeholder="Student name appears automatically"
                    readOnly
                    style={{
                        padding: "10px",
                        margin: "10px 0",
                        width: "230px"
                    }}
                />

                <h3>Enter Subject Marks (Out of 100)</h3>

                {[
                    ["English", "english"],
                    ["Nepali", "nepali"],
                    ["Mathematics", "mathematics"],
                    ["Science", "science"],
                    ["Social Studies", "socialStudies"],
                ].map(([label, name]) => (
                    <div key={name} style={{ marginBottom: "10px" }}>

                        <label>{label}: </label>

                        <input
                            type="number"
                            name={name}
                            min="0"
                            max="100"
                            value={form[name as keyof Result]}
                            onChange={handleMarksChange}
                            required
                        />

                    </div>
                ))}

                <button type="submit">Save Result</button>

            </form>

            <h3>Student Results</h3>

            {/* Search Box */}
            <input
                type="text"
                placeholder="Search by Student ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    padding: "10px",
                    width: "280px",
                    marginBottom: "15px",
                    borderRadius: "5px",
                    border: "1px solid #ccc"
                }}
            />

            {/* Results Table */}
            <table
                border={1}
                cellPadding={8}
                style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    maxWidth: "750px"
                }}
            >
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Total</th>
                        <th>Percentage</th>
                        <th>Book Level</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredResults.length > 0 ? (
                        filteredResults.map((result, index) => {

                            const total =
                                result.english +
                                result.nepali +
                                result.mathematics +
                                result.science +
                                result.socialStudies;

                            const percentage = total / 5;

                            return (
                                <tr key={index}>
                                    <td>{result.studentId}</td>
                                    <td>{result.studentName}</td>
                                    <td>{total}/500</td>
                                    <td>{percentage.toFixed(2)}%</td>
                                    <td>Pending</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center" }}>
                                No results found.
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>

        </div>
    );
}
