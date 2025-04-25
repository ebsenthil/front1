import React, { useState } from "react";
import "./App.css"; // Import the updated CSS

function App() {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    education: "",
    experience: "",
    certifications: "",
    skills: "",
    jobDescription: ""
  });

  // State for resume text (original and edited)
  const [resumeText, setResumeText] = useState(""); // Original text from OpenAI (optional to keep)
  const [editedText, setEditedText] = useState(""); // Text being edited by user in the textarea

  // State for application flow and loading indicators
  const [stage, setStage] = useState("form"); // 'form' or 'preview'
  const [loading, setLoading] = useState(false); // Loading state for initial resume generation
  const [pdfLoading, setPdfLoading] = useState(false); // Loading state for PDF generation

  // API Endpoints (Replace with your actual API Gateway endpoints)
  const RESUME_VIEW_ENDPOINT = "https://2neudt4y81.execute-api.us-east-1.amazonaws.com/dev/resume-view";
  const RESUME_PDF_ENDPOINT = "https://lvpydfw4l6.execute-api.us-east-1.amazonaws.com/dev/resume-pdf";

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Call the first Lambda to generate the initial resume text
  const handleGenerateResume = async () => {
    setLoading(true);
    try {
      // Send all form data to the generation endpoint
      const response = await fetch(RESUME_VIEW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData) // Send the whole form data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
        throw new Error(errorData.error || `Resume generation failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.resume) {
        setResumeText(data.resume); // Store original generated text
        setEditedText(data.resume); // Set text for the editor textarea
        setStage("preview");      // Move to the preview/edit stage
      } else {
        throw new Error("Received empty resume content from the server.");
      }

    } catch (err) {
      console.error("Resume generation failed:", err);
      alert(`Failed to generate resume: ${err.message}`); // Inform the user
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // Update state when user edits the resume text in the preview textarea
  const handleEditChange = (e) => {
    setEditedText(e.target.value);
  };

  // Call the second Lambda to generate the PDF from the edited text
  const handleGeneratePDF = async () => {
    setPdfLoading(true); // Start PDF loading indicator
    try {
      const response = await fetch(RESUME_PDF_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: editedText }) // Send the current text from the editor
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `PDF generation failed with status ${response.status}`);
      }

      // Get the PDF data as a blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element to trigger the download
      const a = document.createElement("a");
      a.style.display = 'none'; // Hide the link
      a.href = url;
      a.download = "resume.pdf"; // Set the desired filename for the download

      // Append the link to the body, simulate a click, and then remove it
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url); // Clean up the temporary URL to free memory
      a.remove(); // Remove the temporary link element

    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(`Failed to generate PDF: ${err.message}`); // Inform the user
    } finally {
      setPdfLoading(false); // Stop PDF loading indicator
    }
  };

  // Helper function to format field names into readable placeholders
  const formatPlaceholder = (fieldName) => {
    // Add space before capital letters (except the first one) and capitalize the first letter
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };


  return (
    // Main container div, styled by App.css
    <div className="App container">
      <h1>AI Resume Generator</h1>
      <div className="subheading">Generate an ATS-friendly resume tailored to the job description.</div>

      {/* Conditional Rendering: Show Form or Preview */}

      {/* Stage 1: Input Form */}
      {stage === "form" && (
        <div className="form">
          {/* Map through form fields to create textarea inputs */}
          {[
            "name", "email", "phone", "linkedin", // Contact Info
            "education", "experience", "certifications", "skills", // Core Resume Sections
            "jobDescription" // Context for AI generation
          ].map((field) => (
            <div key={field}> {/* Wrap input in a div if using labels */}
              {/* Optional: Add labels for better accessibility */}
              {/* <label htmlFor={field}>{formatPlaceholder(field)}</label> */}
              <textarea
                id={field} // Link label to input if using labels
                name={field}
                placeholder={formatPlaceholder(field)} // Use formatted placeholder
                value={formData[field]}
                onChange={handleChange}
                // Rows attribute is less critical with CSS min-height, but can provide hints
                rows={field === "experience" || field === "jobDescription" || field === "skills" ? 5 : (field === "education" || field === "certifications" ? 3 : 2)}
                aria-label={formatPlaceholder(field)} // Accessibility: Describe the input
              />
            </div>
          ))}
          {/* Button to trigger resume generation */}
          <button onClick={handleGenerateResume} disabled={loading}>
            {loading ? "Generating..." : "Generate Resume Preview"}
          </button>
        </div>
      )}

      {/* Stage 2: Preview and Edit */}
      {stage === "preview" && (
        <div className="editor-container">
          <h2>Preview and Edit Resume</h2>
          {/* Optional: Add instructions for the user */}
          {/* <p style={{fontSize: '0.9em', color: '#555', textAlign: 'center'}}>Review the generated text below. Make any necessary edits before downloading the PDF.</p> */}
          <textarea
            className="editor" // Apply specific styles for the editor textarea
            value={editedText}
            onChange={handleEditChange}
            aria-label="Edit Resume Text" // Accessibility
          />
          {/* Row for Back and Download PDF buttons */}
          <div className="btn-row">
            <button onClick={() => setStage("form")} disabled={pdfLoading}>
              Back to Form
            </button>
            <button className="download-btn" onClick={handleGeneratePDF} disabled={pdfLoading}>
              {pdfLoading ? "Creating PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
