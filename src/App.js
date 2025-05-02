import React, { useState } from 'react';
import './App.css';

function App() {
  const [projectName, setProjectName] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Direct API Gateway endpoint (no Amplify config needed)
  const API_ENDPOINT = 'https://bkp7t6rf5f.execute-api.us-east-1.amazonaws.com/dev/generate-doc';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add if using API keys:
          // 'x-api-key': 'YOUR_API_KEY' 
        },
        body: JSON.stringify({
          project_name: projectName,
          project_details: projectDetails
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to generate document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Architecture Document Generator</h1>
        <p>Automatically generate AWS/Azure/GCP architecture documents</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-group">
            <label htmlFor="projectName">Project Name*</label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              placeholder="e.g., Payment Service Migration"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectDetails">Requirements*</label>
            <textarea
              id="projectDetails"
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              required
              rows="8"
              placeholder={`Describe your architecture needs:\n- Expected traffic volume\n- Compliance requirements\n- Integration points\n- Data storage needs\n- Security constraints`}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`generate-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : 'Generate Document'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-container">
            <div className="result-header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                Document Generated!
              </h2>
              <p>Review your architecture document below</p>
            </div>
            
            <div className="preview-section">
              <div className="preview-actions">
                <a 
                  href={result.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-link"
                >
                  Open Preview in New Tab
                </a>
                <a 
                  href={result.documentUrl} 
                  download={`${projectName.replace(/\s+/g, '_')}_Architecture_Document.docx`}
                  className="download-button"
                >
                  Download Word Document
                </a>
              </div>
              
              <iframe
                src={result.previewUrl}
                title="Document Preview"
                className="preview-iframe"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>Powered by AWS Bedrock</p>
          <div className="tech-stack">
            <span>API Gateway</span>
            <span>Lambda</span>
            <span>S3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
