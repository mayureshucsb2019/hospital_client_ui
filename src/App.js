import axios from 'axios';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // Import react-markdown for rendering Markdown
import './App.css'; // Import the CSS file for styling

const apiUrl = process.env.REACT_APP_API_URL;; // Change this if your FastAPI server is running elsewhere

const App = () => {
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filename, setFilename] = useState('');
  const [action, setAction] = useState('get_matching_documents');
  const [docFile, setDocFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle document summary request
  const getSummary = async () => {
    if (!docName || !docType) {
      alert('Please select a document and specify its type.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/summary`, {
        params: { doc_name: docName, doc_type: docType },
      });
      console.log("Looking for summary")
      setResponse(res.data.doc_summary);
    } catch (error) {
      setResponse(error.response.data.detail);
    } finally {
      setLoading(false);
    }
  };

  // Handle document search request
  const searchDocuments = async () => {
    if (!searchQuery) {
      alert('Please enter the query.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/search`, {
        params: { query: searchQuery, action, filename },
      });
      console.log()
      if (action === "get_document_references") {
        setResponse(res.data.reference);
      }else if (action === "get_matching_documents"){
        setResponse(res.data.document_names.join("\n"));
      }else if (action === "lookup_query"){
        setResponse(res.data.reference);
      }
      
    } catch (error) {
      console.log(error);
      setResponse({ error: 'Error searching for documents.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle document upload
  const uploadDocument = async () => {
    if (!docFile || !docType) {
      alert('Please select a document and specify its type.');
      return;
    }

    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('doc_type', docType);

    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/upload-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(res.data.message);
    } catch (error) {
      setResponse({ error: 'Error uploading document.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Document Query Interface</h1>
      <div className="main-content">
        <div className="left-column">
          <div className="section">
            <h2>Upload Document</h2>
            <input
              type="file"
              onChange={(e) => setDocFile(e.target.files[0])}
            />
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="">Select Document Type</option>
              <option value="government">Government</option>
              <option value="hospital">Hospital</option>
            </select>
            <button onClick={uploadDocument} disabled={loading}>
              Upload Document
            </button>
          </div>

          <div className="section">
            <h2>Get Document Summary</h2>
            <input
              type="text"
              placeholder="Enter document name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="">Select Document Type</option>
              <option value="government">Government</option>
              <option value="hospital">Hospital</option>
            </select>
            <button onClick={getSummary} disabled={loading}>
              Get Summary
            </button>
          </div>

          <div className="section">
            <h2>Get Document Reference</h2>
            <input
              type="text"
              placeholder="Enter search query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="get_matching_documents">Get Matching Documents</option>
              <option value="get_document_references">Get Document References</option>
              <option value="lookup_query">Lookup Query</option>
            </select>
            <button onClick={searchDocuments} disabled={loading}>
              Search
            </button>
          </div>
        </div>

        <div className="right-column">
          {loading && <p>Loading...</p>}
          {response && (
            <div id="response">
              <h3>Response:</h3>
              <ReactMarkdown>{response.message || response}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
