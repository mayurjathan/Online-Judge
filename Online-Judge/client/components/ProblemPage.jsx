import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshCw = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(languageTemplates.cpp);
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [review, setReview] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleBackClick = () => {
    navigate('/home');
  };

  useEffect(() => {
    fetchProblem();
    fetchSubmissions();
    fetchComments();
  }, [id]);

  // Fetch problem data
  const fetchProblem = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/problems/${id}`
      );
      setProblem(res.data);
    } catch (err) {
      console.error("Failed to load problem:", err);
      setOutput("❌ Failed to load problem. Please try again.");
    }
  };

  // Fetch user's submissions for this problem
  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/submissions/problem/${id}`,
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

  // Fetch comments for this problem
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/problems/${id}/comments`
      );
      setComments(res.data.comments || res.data || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setComments([]);
    }
  };

  // Handle code execution with custom input
  const handleRun = async () => {
    setIsLoading(true);
    setOutput("");
    setSubmissionResult(null);
    
    try {
      const input = customInput || problem.visibleTestCases?.[activeTestIndex]?.input || "";
      const res = await axios.post(
        `${import.meta.env.VITE_COMPILER_BASE_URL}/api/compiler/run`,
        { language, code, input }
      );
      
      if (res.data.output !== undefined) {
        setOutput(res.data.output || "No output");
      } else if (res.data.error) {
        setOutput(`❌ ${res.data.error}: ${res.data.message || 'Execution failed'}`);
      } else {
        setOutput("No output received");
      }
    } catch (err) {
      console.error("Run failed:", err);
      if (err.response?.data?.error) {
        setOutput(`❌ ${err.response.data.error}: ${err.response.data.message || 'Execution failed'}`);
      } else {
        setOutput("❌ Execution failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission - SECURE VERSION (No test case exposure)
  const handleSubmit = async () => {
    setIsLoading(true);
    setOutput("");
    setSubmissionResult(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOutput("❌ Please login to submit solutions.");
        setIsLoading(false);
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_COMPILER_BASE_URL}/api/compiler/submit`,
        { code, language, problemId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (res.data) {
        const { 
          passedAll, 
          overallStatus, 
          testCasesPassed, 
          totalTestCases, 
          message, 
          totalExecutionTime 
        } = res.data;
        
        // Store submission result
        setSubmissionResult({
          status: overallStatus,
          passed: passedAll,
          testCasesPassed,
          totalTestCases,
          executionTime: totalExecutionTime
        });

        // Show only summary results - NO test case details
        if (passedAll) {
          setOutput(`🎉 Accepted!\nAll ${totalTestCases} test cases passed.\nExecution time: ${totalExecutionTime}`);
        } else {
          setOutput(`❌ ${overallStatus}\n${testCasesPassed}/${totalTestCases} test cases passed.\nExecution time: ${totalExecutionTime}`);
        }
        
        // Refresh submissions list after a short delay
        setTimeout(() => {
          fetchSubmissions();
        }, 1000);
        
      } else {
        setOutput("❌ No response received from server.");
      }
    } catch (err) {
      console.error("Submit failed:", err);
      if (err.response?.data?.error) {
        const errorMsg = err.response.data.message || err.response.data.error;
        setOutput(`❌ ${err.response.data.error}\n${errorMsg}`);
      } else {
        setOutput("❌ Submission failed: " + (err.message || "Unknown error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle AI code review
  const handleReviewCode = async () => {
    setIsLoading(true);
    setReview("");
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_COMPILER_BASE_URL}/api/compiler/ai-review`,
        { code }
      );

      if (res.data?.review) {
        setReview(res.data.review);
      } else {
        setReview("No review received from AI service.");
      }
    } catch (err) {
      console.error("AI review failed:", err);
      if (err.response?.data?.error) {
        setReview(`Review Error: ${err.response.data.message || err.response.data.error}`);
      } else {
        setReview("AI review failed: " + (err.message || "Service unavailable"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a comment
  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add comments.");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_BASE_URL}/api/problems/${id}/comments`,
        { content: newComment.trim() },
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
      alert("Failed to add comment. Please try again.");
    }
  };

  // Get status icon for submissions
  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="status-icon status-accepted" />;
      case "Time Limit Exceeded":
        return <Clock className="status-icon status-tle" />;
      default:
        return <XCircle className="status-icon status-failed" />;
    }
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(languageTemplates[lang]);
    setOutput("");
    setReview("");
    setSubmissionResult(null);
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

        {/* Tabs */}
        <div className="tab-navigation">
          {['description', 'submissions', 'comments'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <div className="problem-description">
                {problem.description}
              </div>

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
                          <span className="example-explanation">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints?.length > 0 && (
                <div className="constraints-section">
                  <h3 className="section-title">Constraints:</h3>
                  <ul className="constraints-list">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {problem.tags?.length > 0 && (
                <div className="tags-section">
                  <h3 className="section-title">Tags:</h3>
                  <div className="tags-list">
                    {problem.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="submissions-container">
              <div className="submissions-header">
                <h3 className="section-title">Submission History</h3>
                <button 
                  onClick={fetchSubmissions} 
                  className="refresh-btn"
                  title="Refresh submissions"
                >
                  <RefreshCw className="refresh-icon" />
                </button>
              </div>
              
              {submissions.length === 0 ? (
                <div className="no-submissions">
                  <p>No submissions yet. Submit your solution to see results here!</p>
                </div>
              ) : (
                <div className="submissions-list">
                  {submissions.map((sub, idx) => (
                    <div key={sub._id || idx} className="submission-item">
                      <div className="submission-header">
                        <div className="submission-status">
                          {getStatusIcon(sub.status)}
                          <span className={`status-text ${
                            sub.status === 'Accepted' ? 'status-accepted' : 
                            sub.status === 'Time Limit Exceeded' ? 'status-tle' : 'status-failed'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                        <span className="submission-timestamp">
                          {new Date(sub.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="submission-details">
                        <span className="submission-language">{sub.language?.toUpperCase()}</span>
                        <span className="submission-runtime">
                          Runtime: {sub.runtime || 'N/A'}
                        </span>
                        {sub.testCasesPassed !== undefined && sub.totalTestCases && (
                          <span className="submission-tests">
                            Tests: {sub.testCasesPassed}/{sub.totalTestCases}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-container">
              <h3 className="section-title">Discussion</h3>
              
              {/* Add Comment */}
              <div className="comment-form">
                <textarea
                  className="comment-textarea"
                  rows="3"
                  placeholder="Share your thoughts, hints, or ask questions..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={1000}
                />
                <div className="comment-actions">
                  <span className="char-count">{newComment.length}/1000</span>
                  <button 
                    onClick={addComment} 
                    className="comment-submit-btn"
                    disabled={!newComment.trim()}
                  >
                    <MessageSquare className="btn-icon" />
                    Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="no-comments">
                  <p>No comments yet. Start the discussion!</p>
                </div>
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-item-header">
                        <div className="comment-user">
                          <User className="user-icon" />
                          <span className="comment-username">
                            {comment.userId?.name || comment.userId?.username || 'Anonymous'}
                          </span>
                        </div>
                        <span className="comment-timestamp">
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
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="code-right-panel">
        {/* Editor Header */}
        <div className="editor-header">
          <div className="editor-controls">
            <Code className="code-icon" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="language-select"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>

        {/* Test Cases Tabs */}
        {problem.visibleTestCases?.length > 0 && (
          <div className="test-cases-header">
            <div className="test-case-tabs">
              {problem.visibleTestCases.slice(0, 3).map((_, idx) => (
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
        )}

        {/* Test Case Display */}
        {problem.visibleTestCases?.length > 0 && (
          <div className="test-case-display">
            <div className="test-case-line">
              <span className="test-case-label">Input:</span>
              <code className="test-case-value">
                {problem.visibleTestCases[activeTestIndex]?.input || "N/A"}
              </code>
            </div>
            <div className="test-case-line">
              <span className="test-case-label">Expected:</span>
              <code className="test-case-value">
                {problem.visibleTestCases[activeTestIndex]?.output || "N/A"}
              </code>
            </div>
          </div>
        )}

        {/* Code Editor */}
        <div className="monaco-editor-container">
          <Editor
            height="100%"
            language={languageMap[language]}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-light"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              renderWhitespace: "selection",
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
            }}
          />
        </div>

        {/* Custom Input */}
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

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={handleRun}
            disabled={isLoading || !code.trim()}
            className="action-btn run-btn"
            title="Run code with sample input"
          >
            <Play className="btn-icon" />
            {isLoading ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !code.trim()}
            className="action-btn submit-btn"
            title="Submit solution for evaluation"
          >
            <Send className="btn-icon" />
            {isLoading ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={handleReviewCode}
            disabled={isLoading || !code.trim()}
            className="action-btn review-btn"
            title="Get AI code review"
          >
            <Brain className="btn-icon" />
            {isLoading ? "Reviewing..." : "AI Review"}
          </button>
        </div>

        {/* Output/Results */}
        <div className="output-section">
        
          
          {/* Output Display */}
          {output && (
            <div className="output-content">
              <h4 className="output-title">Result:</h4>
              <pre className="output-text">{output}</pre>
            </div>
          )}

          {/* AI Review */}
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