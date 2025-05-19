import React, { useState } from "react";
import "./App.css";

function App() {
  const [files, setFiles] = useState([
    { name: "main.py", code: "print('Hello from Python!')" },
  ]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("white");

  const currentFile = files[currentFileIndex];

  const updateCode = (newCode) => {
    const updatedFiles = [...files];
    updatedFiles[currentFileIndex] = {
      ...updatedFiles[currentFileIndex],
      code: newCode,
    };
    setFiles(updatedFiles);
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentFile.code }),
      });
      const data = await res.json();
      setOutput(data.output || "");
      setError(data.error || "");
    } catch (err) {
      setError("Fetch error: " + err.message);
    }
    setLoading(false);
  };

  const saveFile = () => {
    let fileName = prompt("Enter a file name to save:", currentFile.name);
    if (!fileName) return;

    if (!fileName.endsWith(".py")) {
      fileName += ".py";
    }

    // Update file name in state if changed
    if (fileName !== currentFile.name) {
      const updatedFiles = [...files];
      updatedFiles[currentFileIndex] = {
        ...updatedFiles[currentFileIndex],
        name: fileName,
      };
      setFiles(updatedFiles);
    }

    const element = document.createElement("a");
    const file = new Blob([currentFile.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const addNewFile = () => {
    const newFileName = prompt("Enter new file name:", `file${files.length + 1}.py`);
    if (!newFileName) return;
    if (files.find((f) => f.name === newFileName)) {
      alert("File name already exists!");
      return;
    }
    const newFiles = [...files, { name: newFileName, code: "# New Python file\n" }];
    setFiles(newFiles);
    setCurrentFileIndex(newFiles.length - 1);
    setOutput("");
    setError("");
  };

  const deleteFile = (index) => {
    if (files.length === 1) {
      alert("Cannot delete the only remaining file.");
      return;
    }
    const confirmDelete = window.confirm(`Delete file "${files[index].name}"?`);
    if (!confirmDelete) return;

    const newFiles = files.filter((_, i) => i !== index);

    let newCurrentIndex = currentFileIndex;
    if (index < currentFileIndex) {
      newCurrentIndex = currentFileIndex - 1;
    } else if (index === currentFileIndex) {
      newCurrentIndex = 0;
    }

    setFiles(newFiles);
    setCurrentFileIndex(newCurrentIndex);
    setOutput("");
    setError("");
  };

  const switchFile = (index) => {
    setCurrentFileIndex(index);
    setOutput("");
    setError("");
  };

  return (
    <div className={`container ${theme}`}>
      <h1 className="title">🐍 Python Code Runner</h1>

      <div className="theme-selector">
        <label>Select Theme: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="white">White</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* File Tabs */}
      <div className="file-tabs">
        {files.map((file, idx) => (
          <div
            key={file.name}
            className={`file-tab-wrapper ${idx === currentFileIndex ? "active" : ""}`}
          >
            <button
              className="file-tab"
              onClick={() => switchFile(idx)}
              title={`Switch to ${file.name}`}
            >
              {file.name}
            </button>
            {files.length > 1 && (
              <button
                className="delete-file-btn"
                onClick={() => deleteFile(idx)}
                title={`Delete ${file.name}`}
                aria-label={`Delete ${file.name}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          className="file-tab add-file-btn"
          onClick={addNewFile}
          title="Add new file"
        >
          + Add File
        </button>
      </div>

      <textarea
        rows={15}
        value={currentFile.code}
        onChange={(e) => updateCode(e.target.value)}
        className={`textarea ${theme}`}
      />

      <div className="button-group">
        <button onClick={runCode} className="button" disabled={loading}>
          {loading ? "⏳ Running..." : "▶️ Run Code"}
        </button>
        <button onClick={saveFile} className="button">
          💾 Save File
        </button>
      </div>

      <div className="section output-section">
        <h3>📤 Output:</h3>
        <pre className="output">{output || "No output yet."}</pre>
        {error && (
          <>
            <h3>❌ Error:</h3>
            <pre className="error">{error}</pre>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
