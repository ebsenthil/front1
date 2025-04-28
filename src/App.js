import React, { useState } from "react";
import "./App.css";

function App() {
    const initialFormData = {
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
    };

    const [formData, setFormData] = useState(initialFormData);
    const [editedData, setEditedData] = useState(null);
    const [stage, setStage] = useState("form"); // 'form', 'preview'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditedChange = (e) => {
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setEditedData(null);
        setStage("form");
        setError("");
        setSuccessMessage("");
        setLoading(false);
    };

    const handleGenerateResume = async () => {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        if (!formData.name || !formData.jobDescription) {
            setError("Please provide at least your Name and the Job Description.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("https://2no2a0hmtd.execute-api.us-east-1.amazonaws.com/dev/resume-view2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            const formattedData = {
                ...data,
                skills: Array.isArray(data.skills) ? data.skills : (data.skills ? String(data.skills).split(/,|\n/).map(s => s.trim()).filter(Boolean) : []),
                experience: Array.isArray(data.experience) ? data.experience : (data.experience ? [{ responsibilities: String(data.experience).split('\n').filter(Boolean) }] : []),
                education: Array.isArray(data.education) ? data.education : (data.education ? String(data.education).split('\n').map(s => s.trim()).filter(Boolean) : []),
                certifications: Array.isArray(data.certifications) ? data.certifications : (data.certifications ? String(data.certifications).split('\n').map(s => s.trim()).filter(Boolean) : []),
                languages: Array.isArray(data.languages) ? data.languages : (data.languages ? String(data.languages).split(/,|\n/).map(s => s.trim()).filter(Boolean) : []),
                extracurricular: Array.isArray(data.extracurricular) ? data.extracurricular : (data.extracurricular ? String(data.extracurricular).split('\n').map(s => s.trim()).filter(Boolean) : []),
            };

            setEditedData(formattedData);
            setStage("preview");
            setSuccessMessage("✅ Resume generated successfully! Review and edit below.");
        } catch (err) {
            console.error("Resume generation failed:", err);
            setError(`Resume generation failed: ${err.message}. Please check your input or try again.`);
            setEditedData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!editedData) {
            setError("No resume data available to download.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch("https://e73kxnqelj.execute-api.us-east-1.amazonaws.com/dev/resume-pdf2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedData),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Ignore if response wasn't JSON
                }
                throw new Error(errorData?.error || `PDF Generation failed with status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const safeName = editedData.name ? editedData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'resume';
            a.download = `${safeName}_resume.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            setSuccessMessage("✅ PDF downloaded successfully!");
        } catch (err) {
            console.error("PDF generation failed:", err);
            setError(`PDF download failed: ${err.message}.`);
        } finally {
            setLoading(false);
        }
    };

    const renderTextArea = (fieldName, rows = 3) => {
        let value = editedData[fieldName];
        if (Array.isArray(value)) {
            if (fieldName === 'skills' || fieldName === 'languages') {
                value = value.join(", ");
            } else {
                value = value.join("\n");
            }
        }
        const displayValue = (typeof value === 'string' || typeof value === 'number') ? value : '';

        return (
            <textarea
                name={fieldName}
                value={displayValue}
                onChange={handleEditedChange}
                rows={rows}
                className="edit-area"
                placeholder={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                disabled={loading}
            />
        );
    };

    const renderExperienceEditor = () => {
        let experienceString = "";
        if (Array.isArray(editedData.experience) && editedData.experience.length > 0 && typeof editedData.experience[0] === 'object') {
            experienceString = editedData.experience.map(job => {
                const title = job.title || '';
                const company = job.company || '';
                const location = job.location || '';
                const period = job.period || '';
                const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities.map(r => `- ${r}`).join("\n") : (job.responsibilities || '');
                return `Title: ${title}\nCompany: ${company}\nLocation: ${location}\nPeriod: ${period}\nResponsibilities:\n${responsibilities}`;
            }).join("\n\n---\n\n");
        } else if (typeof editedData.experience === 'string') {
            experienceString = editedData.experience;
        } else if (Array.isArray(editedData.experience)) {
            experienceString = editedData.experience.join("\n\n---\n\n");
        }

        return (
            <textarea
                name="experience"
                value={experienceString}
                onChange={(e) => {
                    setEditedData({ ...editedData, experience: e.target.value });
                }}
                rows={10}
                className="edit-area"
                placeholder="Experience details (e.g., Title: ..., Company: ..., Responsibilities: - ...)"
                disabled={loading}
            />
        );
    };

    return (
        <div className="App container">
            <h1>AI Resume Generator</h1>
            <p className="subheading">Generate an ATS-friendly resume tailored to a job description.</p>

            {/* Informational Sections */}
            <div className="info-section-container">
                <div className="info-card why-use">
                    <h2>Beat the Bots & Get Noticed!</h2>
                    <p>Did you know many companies use Applicant Tracking Systems (ATS) to scan resumes before a human ever sees them? These systems look for specific keywords and formats related to the job description. A generic resume might get automatically rejected!</p>
                    <p>This AI Resume Generator helps you create <strong>ATS-compliant resumes tailored specifically to the job you're applying for.</strong> By aligning your skills and experience with the employer's requirements, you significantly increase your chances of:</p>
                    <ul>
                        <li>Passing the initial ATS screening.</li>
                        <li>Getting your resume in front of a hiring manager.</li>
                        <li>Receiving that important callback!</li>
                    </ul>
                    <p><em>Remember to <strong>update your resume details for each job application</strong> using the provided job description for the best results.</em></p>
                </div>

                <div className="info-card how-to-use">
                    <h2>How to Use This App</h2>
                    <ol>
                        <li><strong>Personal Details:</strong> Fill in your <code>Name</code>, <code>Email</code>, <code>Phone</code>, and optionally your <code>LinkedIn</code> profile URL.</li>
                        <li><strong>Education:</strong> Enter your degree(s), institution(s), location, completion year(s), etc. List each qualification on a new line.</li>
                        <li><strong>Experience:</strong> For each role, provide <code>Company Name</code>, <code>Job Title</code>, <code>Location</code>, <code>Dates</code>, and <code>Key Responsibilities & Achievements</code> (use bullet points). Enter each job as a separate block.</li>
                        <li><strong>Skills:</strong> List relevant technical and soft skills, separated clearly (e.g., with commas).</li>
                        <li><strong>Job Description:</strong> <strong>Paste the entire job description</strong> here. This is essential for tailoring.</li>
                        <li><strong>Optional Fields:</strong> Add <code>Certifications</code>, <code>Languages</code>, or <code>Extracurricular</code> activities if relevant.</li>
                        <li><strong>Generate:</strong> Click "Generate Resume".</li>
                        <li><strong>Review & Edit:</strong> Carefully check and modify the generated resume in the preview section below.</li>
                        <li><strong>Download:</strong> Click "Download PDF" when ready.</li>
                    </ol>
                </div>
            </div>

            {/* Error and Success Messages */}
            {error && <div className="error-toast">{error}</div>}
            {successMessage && !loading && <div className="success-toast">{successMessage}</div>}

            {/* Form Stage */}
            {stage === "form" && (
                <div className="form">
                    {Object.keys(formData).map((field) => (
                        <div key={field} className="form-field">
                            <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                            <textarea
                                id={field}
                                name={field}
                                placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}... ${field === 'experience' ? '(separate roles clearly)' : ''}`}
                                value={formData[field]}
                                onChange={handleChange}
                                rows={field === "experience" || field === "jobDescription" ? 5 : 2}
                                required={['name', 'email', 'experience', 'skills', 'jobDescription'].includes(field)}
                                disabled={loading}
                            />
                        </div>
                    ))}
                    <div className="button-group form-buttons">
                        <button onClick={handleGenerateResume} disabled={loading} className="generate-btn">
                            {loading ? "Generating..." : "Generate Resume"}
                        </button>
                        <button type="button" onClick={handleReset} className="reset-btn" disabled={loading}>
                            Reset Form
                        </button>
                    </div>
                    {loading && <div className="loader">✨ Analyzing your input and crafting your resume...</div>}
                </div>
            )}

            {/* Preview Stage */}
            {stage === "preview" && editedData && (
                <div className="resume-card">
                    <div className="resume-header">
                        <label htmlFor="preview-name">Full Name</label>
                        <input
                            type="text"
                            id="preview-name"
                            name="name"
                            value={editedData.name || ''}
                            onChange={handleEditedChange}
                            className="edit-field name-field"
                            placeholder="Full Name"
                            disabled={loading}
                        />
                        <label htmlFor="preview-role">Current Role / Target Role</label>
                        <input
                            type="text"
                            id="preview-role"
                            name="currentRole"
                            value={editedData.currentRole || ''}
                            onChange={handleEditedChange}
                            className="edit-field role-field"
                            placeholder="Current or Target Role"
                            disabled={loading}
                        />
                        <div className="contact-info">
                            <label htmlFor="preview-phone">Contact</label>
                            <div>
                                📞 <input type="tel" id="preview-phone" name="phone" value={editedData.phone || ''} onChange={handleEditedChange} className="edit-inline" placeholder="Phone" disabled={loading} /> |
                                ✉️ <input type="email" id="preview-email" name="email" value={editedData.email || ''} onChange={handleEditedChange} className="edit-inline" placeholder="Email" disabled={loading} /> |
                                🔗 <input type="url" id="preview-linkedin" name="linkedin" value={editedData.linkedin || ''} onChange={handleEditedChange} className="edit-inline" placeholder="LinkedIn URL (Optional)" disabled={loading} />
                            </div>
                        </div>
                    </div>

                    <hr />
                    <section>
                        <h3>Professional Summary</h3>
                        {renderTextArea("summary", 4)}
                    </section>

                    <hr />
                    <section>
                        <h3>Skills</h3>
                        {renderTextArea("skills", 3)}
                    </section>

                    <hr />
                    <section>
                        <h3>Experience</h3>
                        {renderExperienceEditor()}
                    </section>

                    <hr />
                    <section>
                        <h3>Education</h3>
                        {renderTextArea("education", 3)}
                    </section>

                    { (editedData.certifications && (Array.isArray(editedData.certifications) ? editedData.certifications.length > 0 : String(editedData.certifications).trim() !== '')) && (
                        <>
                            <hr />
                            <section>
                                <h3>Certifications</h3>
                                {renderTextArea("certifications", 3)}
                            </section>
                        </>
                    )}

                    { (editedData.languages && (Array.isArray(editedData.languages) ? editedData.languages.length > 0 : String(editedData.languages).trim() !== '')) && (
                        <>
                            <hr />
                            <section>
                                <h3>Languages</h3>
                                {renderTextArea("languages", 2)}
                            </section>
                        </>
                    )}

                    { (editedData.extracurricular && (Array.isArray(editedData.extracurricular) ? editedData.extracurricular.length > 0 : String(editedData.extracurricular).trim() !== '')) && (
                        <>
                            <hr />
                            <section>
                                <h3>Extra-Curricular Activities</h3>
                                {renderTextArea("extracurricular", 3)}
                            </section>
                        </>
                    )}

                    <div className="button-group preview-buttons">
                        <button onClick={() => { setStage("form"); setError(''); setSuccessMessage(''); }} disabled={loading} className="back-btn">
                            ← Back to Edit Input
                        </button>
                        <button onClick={handleReset} className="reset-btn" disabled={loading}>
                            Start Over
                        </button>
                        <button className="download-btn" onClick={handleDownloadPDF} disabled={loading}>
                            {loading ? "Preparing PDF..." : "Download PDF"}
                        </button>
                    </div>

                    {loading && <div className="loader">Processing...</div>}
                </div>
            )}
        </div>
    );
}

export default App;
