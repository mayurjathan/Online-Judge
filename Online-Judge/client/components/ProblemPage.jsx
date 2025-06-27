import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./styles/ProblemPage.css";

const languageTemplates = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
  python: `# Write your Python code here
def main():
    pass

if __name__ == "__main__":
    main()`,
  java: `public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`
};

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(languageTemplates.cpp);
  const [output, setOutput] = useState("");
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5050/api/problems/${id}`).then((res) => {
      setProblem(res.data);
    });
  }, [id]);

  const handleRun = async () => {
    try {
      const input =
        customInput || problem.testCases?.[activeTestIndex]?.input || "";
      const res = await axios.post("http://localhost:8000/run", {
        language,
        code,
        input,
      });
      setOutput(res.data.output || res.data.stderr);
    } catch (err) {
      setOutput("Execution failed.");
    }
  };

  const handleSubmit = async () => {
    if (!problem?.testCases?.length) return;
    const results = [];

    for (const test of problem.testCases) {
      const res = await axios.post("http://localhost:8000/run", {
        language,
        code,
        input: test.input,
      });

      const actual = res.data.output?.trim() || "";
      const expected = test.output.trim();
      results.push({
        input: test.input,
        expected,
        actual,
        passed: actual === expected,
      });
    }

    const summary = results
      .map(
        (r, i) =>
          `Test ${i + 1}: ${r.passed ? "Passed" : "Failed"}\nInput: ${
            r.input
          }\nExpected: ${r.expected}\nGot: ${r.actual}`
      )
      .join("\n\n");

    setOutput(summary);
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
                  <strong>Explanation:</strong> {ex.explanation}
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
              setLanguage(e.target.value);
              setCode(languageTemplates[e.target.value]);
            }}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="test-tabs">
          {problem.testCases?.map((_, idx) => (
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
          {problem.testCases?.[activeTestIndex]?.input || "N/A"}
          <br />
          <strong>Expected:</strong>{" "}
          {problem.testCases?.[activeTestIndex]?.output || "N/A"}
        </div>

        <textarea
          className="code-area"
          value={code}
          onChange={(e) => setCode(e.target.value)}
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
        </div>

        <h4>Output:</h4>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default ProblemPage;
