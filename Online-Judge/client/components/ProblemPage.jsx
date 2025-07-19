import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./styles/ProblemPage.css";
import Editor from "@monaco-editor/react";

const languageMap = {
  cpp: "cpp",
  c: "c",
  java: "java",
  python: "python",
};

const languageTemplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello, World!\\n");
    return 0;
}`,
  python: `# Write your Python code here
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  java: `public class Main {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}`,
};

// Simple icon components to replace lucide-react
const ChevronLeft = ({ className, onClick }) => (
  <svg className={className} onClick={onClick} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Play = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 18l4-4 4 4" />
  </svg>
);

const Send = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const Brain = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MessageSquare = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Code = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);
const handleBackClick = () => {
  navigate('/problems'); // Go to problems list
  // or navigate('/home'); // Go to home page
};

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(languageTemplates.cpp);
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [review, setReview] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Fetch problem data
    const fetchProblem = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_BASE_URL}/api/problems/${id}`
        );
        setProblem(res.data);
      } catch (err) {
        console.error("Failed to load problem:", err);
      }
    };

    // Fetch submissions
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_BASE_URL}/api/problems/${id}/submissions`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSubmissions(res.data);
      } catch (err) {
        console.error("Failed to load submissions:", err);
        setSubmissions([]);
      }
    };

    // Fetch comments
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_BASE_URL}/api/problems/${id}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments:", err);
        setComments([]);
      }
    };

    fetchProblem();
    fetchSubmissions();
    fetchComments();
  }, [id]);

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const input = customInput || problem.visibleTestCases?.[activeTestIndex]?.input || "";
      const res = await axios.post(
        `${import.meta.env.VITE_COMPILER_BASE_URL}/api/compiler/run`,
        { language, code, input }
      );
      setOutput(res.data.output || res.data.stderr || "No output");
      setIsLoading(false);
    } catch (err) {
      console.error("Run failed:", err);
      setOutput("Execution failed.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_COMPILER_BASE_URL}/api/compiler/submit`,
        { code, language, problemId: id }
      );
      
      if (res.data?.results?.length > 0) {
        setTestResults(res.data.results);
        setOutput("");
      } else {
        setOutput("No results returned from submission.");
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Submit failed:", err);
      setOutput("Submission failed.");
      setIsLoading(false);
    }
  };

  const handleReviewCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_COMPILER_BASE_URL}/api/compiler/ai-review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setReview(data.review);
      } else {
        setReview("Error: " + data.error);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("AI review failed:", err);
      setReview("AI review failed: " + err.message);
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (newComment.trim()) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${import.meta.env.VITE_SERVER_BASE_URL}/api/problems/${id}/comments`,
          { content: newComment },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setComments([res.data, ...comments]);
        setNewComment("");
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
    }
  };

  if (!problem) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading Problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="problem-page-container">
      {/* Left Panel */}
      <div className="problem-left-panel">
        {/* Header */}
        <div className="problem-header">
          <div className="problem-header-content">
            <div className="problem-title-section">
  <ChevronLeft className="back-arrow" onClick={handleBackClick} />
  <h1 className="problem-title">{problem.title}</h1>
</div>
            <span className={`difficulty-badge difficulty-${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

   
        <div className="tab-navigation">
          {['description', 'submissions', 'comments'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

  
        <div className="tab-content">
          {activeTab === 'description' && (
            <div>
              <p className="problem-description">{problem.description}</p>

              {problem.examples?.length > 0 && (
                <div className="examples-section">
                  <h3 className="section-title">Examples:</h3>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="example-item">
                      <div className="example-line">
                        <strong className="example-label">Input:</strong>
                        <code className="example-code">{ex.input}</code>
                      </div>
                      <div className="example-line">
                        <strong className="example-label">Output:</strong>
                        <code className="example-code">{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div className="example-line">
                          <strong className="example-label">Explanation:</strong>
                          <span>{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints?.length > 0 && (
                <div>
                  <h3 className="section-title">Constraints:</h3>
                  <ul className="constraints-list">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="submissions-container">
              <h3 className="section-title">Submission History</h3>
              {submissions.length === 0 ? (
                <p>No submissions yet. Submit your solution to see results here!</p>
              ) : (
                submissions.map((sub, idx) => (
                  <div key={idx} className="submission-item">
                    <div className="submission-header">
                      <div className="submission-status">
                        {sub.status === 'Accepted' ? (
                          <CheckCircle className="status-icon status-accepted" />
                        ) : (
                          <XCircle className="status-icon status-failed" />
                        )}
                        <span className={`status-text ${
                          sub.status === 'Accepted' ? 'status-accepted' : 'status-failed'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <span className="submission-timestamp">
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="submission-details">
                      <span>{sub.language}</span>
                      <span>Runtime: {sub.runtime || 'N/A'}</span>
                      <span>Memory: {sub.memory || 'N/A'}</span>
                      {sub.testCasesPassed && sub.totalTestCases && (
                        <span>Tests: {sub.testCasesPassed}/{sub.totalTestCases}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-container">
              <h3 className="section-title">Discussion</h3>
              
        
              <div className="comment-form">
                <textarea
                  className="comment-textarea"
                  rows="3"
                  placeholder="Share your thoughts, hints, or ask questions..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="comment-actions">
                  <button onClick={addComment} className="comment-submit-btn">
                    <MessageSquare className="btn-icon" />
                    Comment
                  </button>
                </div>
              </div>

            
              {comments.length === 0 ? (
                <p>No comments yet. Start the discussion!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <div className="comment-item-header">
                      <div className="comment-user">
                        <User className="user-icon" />
                        <span className="comment-username">
                          {comment.userId?.username || 'Anonymous'}
                        </span>
                      </div>
                      <span className="submission-timestamp">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-actions-row">
                      <button className="comment-action-btn">
                        👍 {comment.likes || 0}
                      </button>
                      <button className="comment-action-btn">Reply</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

     
      <div className="code-right-panel">
      
        <div className="editor-header">
          <div className="editor-controls">
            <Code className="code-icon" />
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value;
                setLanguage(lang);
                setCode(languageTemplates[lang]);
              }}
              className="language-select"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>

      
        <div className="test-cases-header">
          <div className="test-case-tabs">
            {problem.visibleTestCases?.slice(0, 3).map((_, idx) => (
              <button
                key={idx}
                className={`test-case-tab ${activeTestIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveTestIndex(idx)}
              >
                Case {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="test-case-display">
          <div className="test-case-line">
            <span className="test-case-label">Input:</span>
            <code className="test-case-value">
              {problem.visibleTestCases?.[activeTestIndex]?.input || "N/A"}
            </code>
          </div>
          <div className="test-case-line">
            <span className="test-case-label">Expected:</span>
            <code className="test-case-value">
              {problem.visibleTestCases?.[activeTestIndex]?.output || "N/A"}
            </code>
          </div>
        </div>

   
        <div className="monaco-editor-container">
          <Editor
            height="100%"
            language={languageMap[language]}
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-light"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              renderWhitespace: "selection"
            }}
          />
        </div>


        <div className="custom-input-section">
          <label className="input-label">
            Custom Input (optional)
          </label>
          <textarea
            className="custom-input-textarea"
            rows="2"
            placeholder="Enter custom test input..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
        </div>


        <div className="action-buttons">
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="action-btn run-btn"
          >
            <Play className="btn-icon" />
            {isLoading ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="action-btn submit-btn"
          >
            <Send className="btn-icon" />
            {isLoading ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={handleReviewCode}
            disabled={isLoading}
            className="action-btn review-btn"
          >
            <Brain className="btn-icon" />
            {isLoading ? "Reviewing..." : "AI Review"}
          </button>
        </div>

      
        <div className="output-section">
          {output && (
            <div className="output-content">
              <h4 className="output-title">Output:</h4>
              <pre className="output-text">{output}</pre>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="output-content">
              <h4 className="output-title">Test Results:</h4>
              <div className="test-results-grid">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`test-result-item ${
                      result.passed ? 'test-result-passed' : 'test-result-failed'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {review && (
            <div className="ai-review-section">
              <h4 className="ai-review-title">
                <Brain className="btn-icon" />
                AI Code Review:
              </h4>
              <div className="ai-review-content">{review}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;