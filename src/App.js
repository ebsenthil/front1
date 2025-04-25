import React, { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", linkedin: "",
    education: "", experience: "", certifications: "", skills: "", jobDescription: ""
  });

  const [resumeText, setResumeText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [stage, setStage] = useState("form");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateResume = async () => {
    try {
      const response = await fetch("https://2neudt4y81.execute-api.us-east-1.amazonaws.com/dev/resume-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResumeText(data.resume);
      setEditedText(data.resume);
      setStage("preview");
    } catch (err) {
      console.error("Resume generation failed", err);
    }
  };

  const handleEditChange = (e) => {
    setEditedText(e.target.value);
  };

  const handleGeneratePDF = async () => {
    try {
      const pdfPayload = {
        ...formData,
        experience: editedText // use updated text
      };

      const response = await fetch("https://lvpydfw4l6.execute-api.us-east-1.amazonaws.com/dev/resume-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfPayload)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  return (
    <div className="App container">
      <h1>AI Resume Generator</h1>
      <div className="subheading">Create and download an ATS-friendly resume</div>

      {stage === "form" && (
        <div className="form">
          {Object.keys(formData).map((field) => (
            <textarea
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              rows={field === "experience" || field === "jobDescription" ? 5 : 2}
            />
          ))}
          <button onClick={handleGenerateResume}>Generate Resume</button>
        </div>
      )}

      {stage === "preview" && (
        <div className="editor">
          <h2>Preview and Edit Resume</h2>
          <textarea rows={30} value={editedText} onChange={handleEditChange} />
          <div className="btn-row">
            <button onClick={() => setStage("form")}>Back</button>
            <button className="download-btn" onClick={handleGeneratePDF}>Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
