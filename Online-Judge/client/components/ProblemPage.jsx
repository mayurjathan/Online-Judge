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

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(languageTemplates.cpp);
  const [output, setOutput] = useState("");
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [review, setReview] = useState("");

  useEffect(() => {
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

    fetchProblem();
  }, [id]);

  const handleRun = async () => {
    try {
      const input =
        customInput || problem.visibleTestCases?.[activeTestIndex]?.input || "";
      const res = await axios.post(
        `${import.meta.env.VITE_COMPILER_BASE_URL}/api/compiler/run`,
        { language, code, input }
      );
      setOutput(res.data.output || res.data.stderr || "No output");
    } catch (err) {
      console.error("Run failed:", err);
      setOutput("Execution failed.");
    }
  };

  const handleSubmit = async () => {
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
    } catch (err) {
      console.error("Submit failed:", err);
      setOutput("Submission failed.");
    }
  };

  const handleReviewCode = async () => {
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
    } catch (err) {
      console.error("AI review failed:", err);
      setReview("AI review failed: " + err.message);
    }
  };

  if (!problem) return <p className="loading">Loading Problem...</p>;

  return (
    <div className="problem-container">
      <div className="problem-description">
        <h2>{problem.title}</h2>
        <p>
          <strong>Difficulty:</strong>{" "}
          <span className={problem.difficulty.toLowerCase()}>
            {problem.difficulty}
          </span>
        </p>
        <p>{problem.description}</p>

        {problem.examples?.length > 0 && (
          <>
            <h3>Examples:</h3>
            <ul>
              {problem.examples.map((ex, idx) => (
                <li key={idx}>
                  <strong>Input:</strong> {ex.input}
                  <br />
                  <strong>Output:</strong> {ex.output}
                  <br />
                  {ex.explanation && (
                    <>
                      <strong>Explanation:</strong> {ex.explanation}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {problem.constraints?.length > 0 && (
          <>
            <h3>Constraints:</h3>
            <ul>
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="code-editor">
        <div className="editor-header">
          <h3>Code Editor</h3>
          <select
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              setCode(languageTemplates[lang]);
            }}
          >
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="test-tabs">
          {problem.visibleTestCases?.slice(0, 3).map((_, idx) => (
            <button
              key={idx}
              className={activeTestIndex === idx ? "active-tab" : ""}
              onClick={() => setActiveTestIndex(idx)}
            >
              Example {idx + 1}
            </button>
          ))}
        </div>

        <div className="example-box">
          <strong>Input:</strong>{" "}
          {problem.visibleTestCases?.[activeTestIndex]?.input || "N/A"}
          <br />
          <strong>Expected:</strong>{" "}
          {problem.visibleTestCases?.[activeTestIndex]?.output || "N/A"}
        </div>

        <Editor
          height="400px"
          language={languageMap[language]}
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-light"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
        />

        <textarea
          className="custom-input"
          placeholder="Optional custom input"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />

        <div className="button-group">
          <button onClick={handleRun}>Run Code</button>
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={handleReviewCode}>Review Code</button>
        </div>

        <h4>Output:</h4>
        <pre>{output}</pre>

        {testResults.length > 0 && (
          <>
            <h4>Test Cases:</h4>
            <div className="test-case-grid">
              {testResults.map((result, idx) => (
                <button
                  key={idx}
                  className={`test-case-button ${
                    result.passed ? "passed" : "failed"
                  }`}
                >
                  Test Case {idx + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {review && (
          <div className="card mt-4">
            <div className="card-body">
              <h3 className="card-title fw-bold">AI Code Review:</h3>
              <pre className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                {review}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;
