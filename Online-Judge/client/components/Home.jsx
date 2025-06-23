import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Home.css"; // optional styling file

function Home() {
  const [problems, setProblems] = useState([]);

//   useEffect(() => {
//     // Fetch problems from backend (replace with real API later)
//     const fetchProblems = async () => {
//       try {
//         const res = await axios.get("http://localhost:5050/api/problems");
//         setProblems(res.data);
//       } catch (err) {
//         console.error("Failed to fetch problems:", err);
//       }
//     };

//     fetchProblems();
//   }, []);

  return (
    <div className="home-container">
      <header className="header">
        <h1>Online Judge</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/profile">Profile</a>
          <a href="/logout">Logout</a>
        </nav>
      </header>

      <main className="main-content">
        <h2>Problem List</h2>
        {problems.length === 0 ? (
          <p>Loading problems...</p>
        ) : (
          <ul className="problem-list">
            {problems.map((problem) => (
              <li key={problem._id} className="problem-item">
                <a href={`/problem/${problem._id}`}>{problem.title}</a> –{" "}
                <span>{problem.difficulty}</span>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 ONLINE Judge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
