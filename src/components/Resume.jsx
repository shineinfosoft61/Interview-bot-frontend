import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Upload, X, FileText, User, Mail, Phone, Briefcase, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { saveHRDocument } from '../reduxServices/actions/InterviewAction';
import { useNavigate } from 'react-router-dom';

const Resume = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hrDocument } = useSelector(state => state.InterviewReducer);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  // Add files to the list
  const addFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return validTypes.includes(file.type);
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file from list
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    }
  };



  // Handle form submission
  const handleScheduleInterview = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    
    selectedFiles.forEach((file, index) => {
      formData.append('upload_doc', file);
    });

    setIsUploading(true);

    try {
      const result = await dispatch(saveHRDocument(formData));
      console.log('-------------',result)
      
      if (result.success) {
        setSelectedFiles([]);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate('/scheduled-interviews');
        }, 2000);
      } else {
        setErrorMessage(result.error || 'Failed to upload documents. Please try again.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('Error uploading documents: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen ml-14 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto mt-50">

        {/* Status Messages */}
        <div className="space-y-4">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Interview Scheduled Successfully!</p>
                <p className="text-sm text-green-600">The candidate will be notified via email.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule Interview Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Upload Resume</h2>
              </div>
              <button
                onClick={() => navigate('/candidates')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                aria-label="Show candidates"
              >
                <User className="w-4 h-4" />
                Show Candidates
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              
              {/* Resume Upload Section */}
              <div className="border-t pt-4">
                
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop resume files here, or
                  </p>
                  <label className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition duration-200">
                    Browse Files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, DOC, DOCX (Multiple files allowed)
                  </p>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Files ({selectedFiles.length})
                    </p>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                  isUploading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Schedule Interview
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
