import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiEdit2, FiSave, FiXCircle, FiUpload } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { saveQuestion, getQuestions, updateQuestion, deleteQuestion } from '../reduxServices/actions/InterviewAction';
import { toast } from 'react-toastify';
import axios from 'axios';
import { INTERVIEW_API } from '../reduxServices/api/InterviewApi';

const QuestionManagementPopup = ({ editHrDoc, isOpen, onClose, isCompleted = false }) => {
  const dispatch = useDispatch();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Fetch existing questions when popup opens
  useEffect(() => {
    if (isOpen && editHrDoc?.id) {
      fetchQuestions();
    }
  }, [isOpen, editHrDoc]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const result = await dispatch(getQuestions(editHrDoc.id));
      if (result?.success && Array.isArray(result.data)) {
        // Ensure each question has order, index and local id
        const indexed = result.data.map((q, i) => ({
          ...q,
          order: q.order || i,
          index: q.order || i,
          localId: q.id || `local-${Date.now()}-${i}`
        }));
        setQuestions(indexed);
      } else {
        setQuestions([]);
      }
    } catch (e) {
      console.error('Failed to fetch questions:', e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const reindexQuestions = (list) => {
    return list.map((q, i) => ({ ...q, order: i, index: i }));
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: null, // not saved yet
      localId: `new-${Date.now()}`,
      text: '',
      order: questions.length,
      index: questions.length,
      candidate: editHrDoc?.id
    };
    setQuestions([...questions, newQuestion]);
    setEditingId(newQuestion.localId);
    setEditingText('');
  };

  const handleEditQuestion = (localId, text) => {
    setEditingId(localId);
    setEditingText(text);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const question = questions.find(q => q.localId === editingId);
    if (!question) return;

    const updated = questions.map(q =>
      q.localId === editingId ? { ...q, text: editingText.trim() } : q
    );
    setQuestions(updated);

    // If it's a new question (no id), save it to backend
    if (!question.id && editingText.trim()) {
      try {
        const payload = {
          text: editingText.trim(),
          candidate: editHrDoc?.id,
          order: question.order || question.index,
          is_default: false
        };
        const result = await dispatch(saveQuestion(payload));
        if (result?.success) {
          toast.success('Question added');
          // Refresh questions to get real ids
          await fetchQuestions();
        } else {
          toast.error('Failed to add question');
        }
      } catch (e) {
        toast.error('Failed to add question');
      }
    } else if (question.id && editingText.trim()) {
      // Update existing question via API
      try {
        const payload = {
          text: editingText.trim(),
          candidate: editHrDoc?.id,
          order: question.order || question.index
        };
        const result = await dispatch(updateQuestion(question.id, payload));
        if (result?.success) {
          toast.success('Question updated successfully');
          // Refresh questions to get updated data
          await fetchQuestions();
        } else {
          toast.error('Failed to update question');
        }
      } catch (e) {
        toast.error('Failed to update question');
      }
    }

    setEditingId(null);
    setEditingText('');
  };

  const handleDeleteQuestion = async (localId) => {
    const question = questions.find(q => q.localId === localId);
    if (!question) return;

    // If it's a saved question, call delete API
    if (question.id) {
      try {
        const result = await dispatch(deleteQuestion(question.id));
        if (result?.success) {
          toast.success('Question deleted successfully');
          // Refresh questions to get updated order
          await fetchQuestions();
        } else {
          toast.error('Failed to delete question');
          return;
        }
      } catch (e) {
        toast.error('Failed to delete question');
        return;
      }
    } else {
      // For new unsaved questions, just remove from local state
      const updated = questions.filter(q => q.localId !== localId);
      const reindexed = reindexQuestions(updated);
      setQuestions(reindexed);
      toast.success('Question deleted');
    }
  };

  const handleCancelEdit = () => {
    const question = questions.find(q => q.localId === editingId);
    if (question && !question.id && !question.text.trim()) {
      // Remove unsaved empty question
      setQuestions(questions.filter(q => q.localId !== editingId));
    }
    setEditingId(null);
    setEditingText('');
  };

  // Handle question reordering (for drag and drop)
  const handleReorderQuestion = async (questionId, newOrder) => {
    try {
      const result = await dispatch(updateQuestion(questionId, { order: newOrder }));
      if (result?.success) {
        toast.success('Question reordered successfully');
        // Refresh questions to get updated order
        await fetchQuestions();
      } else {
        toast.error('Failed to reorder question');
      }
    } catch (e) {
      toast.error('Failed to reorder question');
    }
  };

  // File upload handlers
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
      try { e.target.value = ''; } catch {}
      return;
    }

    setFile(selected);
    setFileError('');
  };

  const handleUpload = async () => {
    if (!file || fileError) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidate', editHrDoc?.id);

      const response = await axios.post(INTERVIEW_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        toast.success('Questions uploaded successfully');
        setFile(null);
        setFileError('');
        onClose(); // Close popup immediately after upload
      } else {
        toast.error('Failed to upload questions');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload questions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-6">
          <h3 className="text-lg font-medium">
            {isCompleted ? 'View Questions' : 'Manage Questions'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        {!isCompleted && (
          <div className="border-b">
            <div className="flex">
              <button
                className={`flex-1 py-3 px-4 text-sm font-medium cursor-pointer transition-colors ${
                  activeTab === 'manual' ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('manual')}
              >
                Add Manually
              </button>
              <button
                className={`flex-1 py-3 px-4 text-sm font-medium cursor-pointer transition-colors ${
                  activeTab === 'file' ? 'bg-gray-100 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('file')}
              >
                Upload File
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading questions...</p>
              </div>
            ) : activeTab === 'manual' || isCompleted ? (
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No questions yet.</p>
                ) : (
                  questions.map((q) => (
                    <div key={q.localId} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-400 w-8">{q.index + 1}.</span>
                      {editingId === q.localId && !isCompleted ? (
                        <>
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-2 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                            title="Save"
                          >
                            <FiSave className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                            title="Cancel"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">
                            {q.text || <em className="text-gray-400">Empty question</em>}
                          </span>
                          {!isCompleted && (
                            <>
                              <button
                                onClick={() => handleEditQuestion(q.localId, q.text)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.localId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // File upload tab
              <div className="space-y-4">
                <div className="text-center">
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors duration-200">
                      <div className="space-y-2 text-center">
                        <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex justify-center text-sm text-gray-600">
                          <span className="relative font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                            <span>Click to upload or drag and drop</span>
                            <input 
                              type="file" 
                              className="sr-only" 
                              onChange={handleFileChange}
                              accept=".txt,.pdf"
                            />
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">TXT, PDF up to 10MB</p>
                        {fileError && (
                          <p className="mt-2 text-sm text-red-600">{fileError}</p>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
                
                {file && (
                  <div className="p-4 bg-green-50 rounded-md border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-green-800">{file.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-gray-400 hover:text-gray-500 cursor-pointer"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={!file || !!fileError || loading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white cursor-pointer ${
                      file && !fileError && !loading
                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Uploading...' : 'Upload Questions'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex justify-between">
            {!isCompleted && activeTab === 'manual' && (
              <button
                onClick={handleAddQuestion}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <FiPlus className="-ml-0.5 mr-2 h-4 w-4" />
                Add Question
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManagementPopup;
