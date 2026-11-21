
import { useState } from "react";
import "./Dashboard.css";

import StudentManagement from "./StudentManagement";
import AcademicResults from "./AcademicResults";
import BookManagement from "./assets/components/sections/BookManagement";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <h2>📚 School Library</h2>

        <nav>
          {[
            "Dashboard",
            "Students",
            "Academic Results",
            "Book Management",
            "Issue Books",
            "Return Books",
            "Reports",
          ].map((item) => (

            <button
              key={item}
              className={`sidebar-link ${activePage === item ? "active" : ""
                }`}
              onClick={() => setActivePage(item)}
            >
              {item === "Dashboard" ? "🏠" :
                item === "Students" ? "👨‍🎓" :
                  item === "Academic Results" ? "📊" :
                    item === "Book Management" ? "📚" :
                      item === "Issue Books" ? "📤" :
                        item === "Return Books" ? "📥" : "📑"}

              {" "}{item}
            </button>

          ))}
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {activePage === "Dashboard" ? (

          <>
            <header className="dashboard-header">

              <div>
                <h1>Dashboard</h1>
                <p>
                  Welcome to School Library Management System
                </p>
              </div>

              <span>👤 Admin</span>

            </header>

            <h2 className="section-title">Overview</h2>

            <div className="stats-grid">

              <div className="stat-card blue">
                <h3>Total Students</h3>
                <h1>0</h1>
                <p>Registered Students</p>
              </div>

              <div className="stat-card green">
                <h3>Total Books</h3>
                <h1>0</h1>
                <p>Available Books</p>
              </div>

              <div className="stat-card orange">
                <h3>Issued Books</h3>
                <h1>0</h1>
                <p>Currently Issued</p>
              </div>

              <div className="stat-card purple">
                <h3>Returned Books</h3>
                <h1>0</h1>
                <p>Books Returned</p>
              </div>

            </div>

            <div className="welcome-card">

              <h2>📚 Library Management System</h2>

              <p>
                Manage students, academic results, books,
                book issues and returns in one place.
              </p>

            </div>

          </>

        ) : activePage === "Students" ? (

          <StudentManagement />

        ) : activePage === "Academic Results" ? (

          <AcademicResults />

        ) : activePage === "Book Management" ? (

          <BookManagement />

        ) : (

          <div className="welcome-card">
            <h1>{activePage}</h1>
            <p>This section will be developed next.</p>
          </div>

        )}

      </main>

    </div>
  );
}
