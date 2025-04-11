import axios from 'axios';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import './App.css';

const apiUrl = 'http://localhost:8000'; // Ensure this matches your FastAPI server URL

const App = () => {
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('get_matching_documents'); // Default action

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
      setResponse(res.data.message || 'Upload successful.');
    } catch (error) {
      setResponse('Error uploading document.');
    } finally {
      setLoading(false);
    }
  };

  // Handle document summary retrieval
  const getSummary = async () => {
    if (!docName || !docType) {
      alert('Please enter a document name and select a document type.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/summary`, {
        params: { doc_name: docName, doc_type: docType },
      });
      setResponse(res.data.doc_summary || 'No summary available.');
    } catch (error) {
      setResponse('Error retrieving document summary.');
    } finally {
      setLoading(false);
    }
  };

  // Handle document search
  const searchDocuments = async () => {
    if (!searchQuery) {
      alert('Please enter a search query.');
      return;
    }
  
    setLoading(true);
    try {
      const params = {
        query: searchQuery,
        action: action,
      };
  
      if (docName.trim() !== '') {
        params.filename = docName.trim();
      }
  
      const res = await axios.get(`${apiUrl}/search`, { params });
      if (action === "get_matching_documents") {
        setResponse("Documents are: \n "+res.data.document_names.join(", \n") || 'No results found.');
      } else {
        setResponse(res.data.reference || 'No results found.');
      }
    } catch (error) {
      setResponse('Error searching for documents.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="App">
      <div className="controls">
        <div className="control-group">
          <label>Upload Document</label>
          <input
            type="file"
            onChange={(e) => setDocFile(e.target.files[0])}
          />
        </div>

        <div className="control-group">
          <label>Select Document Type</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="government">Government</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>

        <div className="control-group">
          <button onClick={uploadDocument} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>

        <div className="control-group">
          <label>Get Document Summary</label>
          <input
            type="text"
            placeholder="Enter document name"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label>Select Document Type</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="government">Government</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>

        <div className="control-group">
          <button onClick={getSummary} disabled={loading}>
            {loading ? 'Retrieving Summary...' : 'Get Summary'}
          </button>
        </div>

        <div className="control-group">
          <label>Get Document Reference</label>
          <input
            type="text"
            placeholder="Enter search query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label>Enter Filename</label>
          <input
            type="text"
            placeholder="Enter filename"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label>Select Action</label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="get_matching_documents">Get Matching Documents</option>
            <option value="get_document_references">Get Document Reference</option>
            <option value="lookup_query">Lookup Query</option>
          </select>
        </div>

        <div className="control-group">
          <button onClick={searchDocuments} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {response && (
        <div id="response">
          <h3>Response:</h3>
          <ReactMarkdown remarkPlugins={[remarkBreaks]}>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default App;
