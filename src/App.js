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
    jobDescription: "",
  });

  const [resumeData, setResumeData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [stage, setStage] = useState("form");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditedChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleGenerateResume = async () => {
    try {
      setLoading(true);
      setSuccessMessage("");
      const response = await fetch("https://2no2a0hmtd.execute-api.us-east-1.amazonaws.com/dev/resume-view2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResumeData(data);
      setEditedData(data);
      setStage("preview");
      setSuccessMessage("✅ Resume generated successfully!");
    } catch (err) {
      console.error("Resume generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      setSuccessMessage("");
      const response = await fetch("https://e73kxnqelj.execute-api.us-east-1.amazonaws.com/dev/resume-pdf2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
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
      <div className="subheading">Create and edit your professional resume</div>

      {stage === "form" && (
        <div className="form">
          {Object.keys(formData).map((field) => (
            <textarea
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              rows={field === "experience" || field === "jobDescription" ? 4 : 2}
            />
          ))}
          <button onClick={handleGenerateResume} disabled={loading}>
            {loading ? "Generating..." : "Generate Resume"}
          </button>

          {loading && <div className="loader">Generating your resume...</div>}
        </div>
      )}

      {stage === "preview" && editedData && (
        <div className="resume-card">
          <div className="header">
            <input
              type="text"
              name="name"
              value={editedData.name}
              onChange={handleEditedChange}
              className="edit-field big-text"
            />
            <input
              type="text"
              name="currentRole"
              value={editedData.currentRole}
              onChange={handleEditedChange}
              className="edit-field small-text"
            />
            <p className="contact">
              📞 <input
                type="text"
                name="phone"
                value={editedData.phone}
                onChange={handleEditedChange}
                className="edit-inline"
              /> | ✉️ <input
                type="text"
                name="email"
                value={editedData.email}
                onChange={handleEditedChange}
                className="edit-inline"
              /> | 🔗 <input
                type="text"
                name="linkedin"
                value={editedData.linkedin}
                onChange={handleEditedChange}
                className="edit-inline"
              />
            </p>
          </div>

          <hr />

          <section>
            <h3>Professional Summary</h3>
            <textarea
              name="summary"
              value={editedData.summary}
              onChange={handleEditedChange}
              rows={4}
              className="edit-area"
            />
          </section>

          <hr />

          <section>
            <h3>Skills</h3>
            <textarea
              name="skills"
              value={editedData.skills}
              onChange={handleEditedChange}
              rows={3}
              className="edit-area"
            />
          </section>

          <hr />

          <section>
            <h3>Experience</h3>
            <textarea
              name="experience"
              value={editedData.experience}
              onChange={handleEditedChange}
              rows={5}
              className="edit-area"
            />
          </section>

          <hr />

          <section>
            <h3>Education</h3>
            <textarea
              name="education"
              value={editedData.education}
              onChange={handleEditedChange}
              rows={3}
              className="edit-area"
            />
          </section>

          <hr />

          {editedData.certifications && (
            <>
              <h3>Certifications</h3>
              <textarea
                name="certifications"
                value={editedData.certifications}
                onChange={handleEditedChange}
                rows={3}
                className="edit-area"
              />
              <hr />
            </>
          )}

          {editedData.languages && (
            <>
              <h3>Languages</h3>
              <textarea
                name="languages"
                value={editedData.languages}
                onChange={handleEditedChange}
                rows={3}
                className="edit-area"
              />
              <hr />
            </>
          )}

          {editedData.extracurricular && (
            <>
              <h3>Extra-Curricular Activities</h3>
              <textarea
                name="extracurricular"
                value={editedData.extracurricular}
                onChange={handleEditedChange}
                rows={3}
                className="edit-area"
              />
            </>
          )}

          <div className="button-group">
            <button onClick={() => setStage("form")}>Back</button>
            <button className="download-btn" onClick={handleDownloadPDF} disabled={loading}>
              {loading ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>

          {loading && <div className="loader">Preparing your PDF...</div>}
        </div>
      )}

      {successMessage && <div className="success">{successMessage}</div>}
    </div>
  );
}

export default App;
