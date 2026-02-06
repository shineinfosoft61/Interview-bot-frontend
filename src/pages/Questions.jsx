import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiEdit2, FiFile, FiX, FiTrash2, FiPlus, FiLoader } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getQuestions, updateQuestion, deleteQuestionBank, getEnums, updateQuestionBank, getQuestionBankList } from '../reduxServices/actions/InterviewAction';
import QuestionAddPopup from '../Modal/QuestionAddPopup';
import CustomDropdown from '../components/CustomDropdown';
import { toast } from 'react-toastify';

const Questions = () => {
  const dispatch = useDispatch();
  const questions = useSelector((state) => state.InterviewReducer.questionBank || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: '', saving: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [technologyOptions, setTechnologyOptions] = useState([]);
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch technology options
        const enumsResult = await dispatch(getEnums());
        if (enumsResult?.success && enumsResult.data?.technologies) {
          setTechnologyOptions(enumsResult.data.technologies);
        } else {
          console.error('Failed to fetch enums:', enumsResult?.error);
        }
        
        // Fetch questions with initial filters
        await fetchQuestionsWithFilters();
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Refetch questions when search or technology filters change
  useEffect(() => {
    if (!isLoading) {
      fetchQuestionsWithFilters();
    }
  }, [searchQuery, selectedTechnologies]);

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
        // For technology, send comma-separated string
        payload = {
          technology: editingCell.value.map(t => t.value).join(',')
        };
      } else {
        // For other fields, send the value directly
        payload = {
          [editingCell.field]: editingCell.value
        };
      }
      
      const result = await dispatch(updateQuestionBank(editingCell.id, payload));
      
      if (result?.success) {
        toast.success('Question updated successfully');
        // Refresh questions
        await dispatch(getQuestionBankList());
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

  const fetchQuestionsWithFilters = async () => {
    try {
      setIsLoading(true);
      const techValues = selectedTechnologies.map(t => t.value);
      const result = await dispatch(getQuestionBankList(null, searchQuery, techValues));
      
      if (result?.success) {
        // Questions are already ordered by 'order' field from API
      } else {
        setError(result?.error || 'Failed to fetch questions');
        toast.error(result?.error || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions. Please try again.');
      toast.error('Failed to fetch questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      const result = await dispatch(deleteQuestionBank(questionId));
      
      if (result?.success) {
        toast.success('Question deleted successfully');
        // Refresh questions with current filters
        await fetchQuestionsWithFilters();
      } else {
        toast.error(result?.error || 'Failed to delete question');
      }
    } catch (err) {
      toast.error('Failed to delete question');
      console.error('Error deleting question:', err);
    }
  };

  const filteredQuestions = questions; // Backend filtering now handles this

  
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
              placeholder="Search by question"
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            
            <CustomDropdown
              options={technologyOptions}
              value={selectedTechnologies}
              onChange={setSelectedTechnologies}
              multiSelect={true}
              searchable={true}
              placeholder={
                selectedTechnologies.length === 0 
                  ? "Filter by tech..." 
                  : selectedTechnologies.length === 1
                    ? selectedTechnologies[0].label
                    : `${selectedTechnologies[0].label}, ${selectedTechnologies[1].label}, +${selectedTechnologies.length - 2} more`
              }
              className="w-48"
            />
            
            <button
              onClick={() => setShowQuestionPopup(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Question
            </button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '5%' }}>
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '55%' }}>
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
                      <td className="px-4 py-4 text-sm text-gray-600 font-medium" style={{ width: '5%' }}>
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900" style={{ width: '55%' }}>
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
                              // Handle different data formats for technology field
                              (() => {
                                if (!question.technology) return [];
                                
                                // If it's already an array, take the first value
                                if (Array.isArray(question.technology)) {
                                  const firstTech = question.technology[0];
                                  if (!firstTech) return [];
                                  
                                  if (typeof firstTech === 'string') {
                                    const foundOption = technologyOptions.find(opt => opt.value === firstTech);
                                    return foundOption ? [foundOption] : [{ value: firstTech, label: firstTech }];
                                  }
                                  return [firstTech];
                                }
                                
                                // Handle string technology (could be single or comma-separated)
                                if (typeof question.technology === 'string') {
                                  // Check if it contains commas (multiple technologies)
                                  if (question.technology.includes(',')) {
                                    const techArray = question.technology.split(',').map(t => t.trim()).filter(Boolean);
                                    const firstTech = techArray[0];
                                    if (!firstTech) return [];
                                    
                                    const foundOption = technologyOptions.find(opt => opt.value === firstTech);
                                    return foundOption ? [foundOption] : [{ value: firstTech, label: firstTech }];
                                  } else {
                                    // Single technology string
                                    const foundOption = technologyOptions.find(opt => opt.value === question.technology);
                                    return foundOption ? [foundOption] : [{ value: question.technology, label: question.technology }];
                                  }
                                }
                                
                                // Fallback
                                return [];
                              })()
                            }
                            onChange={async (selected) => {
                              // Update immediately with single technology
                              const selectedTech = selected && selected.length > 0 ? selected[0] : null;
                              const payload = {
                                technology: selectedTech ? selectedTech.value : ''
                              };
                              
                              // Show saving state
                              setEditingCell({ id: question.id, field: 'technology', value: selected, saving: true });
                              
                              try {
                                const result = await dispatch(updateQuestionBank(question.id, payload));
                                if (result?.success) {
                                  toast.success('Technology updated successfully');
                                  await dispatch(getQuestionBankList());
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
                            multiSelect={false}
                            searchable={true}
                            placeholder="Select technology..."
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
                            onClick={() => handleDelete(question.id)}
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
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Question Add Popup */}
      <QuestionAddPopup
        isOpen={showQuestionPopup}
        onClose={() => {
          setShowQuestionPopup(false);
          // Refresh questions after closing popup
          fetchQuestionsWithFilters();
        }}
        technologyOptions={technologyOptions}
      />
    </div>
  );
};

export default Questions;
