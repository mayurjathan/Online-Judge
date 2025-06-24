import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Home.css";

function Home() {
  const [problems, setProblems] = useState([]);

  const fetchProblems = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/problems");
      setProblems(res.data);
    } catch (err) {
      console.error("Failed to fetch problems:", err);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  return (
    <div className="home-page">
      <header className="home-header">
  <h1 className="site-title">Online Judge</h1>
  <img
    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    alt="Profile"
    className="profile-icon"
  />
</header>


      <main className="problem-section">
        <h2>Problems</h2>
        <div className="problem-list-box">
          {problems.length === 0 ? (
            <p>No problems found.</p>
          ) : (
            <ul className="problem-list">
              {problems.map((p) => (
                <li key={p._id} className="problem-item">
                  <h3>
                    {p.title}
                    <span className={`tag ${p.difficulty.toLowerCase()}`}>
                      {p.difficulty}
                    </span>
                  </h3>
                  <p>{p.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 Online Judge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
