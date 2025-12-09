import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit2, FiFile, FiX, FiTrash2, FiPlus, FiLoader } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getQuestions, updateQuestion, deleteQuestion, getEnums } from '../reduxServices/actions/InterviewAction';
import DeleteConfirmPopup from '../Modal/DeleteConfirmPopup';
import CustomDropdown from '../components/CustomDropdown';
import { toast } from 'react-toastify';

const Questions = () => {
  const dispatch = useDispatch();
  const questions = useSelector((state) => state.InterviewReducer.questions || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: '', saving: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [technologyOptions, setTechnologyOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch questions
        const result = await dispatch(getQuestions());
        if (result?.success) {
          // Questions are already ordered by 'order' field from API
        } else {
          console.error('Failed to fetch questions:', result?.error);
        }

        // Fetch technology options
        const enumsResult = await dispatch(getEnums());
        if (enumsResult?.success && enumsResult.data?.technologies) {
          setTechnologyOptions(enumsResult.data.technologies);
        } else {
          console.error('Failed to fetch enums:', enumsResult?.error);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const startEdit = (question, field) => {
    if (!question || !field) return;
    let value = question[field] ?? '';
    
    // For technology field, convert to proper format
    if (field === 'technology') {
      if (Array.isArray(question.technology)) {
        value = question.technology.map(t => 
          typeof t === 'string' 
            ? technologyOptions.find(opt => opt.value === t) || { value: t, label: t }
            : t
        );
      } else if (question.technology) {
        value = [typeof question.technology === 'string' 
          ? technologyOptions.find(opt => opt.value === question.technology) || { value: question.technology, label: question.technology }
          : question.technology
        ];
      } else {
        value = [];
      }
    }
    
    setEditingCell({ id: question.id, field, value, saving: false });
  };

  const cancelEdit = () => {
    setEditingCell({ id: null, field: null, value: '', saving: false });
  };

  const saveEdit = async () => {
    if (!editingCell.id) return;
    
    setEditingCell(prev => ({ ...prev, saving: true }));
    
    try {
      let payload;
      if (editingCell.field === 'technology') {
        // For technology, send array of values
        payload = {
          technology: editingCell.value.map(t => t.value)
        };
      } else {
        // For other fields, send the value directly
        payload = {
          [editingCell.field]: editingCell.value
        };
      }
      
      const result = await dispatch(updateQuestion(editingCell.id, payload));
      
      if (result?.success) {
        toast.success('Question updated successfully');
        // Refresh questions
        await dispatch(getQuestions());
      } else {
        toast.error(result?.error || 'Failed to update question');
      }
    } catch (err) {
      toast.error('Failed to update question');
      console.error('Error updating question:', err);
    } finally {
      cancelEdit();
      setOpenDropdownId(null);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      const result = await dispatch(deleteQuestion(questionId));
      
      if (result?.success) {
        toast.success('Question deleted successfully');
        // Refresh questions
        await dispatch(getQuestions());
      } else {
        toast.error(result?.error || 'Failed to delete question');
      }
    } catch (err) {
      toast.error('Failed to delete question');
      console.error('Error deleting question:', err);
    }
  };

  const filteredQuestions = questions
    .filter(question => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const fields = [
        question.text,
        question.technology,
      ].map(v => (v || '').toString().toLowerCase());
      return fields.some(f => f.includes(q));
    });

  
  return (
    <div className="min-h-screen ml-60 p-4 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Questions</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by question, technology"
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '60%' }}>
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '25%' }}>
                    Technology
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 border-l border-gray-200" style={{ width: '15%' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question, index) => (
                    <tr key={question.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900" style={{ width: '60%' }}>
                        <div style={{ minWidth: '300px', maxWidth: '500px' }}>
                          {editingCell.id === question.id && editingCell.field === 'text' ? (
                            <textarea
                              value={editingCell.value}
                              onChange={(e) => setEditingCell(prev => ({ ...prev, value: e.target.value }))}
                              onBlur={saveEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  saveEdit();
                                }
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-full px-3 py-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              rows={3}
                              autoFocus
                              placeholder="Enter question..."
                              style={{ wordWrap: 'break-word' }}
                            />
                          ) : (
                            <div
                              onClick={() => startEdit(question, 'text')}
                              className="cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors min-h-[60px] flex items-start"
                              title={question.text}
                              style={{ wordWrap: 'break-word' }}
                            >
                              <span className="whitespace-pre-wrap" style={{ wordWrap: 'break-word' }}>
                                {question.text || 'Click to add question...'}
                              </span>
                              {editingCell.saving && editingCell.field === 'text' && (
                                <FiLoader className="w-4 h-4 text-blue-500 ml-2 animate-spin flex-shrink-0" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900" style={{ width: '25%' }}>
                        <div className="relative" style={{ minWidth: '200px' }}>
                          <CustomDropdown
                            options={technologyOptions}
                            value={
                              Array.isArray(question.technology) 
                                ? question.technology.map(t => 
                                    typeof t === 'string' 
                                      ? technologyOptions.find(opt => opt.value === t) || { value: t, label: t }
                                      : t
                                  )
                                : question.technology 
                                  ? [typeof question.technology === 'string' 
                                      ? technologyOptions.find(opt => opt.value === question.technology) || { value: question.technology, label: question.technology }
                                      : question.technology
                                    ]
                                  : []
                            }
                            onChange={async (selected) => {
                              // Update immediately
                              const payload = {
                                technology: selected.map(t => t.value)
                              };
                              
                              // Show saving state
                              setEditingCell({ id: question.id, field: 'technology', value: selected, saving: true });
                              
                              try {
                                const result = await dispatch(updateQuestion(question.id, payload));
                                if (result?.success) {
                                  toast.success('Technology updated successfully');
                                  await dispatch(getQuestions());
                                } else {
                                  toast.error(result?.error || 'Failed to update technology');
                                }
                              } catch (err) {
                                toast.error('Failed to update technology');
                                console.error('Error updating technology:', err);
                              } finally {
                                setEditingCell({ id: null, field: null, value: '', saving: false });
                              }
                            }}
                            multiSelect={true}
                            searchable={true}
                            placeholder="Select technologies..."
                            className="w-full"
                          />
                          {editingCell.saving && editingCell.id === question.id && (
                            <FiLoader className="absolute right-2 top-3 w-4 h-4 text-blue-500 animate-spin" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white z-10 border-l border-gray-200" style={{ width: '15%' }}>
                        <div className="flex items-center gap-2 justify-end" style={{ minWidth: '80px' }}>
                          <button
                            onClick={() => setDeletingQuestion(question)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                            title="Delete question"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Popup */}
      {deletingQuestion && (
        <DeleteConfirmPopup
          itemName={deletingQuestion.text || 'this question'}
          isOpen={!!deletingQuestion}
          onClose={() => setDeletingQuestion(null)}
          onConfirm={async () => {
            await handleDelete(deletingQuestion.id);
            setDeletingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

export default Questions;
