// App.js
import React, { useState } from "react";
import "./App.css"; // Make sure this path is correct

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
    // No need for resumeData state if editedData holds the generated/edited content
    // const [resumeData, setResumeData] = useState(null);
    const [editedData, setEditedData] = useState(null);
    const [stage, setStage] = useState("form"); // 'form', 'preview'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(""); // Store potential errors
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditedChange = (e) => {
        // Handle potential nested structure if needed later, for now assumes flat structure from preview
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };

     // Function to reset the form and state
     const handleReset = () => {
        setFormData(initialFormData);
        setEditedData(null);
        setStage('form');
        setError('');
        setSuccessMessage('');
        setLoading(false);
    };

    const handleGenerateResume = async () => {
        setLoading(true);
        setError(""); // Clear previous errors
        setSuccessMessage("");

        // Basic Validation (Example: Check for Name and Job Description)
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

            const data = await response.json(); // This parses the JSON string from the Lambda body

            if (!response.ok) {
                // Handle errors returned from Lambda (like 400 or 500)
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            // Ensure skills, experience, education etc are arrays if expected by preview/PDF
             const formattedData = {
                ...data,
                skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()) : []),
                experience: Array.isArray(data.experience) ? data.experience : [], // Assuming experience is already structured correctly by AI
                education: Array.isArray(data.education) ? data.education : (data.education ? data.education.split('\n') : []),
                certifications: Array.isArray(data.certifications) ? data.certifications : (data.certifications ? data.certifications.split('\n') : []),
                languages: Array.isArray(data.languages) ? data.languages : (data.languages ? data.languages.split(',').map(s => s.trim()) : []),
                extracurricular: Array.isArray(data.extracurricular) ? data.extracurricular : (data.extracurricular ? data.extracurricular.split('\n') : []),
             };


            // Set the state with the parsed data from the AI
            // setResumeData(formattedData); // Not strictly needed if editedData is the primary source for preview
            setEditedData(formattedData); // This now holds the AI-generated resume object
            setStage("preview");
            setSuccessMessage("✅ Resume generated successfully! Review and edit below.");

        } catch (err) {
            console.error("Resume generation failed:", err);
            setError(`Resume generation failed: ${err.message}. Please check your input or try again.`);
            setEditedData(null); // Clear potentially corrupt data
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
                // Send the *edited* data to the PDF generation lambda
                body: JSON.stringify(editedData),
            });

            if (!response.ok) {
                // Try to get error message from response if possible
                 let errorData;
                 try {
                    errorData = await response.json();
                 } catch(e) {
                    // Ignore if response wasn't JSON
                 }
                 throw new Error(errorData?.error || `PDF Generation failed with status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            // Sanitize name for filename
            const safeName = editedData.name ? editedData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'resume';
            a.download = `${safeName}_resume.pdf`;
            document.body.appendChild(a); // Append to body to ensure click works in all browsers
            a.click();
            window.URL.revokeObjectURL(url); // Clean up the object URL
            a.remove(); // Clean up the anchor element
            setSuccessMessage("✅ PDF downloaded successfully!");

        } catch (err) {
            console.error("PDF generation failed:", err);
            setError(`PDF download failed: ${err.message}.`);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render text areas for sections that might be simple strings or need joining
    const renderTextArea = (fieldName, rows = 3) => {
        let value = editedData[fieldName];
        // If the data is expected to be an array in the PDF (like skills, education), join it for the textarea
        if (Array.isArray(value)) {
            if (fieldName === 'skills' || fieldName === 'languages') {
                 value = value.join(", "); // Join skills/languages with comma
            } else {
                 value = value.join("\n"); // Join other list items with newline
            }
        }
        return (
            <textarea
                name={fieldName}
                value={value || ''} // Handle potential null/undefined
                onChange={handleEditedChange}
                rows={rows}
                className="edit-area"
                placeholder={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                disabled={loading} // Disable during loading
            />
        );
    };

     // Helper to render experience which is an array of objects
     const renderExperienceEditor = () => {
        // For simplicity in this example, we'll edit experience as a single text block.
        // A more advanced editor would map over editedData.experience and provide fields for each job.
        let experienceString = "";
        if (Array.isArray(editedData.experience)) {
             experienceString = editedData.experience.map(job =>
                 `Title: ${job.title || ''}\nCompany: ${job.company || ''}\nLocation: ${job.location || ''}\nPeriod: ${job.period || ''}\nResponsibilities:\n${(job.responsibilities || []).map(r => `- ${r}`).join("\n")}`
             ).join("\n\n---\n\n"); // Separator between jobs
        } else if (typeof editedData.experience === 'string') {
             experienceString = editedData.experience; // Handle case where it might already be a string
        }

        return (
            <textarea
                name="experience" // This needs special handling in handleEditedChange if you want to parse it back into objects
                value={experienceString}
                onChange={(e) => {
                     // Basic handling: update the string directly.
                     // A more complex solution would parse this back into the object structure on change or before saving/downloading.
                     setEditedData({ ...editedData, experience: e.target.value });
                }}
                rows={10} // More rows for experience
                className="edit-area"
                placeholder="Experience (Job Title, Company, Dates, Responsibilities)"
                disabled={loading}
            />
        );
    };


    return (
        <div className="App container">
            <h1>AI Resume Generator</h1>
            <p className="subheading">Generate an ATS-friendly resume tailored to a job description.</p>

             {/* Display Error Messages */}
             {error && <div className="error-toast">{error}</div>}

             {/* Display Success Messages */}
             {successMessage && !loading && <div className="success-toast">{successMessage}</div>} {/* Hide success during loading */}


            {stage === "form" && (
                <div className="form">
                    {Object.keys(formData).map((field) => (
                         <div key={field} className="form-field">
                           <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                            <textarea
                                id={field}
                                name={field}
                                placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                                value={formData[field]}
                                onChange={handleChange}
                                rows={field === "experience" || field === "jobDescription" ? 5 : 2} // More rows for larger fields
                                required={['name', 'email', 'experience', 'skills', 'jobDescription'].includes(field)} // Add basic required indication
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

            {stage === "preview" && editedData && (
                <div className="resume-card">
                    {/* --- Header --- */}
                    <div className="resume-header">
                         <label htmlFor="name">Full Name</label>
                        <input
                            type="text" id="name" name="name"
                            value={editedData.name || ''} onChange={handleEditedChange}
                            className="edit-field name-field" placeholder="Full Name" disabled={loading}
                        />
                         <label htmlFor="currentRole">Current Role / Target Role</label>
                        <input
                            type="text" id="currentRole" name="currentRole"
                            value={editedData.currentRole || ''} onChange={handleEditedChange}
                            className="edit-field role-field" placeholder="Current or Target Role" disabled={loading}
                         />
                         <div className="contact-info">
                            <label htmlFor="phone">Contact</label>
                            <div>
                                📞 <input type="tel" id="phone" name="phone" value={editedData.phone || ''} onChange={handleEditedChange} className="edit-inline" placeholder="Phone" disabled={loading} /> |
                                ✉️ <input type="email" id="email" name="email" value={editedData.email || ''} onChange={handleEditedChange} className="edit-inline" placeholder="Email" disabled={loading}/> |
                                🔗 <input type="url" id="linkedin" name="linkedin" value={editedData.linkedin || ''} onChange={handleEditedChange} className="edit-inline" placeholder="LinkedIn URL (Optional)" disabled={loading}/>
                            </div>
                         </div>
                    </div>

                    {/* --- Sections --- */}
                    <hr />
                    <section>
                        <h3>Professional Summary</h3>
                        {renderTextArea("summary", 4)}
                    </section>

                    <hr />
                    <section>
                        <h3>Skills</h3>
                         {renderTextArea("skills", 3)} {/* Render skills joined by comma */}
                    </section>

                    <hr />
                    <section>
                         <h3>Experience</h3>
                         {renderExperienceEditor()} {/* Render experience editor */}
                    </section>

                     <hr />
                    <section>
                        <h3>Education</h3>
                         {renderTextArea("education", 3)} {/* Render education joined by newline */}
                    </section>


                    {/* Optional Sections - Render based on presence */}
                    {editedData.certifications && editedData.certifications.length > 0 && (
                        <>
                            <hr />
                            <section>
                                <h3>Certifications</h3>
                                {renderTextArea("certifications", 3)}
                            </section>
                        </>
                    )}

                    {editedData.languages && editedData.languages.length > 0 && (
                         <>
                            <hr />
                            <section>
                                <h3>Languages</h3>
                                {renderTextArea("languages", 2)}
                            </section>
                        </>
                    )}

                    {editedData.extracurricular && editedData.extracurricular.length > 0 && (
                         <>
                             <hr />
                            <section>
                                <h3>Extra-Curricular Activities</h3>
                                {renderTextArea("extracurricular", 3)}
                            </section>
                         </>
                    )}


                    {/* --- Buttons --- */}
                    <div className="button-group preview-buttons">
                        <button onClick={() => setStage("form")} disabled={loading} className="back-btn">
                            &larr; Back to Edit Input
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
