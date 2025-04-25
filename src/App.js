import React, { useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    education: '',
    experience: '',
    certifications: '',
    skills: '',
    jobDescription: '',
  });

  const [previewText, setPreviewText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://your-preview-lambda-url', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setPreviewText(data.preview);
      setEditedText(data.preview); // Initialize the editable version
      setShowEditor(true);
    } catch (err) {
      setError('Preview generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://your-pdf-lambda-url', {
        method: 'POST',
        body: JSON.stringify({ resumeText: editedText }),
        headers: { 'Content-Type': 'application/json' },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('PDF generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Resume Builder</h1>
      <form onSubmit={handlePreview}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
        <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
        <textarea name="education" value={form.education} onChange={handleChange} placeholder="Education" />
        <textarea name="experience" value={form.experience} onChange={handleChange} placeholder="Experience" />
        <textarea name="certifications" value={form.certifications} onChange={handleChange} placeholder="Certifications" />
        <textarea name="skills" value={form.skills} onChange={handleChange} placeholder="Skills" />
        <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange} placeholder="Target Job Description" />
        <button type="submit">{loading ? 'Loading...' : 'Generate Resume Preview'}</button>
      </form>

      {error && <div className="error">{error}</div>}

      {showEditor && (
        <>
          <h2>Edit Resume Before Download</h2>
          <textarea
            className="editor"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={20}
          />
          <button className="download-btn" onClick={handleDownload}>
            Download Final PDF
          </button>
        </>
      )}
    </div>
  );
}

export default App;

