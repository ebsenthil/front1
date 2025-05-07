import React, { useState } from 'react';
import './App.css';

function App() {
  const [projectName, setProjectName] = useState('');
  const [projectRequirements, setProjectRequirements] = useState('');
  const [nonFunctionalRequirements, setNonFunctionalRequirements] = useState('');
  const [securityComplianceRequirements, setSecurityComplianceRequirements] = useState('');
  const [constraints, setConstraints] = useState('');
  const [architecturalDecisionAreas, setArchitecturalDecisionAreas] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(''); // To show success/failure message

  // Direct API Gateway endpoint
  const API_ENDPOINT = 'https://bkp7t6rf5f.execute-api.us-east-1.amazonaws.com/dev/generate-doc';
  const S3_BUCKET_NAME = 'senai-test-bucket'; // Your S3 bucket name

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSubmissionStatus('');

    // Combine all detail fields into a single string for the backend
    // You might want to format this string more clearly, e.g., with markdown-like headers
    const combinedProjectDetails = `
## Project Requirements
${projectRequirements}

## Non-Functional Requirements
${nonFunctionalRequirements}

## Security and Compliance Requirements
${securityComplianceRequirements}

## Constraints
${constraints}

## Areas Where Architectural Decisions Required
${architecturalDecisionAreas}
    `;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectName,
          project_details: combinedProjectDetails.trim(), // Send combined details
        }),
      });

      // Check if the request was accepted (e.g., 200 OK or 202 Accepted)
      // Lambda might return 200 if it successfully started the process,
      // or 202 if API Gateway is set up for async invocation.
      if (!response.ok) {
        // Try to get error message from response body if available
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
            // console.warn("Could not parse error response JSON:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Assuming the API Gateway & Lambda handle the request asynchronously
      // and return a success response immediately.
      setSubmissionStatus(`Request submitted successfully! Check the generated document in the "${S3_BUCKET_NAME}" S3 bucket shortly.`);
      // Clear form fields after successful submission
      setProjectName('');
      setProjectRequirements('');
      setNonFunctionalRequirements('');
      setSecurityComplianceRequirements('');
      setConstraints('');
      setArchitecturalDecisionAreas('');

    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to submit document generation request.');
      setSubmissionStatus(''); // Clear any previous success message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Architecture Document Generator</h1>
        <p>Streamline Your AWS/Azure/GCP Architecture Documentation</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-section">
            <h2 className="form-section-title">Project Overview</h2>
            <div className="form-group">
              <label htmlFor="projectName">Project Name*</label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="e.g., E-commerce Platform Modernization"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectRequirements">Project Requirements*</label>
              <textarea
                id="projectRequirements"
                value={projectRequirements}
                onChange={(e) => setProjectRequirements(e.target.value)}
                required
                rows="6"
                placeholder="Detail the core functionalities, user stories, business goals, and scope of the project."
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Technical Specifications</h2>
            <div className="form-group">
              <label htmlFor="nonFunctionalRequirements">Non-Functional Requirements</label>
              <textarea
                id="nonFunctionalRequirements"
                value={nonFunctionalRequirements}
                onChange={(e) => setNonFunctionalRequirements(e.target.value)}
                rows="5"
                placeholder="e.g., Performance targets (response times, TPS), scalability needs (users, data volume), availability (uptime, RTO/RPO), reliability, maintainability."
              />
            </div>

            <div className="form-group">
              <label htmlFor="securityComplianceRequirements">Security and Compliance Requirements</label>
              <textarea
                id="securityComplianceRequirements"
                value={securityComplianceRequirements}
                onChange={(e) => setSecurityComplianceRequirements(e.target.value)}
                rows="5"
                placeholder="e.g., Data encryption (at rest, in transit), access control mechanisms, authentication/authorization, relevant industry standards (GDPR, HIPAA, PCI-DSS), audit logging."
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Project Constraints & Decisions</h2>
            <div className="form-group">
              <label htmlFor="constraints">Constraints</label>
              <textarea
                id="constraints"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                rows="5"
                placeholder="e.g., Budget limitations, timeline, preferred technology stack, legacy system integrations, data residency requirements, team skill set, specific location criteria."
              />
            </div>

            <div className="form-group">
              <label htmlFor="architecturalDecisionAreas">Areas Requiring Architectural Decisions</label>
              <textarea
                id="architecturalDecisionAreas"
                value={architecturalDecisionAreas}
                onChange={(e) => setArchitecturalDecisionAreas(e.target.value)}
                rows="5"
                placeholder="e.g., Choice of microservices vs. monolith, database selection (SQL vs. NoSQL), messaging queue strategy, API design approach, cloud provider specific services."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className={`submit-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : 'Submit Generation Request'}
            </button>
          </div>
        </form>

        {submissionStatus && !error && (
          <div className="submission-status-message success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <p>{submissionStatus}</p>
          </div>
        )}

        {error && (
          <div className="submission-status-message error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Powered by Generative AI & Cloud Technology</p>
          <div className="tech-stack">
            <span>React</span>
            <span>API Gateway</span>
            <span>Lambda</span>
            <span>S3</span>
            <span>OpenAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
