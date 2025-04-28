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
  const [editedData, setEditedData] = useState({});
  const [stage, setStage] = useState("form");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateResume = async () => {
    try {
      setLoading(true);
      setToastMessage("");

      const response = await fetch("https://2no2a0hmtd.execute-api.us-east-1.amazonaws.com/dev/resume-view2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResumeData(data);  // 🚀 save entire structured JSON
      setEditedData(data);  // 🚀 editable copy
      setStage("preview");
      showToast("✅ Resume generated successfully!");
    } catch (err) {
      console.error("Resume generation failed", err);
      showToast("❌ Failed to generate resume");
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
      setToastMessage("");

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
      showToast("✅ PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed", err);
      showToast("❌ Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setResumeData(null);
    setEditedData({});
    setStage("form");
    setToastMessage("");
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
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

          <div className="button-group">
            <button onClick={handleGenerateResume} disabled={loading}>
              {loading ? "Generating..." : "Generate Resume"}
            </button>
            <button onClick={resetForm} className="reset-btn" disabled={loading}>
              Clear
            </button>
          </div>
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
            <ul>
              {Array.isArray(editedData.skills) ? editedData.skills.map((skill, idx) => <li key={idx}>{skill}</li>) : <li>{editedData.skills}</li>}
            </ul>
          </section>

          <hr />

          <section>
            <h3>Experience</h3>
            {Array.isArray(editedData.experience) && editedData.experience.map((exp, idx) => (
              <div key={idx}>
                <strong>{exp.title} | {exp.company}</strong><br />
                <em>{exp.location} | {exp.period}</em>
                <ul>
                  {exp.responsibilities.map((resp, rIdx) => <li key={rIdx}>{resp}</li>)}
                </ul>
              </div>
            ))}
          </section>

          <hr />

          <section>
            <h3>Education</h3>
            <ul>
              {Array.isArray(editedData.education) ? editedData.education.map((edu, idx) => <li key={idx}>{edu}</li>) : <li>{editedData.education}</li>}
            </ul>
          </section>

          <hr />

          {editedData.certifications && (
            <>
              <h3>Certifications</h3>
              <ul>
                {Array.isArray(editedData.certifications) ? editedData.certifications.map((cert, idx) => <li key={idx}>{cert}</li>) : <li>{editedData.certifications}</li>}
              </ul>
              <hr />
            </>
          )}

          {editedData.languages && (
            <>
              <h3>Languages</h3>
              <ul>
                {Array.isArray(editedData.languages) ? editedData.languages.map((lang, idx) => <li key={idx}>{lang}</li>) : <li>{editedData.languages}</li>}
              </ul>
              <hr />
            </>
          )}

          {editedData.extracurricular && (
            <>
              <h3>Extra-Curricular Activities</h3>
              <ul>
                {Array.isArray(editedData.extracurricular) ? editedData.extracurricular.map((act, idx) => <li key={idx}>{act}</li>) : <li>{editedData.extracurricular}</li>}
              </ul>
            </>
          )}

          <div className="button-group">
            <button onClick={() => setStage("form")}>Back</button>
            <button className="download-btn" onClick={handleDownloadPDF} disabled={loading}>
              {loading ? "Preparing PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      )}

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}

export default App;
