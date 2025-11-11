import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiSend } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { REQUIREMENT_API } from '../reduxServices/api/InterviewApi';
import axios from 'axios';

const Requirements = () => {
  const dispatch = useDispatch();
  const [requirements, setRequirements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setIsDragging(false);
    setError('');
    
    // Check for rejected files and filter out any non-doc/docx files
    const validFiles = acceptedFiles.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.doc') || fileName.endsWith('.docx');
    });

    if (validFiles.length === 0 && acceptedFiles.length > 0) {
      setError('Please upload only .doc or .docx files');
      return;
    }

    const newRequirements = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type || 'application/msword',
      file
    }));

    setRequirements(prev => [...prev, ...newRequirements]);
    
    // Clear any previous error if files were successfully added
    if (newRequirements.length > 0) {
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // More lenient accept to handle different mime types across browsers
    accept: {
      'application/msword': ['.doc', '.DOC'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.DOCX'],
      'application/vnd.ms-word.document.macroEnabled.12': ['.docm', '.DOCM'],
      'application/octet-stream': ['.doc', '.DOC', '.docx', '.DOCX']
    },
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const removeRequirement = (id) => {
    setRequirements(prev => prev.filter(req => req.id !== id));
    setSubmitStatus({ success: null, message: '' });
  };

  const handleSubmit = async () => {
    if (requirements.length === 0) {
      setError('Please add at least one file to submit');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSubmitStatus({ success: null, message: 'Submitting requirements...' });

    try {
      const formData = new FormData();
      
      // Append each file with the same key 'file' to match server expectations
      requirements.forEach((req) => {
        formData.append('file', req.file);
      });

      // Make the API call directly instead of using Redux
      const response = await axios.post(REQUIREMENT_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        setSubmitStatus({ 
          success: true, 
          message: 'Requirements submitted successfully!',
          data: response.data
        });
        // Clear the form after successful submission
        setRequirements([]);
      } else {
        throw new Error('No data in the response');
      }
    } catch (error) {
      console.error('Error submitting requirements:', error);
      setSubmitStatus({ 
        success: false, 
        message: error.response?.data?.message || error.message || 'An error occurred while submitting requirements' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileInputClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onDrop(files, []);
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-2 bg-gray-50">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Upload Job Description</h1>
          <button
            onClick={() => navigate('/job-descriptions')}
            className="px-1.5 py-1.5 bg-purple-600 text-white rounded-lg bg-purple-400 transition-colors flex items-center"
          >
            <FiFile className="mr-2" />
            View Requirements
          </button>
        </div>
        
        {submitStatus.message && (
          <div className={`mb-4 p-3 rounded-md ${
            submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {submitStatus.message}
          </div>
        )}
        
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 md:p-4 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input 
              {...getInputProps()} 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <FiUpload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Drop the files here' : 'Drag & drop your requirements document here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or</p>
                <button 
                  type="button"
                  onClick={handleFileInputClick}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 mt-2">Supported formats: .doc, .docx</p>
              </div>
            </div>
          </div>
    
          <div className="space-y-4">
            <div className="mb-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || requirements.length === 0}
                className={`w-full py-3 mt-4 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm flex items-center justify-center ${
                  isSubmitting || requirements.length === 0
                    ? 'bg-purple-600 cursor-not-allowed'
                    : 'bg-purple-700 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-5" />
                      Submit Requirements
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FiFile className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{req.name}</p>
                      <p className="text-xs text-gray-500">{(req.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeRequirement(req.id)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                    aria-label="Remove file"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}
      </div>
  );
};

export default Requirements;
