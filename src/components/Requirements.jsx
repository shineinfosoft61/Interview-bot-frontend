import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiSend, FiAlertCircle } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { REQUIREMENT_API } from '../reduxServices/api/InterviewApi';
import axios from 'axios';
import { getRequirement } from '../reduxServices/actions/InterviewAction';


const Requirements = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      return fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.pdf');
    });

    if (validFiles.length === 0 && acceptedFiles.length > 0) {
      setError('Please upload only .doc or .docx or .pdf files');
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx', '.DOCX','.pdf'],
      'application/vnd.ms-word.document.macroEnabled.12': ['.docm', '.DOCM'],
      'application/octet-stream': ['.doc', '.DOC', '.docx', '.DOCX','.pdf']
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        dispatch(getRequirement());
        onClose();
        navigate('/job-descriptions');
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


  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-md border border-red-200 bg-white-50 p-3 text-red-700 text-sm">
          <FiAlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}
      
      {submitStatus.message && (
        <div className={`mb-4 p-3 rounded-md ${
          submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-green-800'
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
            <p className="text-xs text-gray-500 mt-2">Supported formats: .doc, .docx,.pdf</p>
          </div>
        </div>
      </div>
  
      <div className="space-y-4">
        <div className="mb-4">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className={`flex-1 flex items-center justify-center px-6 mt-2 py-2 rounded-lg text-white font-medium ${isSubmitting || requirements.length === 0 ? 'bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700'} transition-colors`}
              disabled={isSubmitting || requirements.length === 0}
            >
              {isSubmitting ? (
                'Uploading...'
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Upload Requirements
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
    </div>
  );
};

export default Requirements;
