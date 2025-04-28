import React, { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    education: "",
    experience: "",
    certifications: "",
    skills: "",
    languages: "",
    extracurricular: "",
    jobDescription: ""
  });

  const [resumeData, setResumeData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [stage, setStage] = useState("form"); // form → preview
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateResume = async () => {
    try {
      setLoading(true);
      setSuccessMessage("");
      const response = await fetch("https://https://2no2a0hmtd.execute-api.us-east-1.amazonaws.com/dev/resume-view2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResumeData(data.resume);
      setEditedData(data.resume);
      setStage("preview");
      setSuccessMessage("✅ Resume generated successfully!");
    } catch (err) {
      console.error("Resume generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      setSuccessMessage("");
      const response = await fetch("https://e73kxnqelj.execute-api.us-east-1.amazonaws.com/dev/resume-pdf2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      setSuccessMessage("✅ PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App container">
      <h1>AI Resume Generator</h1>
      <div className="subheading">Create and download an ATS-friendly resume</div>

      {stage === "form" && (
        <div className="form">
          {[
            "name",
            "email",
            "phone",
            "linkedin",
            "education",
            "experience",
            "certifications",
            "skills",
            "languages",
            "extracurricular",
            "jobDescription"
          ].map((field) => (
            <textarea
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              rows={field === "experience" || field === "jobDescription" ? 5 : 2}
            />
          ))}
          <button onClick={handleGenerateResume} disabled={loading}>
            {loading ? "Generating..." : "Generate Resume"}
          </button>

          {loading && (
            <>
              <div className="loader"></div>
              <div className="loading-text">Generating your resume...</div>
            </>
          )}
        </div>
      )}

      {stage === "preview" && resumeData && (
        <div className="resume-card">
          <div className="header">
            <h2>{editedData.name}</h2>
            <p className="role">{editedData.currentRole}</p>
            <p className="contact">
              📞 {editedData.phone} | ✉️ {editedData.email} | 🔗 {editedData.linkedin}
            </p>
          </div>

          <hr />

          <section>
            <h3>Professional Summary</h3>
            <p>{editedData.summary}</p>
          </section>

          <hr />

          <section>
            <h3>Skills</h3>
            <p>{editedData.skills}</p>
          </section>

          <hr />

          <section>
            <h3>Experience</h3>
            <p>{editedData.experience}</p>
          </section>

          <hr />

          <section>
            <h3>Education</h3>
            <p>{editedData.education}</p>
          </section>

          <hr />

          {editedData.certifications && (
            <>
              <h3>Certifications</h3>
              <p>{editedData.certifications}</p>
              <hr />
            </>
          )}

          {editedData.languages && (
            <>
              <h3>Languages</h3>
              <p>{editedData.languages}</p>
              <hr />
            </>
          )}

          {editedData.extracurricular && (
            <>
              <h3>Extra-Curricular Activities</h3>
              <p>{editedData.extracurricular}</p>
            </>
          )}

          <div className="button-group">
            <button onClick={() => setStage("form")}>Back</button>
            <button className="download-btn" onClick={handleDownloadPDF} disabled={loading}>
              {loading ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>

          {loading && (
            <>
              <div className="loader"></div>
              <div className="loading-text">Preparing PDF...</div>
            </>
          )}
        </div>
      )}

      {successMessage && <div className="success">{successMessage}</div>}
    </div>
  );
}

export default App;
