import React, { useState } from "react";
import "./App.css"; // Assuming your CSS file is correctly linked

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
    jobDescription: ""
  });

  const [resumeText, setResumeText] = useState(""); // Original text from OpenAI
  const [editedText, setEditedText] = useState(""); // Text being edited by user
  const [stage, setStage] = useState("form"); // 'form' or 'preview'
  const [loading, setLoading] = useState(false); // Loading state for resume generation
  const [pdfLoading, setPdfLoading] = useState(false); // Loading state for PDF generation

  // API Endpoints (Replace with your actual API Gateway endpoints)
  const RESUME_VIEW_ENDPOINT = "https://2neudt4y81.execute-api.us-east-1.amazonaws.com/dev/resume-view";
  const RESUME_PDF_ENDPOINT = "https://lvpydfw4l6.execute-api.us-east-1.amazonaws.com/dev/resume-pdf";


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to call the first Lambda to generate the initial resume text
  const handleGenerateResume = async () => {
    setLoading(true);
    try {
       // Only send necessary data to the resume generation lambda
      const { jobDescription, ...resumeData } = formData;
      const payload = { ...resumeData, jobDescription }; // Include jobDescription for generation

      const response = await fetch(RESUME_VIEW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ensure all required fields are sent based on your Lambda's expectation
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Resume generation failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.resume) {
        setResumeText(data.resume); // Store original generated text if needed
        setEditedText(data.resume); // Set text for editor
        setStage("preview");      // Move to preview stage
      } else {
        throw new Error("Received empty resume content.");
      }

    } catch (err) {
      console.error("Resume generation failed", err);
      alert(`Failed to generate resume: ${err.message}`); // Show error to user
    } finally {
      setLoading(false);
    }
  };

  // Update state when user edits the text area
  const handleEditChange = (e) => {
    setEditedText(e.target.value);
  };

  // Function to call the second Lambda to generate the PDF
  const handleGeneratePDF = async () => {
    setPdfLoading(true); // Set loading state for the PDF button
    try {
      const response = await fetch(RESUME_PDF_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: editedText }) // Send the potentially edited text
      });

      if (!response.ok) {
        // Try to get error message from response body
        let errorMsg = `PDF generation failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
            // Ignore if response body is not JSON
        }
        throw new Error(errorMsg);
      }

      // Get the PDF data as a blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a link element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf"; // Set the desired filename

      // Append the link to the body, click it, and remove it
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url); // Clean up the temporary URL
      a.remove(); // Remove the link element

    } catch (err) {
      console.error("PDF generation failed", err);
      alert(`Failed to generate PDF: ${err.message}`); // Show error to user
    } finally {
      setPdfLoading(false); // Reset loading state for the PDF button
    }
  };


  return (
    <div className="App container"> {/* Ensure App.css provides .container styling */}
      <h1>AI Resume Generator</h1>
      <div className="subheading">Create and download an ATS-friendly resume</div>

      {/* Stage 1: Input Form */}
      {stage === "form" && (
        <div className="form">
          {[
            "name", "email", "phone", "linkedin", // Contact Info
            "education", "experience", "certifications", "skills", // Resume Content
            "jobDescription" // Context for generation
          ].map((field) => (
            <textarea
              key={field}
              name={field}
              // Make placeholder more descriptive
              placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              value={formData[field]}
              onChange={handleChange}
              // Adjust rows based on expected content length
              rows={field === "experience" || field === "jobDescription" || field === "skills" ? 5 : (field === "education" || field === "certifications" ? 3 : 2)}
              aria-label={field} // Accessibility improvement
            />
          ))}
          <button onClick={handleGenerateResume} disabled={loading}>
            {loading ? "Generating..." : "Generate Resume"}
          </button>
        </div>
      )}

      {/* Stage 2: Preview and Edit */}
      {stage === "preview" && (
        <div className="editor-container">
          <h2>Preview and Edit Resume</h2>
          <p style={{fontSize: '0.9em', color: '#555'}}>Edit the text below. The formatting (bold, italics) might not render here but will be applied in the PDF based on the structure.</p>
          <textarea
            className="editor" // Use CSS class for styling
            rows={30} // Adjust height as needed
            value={editedText}
            onChange={handleEditChange}
            aria-label="Edit Resume Text" // Accessibility improvement
          />
          <div className="btn-row"> {/* Use CSS for button layout */}
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
