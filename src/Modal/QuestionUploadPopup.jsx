import React, { useState } from 'react';
import { FiX, FiUpload, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { saveQuestion } from '../reduxServices/actions/InterviewAction';


const QuestionUploadPopup = ({ editHrDoc, isOpen, onClose, onUpload}) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [questions, setQuestions] = useState([{ id: Date.now(), text: '' }]);
  const [activeTab, setActiveTab] = useState('manual');
  console.log("editHrDoc", editHrDoc);

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    if (!selected) {
      setFile(null);
      setFileError('');
      return;
    }

    const allowedExt = ['txt', 'pdf'];
    const nameParts = selected.name.split('.');
    const ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : '';

    if (!allowedExt.includes(ext)) {
      setFile(null);
      setFileError('Only .txt or .pdf files are allowed.');
      // Optional: clear the input value to allow re-selecting same file
      try { e.target.value = ''; } catch {}
      return;
    }

    setFile(selected);
    setFileError('');
  };

  const handleUpload = () => {
    if (file && !fileError) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hr', editHrDoc?.id);
  
      // Dispatch or make API call with formData directly
      dispatch(saveQuestion(formData));  // not wrapped in JSON
      onClose();
      setFile(null);
      onUpload(file);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: Date.now() + Math.random(), text: '' }]);
  };

  const handleQuestionChange = (id, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text: value } : q
    ));
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const validQuestions = questions.filter(q => q.text.trim() !== '');
    if (validQuestions.length > 0) {
      validQuestions.forEach(question => {
        const payload = {
          text: question.text,
          candidate: editHrDoc?.id
        };
        dispatch(saveQuestion(payload));
        onClose();
        setQuestions([]);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b px-6 py-6">
          <h3 className="text-lg font-medium">Add Questions</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {/* File Upload Option */}


            {/* Tabs */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex border-b">
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'manual' ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('manual')}
                >
                  Add Manually
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'file' ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('file')}
                >
                  Upload File
                </button>
              </div>

              {/* Manual Add Form */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="p-4">
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="flex items-start space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question {index + 1}
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={question.text}
                              onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                              placeholder="Enter your question here"
                              required={index === 0}
                            />
                            {questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(question.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPlus className="-ml-0.5 mr-2 h-4 w-4" />
                      Add Another Question
                    </button>
                    <button
                      type="submit"
                      disabled={!questions.some(q => q.text.trim() !== '')}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${questions.some(q => q.text.trim() !== '') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      Save Questions
                    </button>
                  </div>
                </form>
              )}

              {/* File Upload Option */}
              {activeTab === 'file' && (
                <div className="p-6">
                  <div className="text-center">
                
                    
                    <div className="mt-6">
                      <label className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors duration-200">
                          <div className="space-y-1 text-center">
                            <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="flex justify-center text-sm text-gray-600">
                              <span className="relative font-medium text-blue-600 hover:text-blue-500">
                                <span>Upload a file</span>
                                <input 
                                  type="file" 
                                  className="sr-only" 
                                  onChange={handleFileChange}
                                  accept=".txt,.pdf"
                                />
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              TXT, PDF up to 10MB
                            </p>
                            {fileError && (
                              <p className="mt-2 text-sm text-red-600">{fileError}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    {file && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-green-800">
                              {file.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="h-1 w-full bg-green-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <button
                        onClick={handleUpload}
                        disabled={!file || !!fileError}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          file && !fileError
                            ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Process File
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionUploadPopup;
