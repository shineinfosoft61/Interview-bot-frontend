import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { saveQuestion } from '../reduxServices/actions/InterviewAction';
import { toast } from 'react-toastify';
import CustomDropdown from '../components/CustomDropdown';

const QuestionAddPopup = ({ isOpen, onClose, technologyOptions }) => {
  const dispatch = useDispatch();
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [newQuestions, setNewQuestions] = useState([{ text: '' }]);
  const [isSaving, setIsSaving] = useState(false);

  const addNewQuestionField = () => {
    setNewQuestions([...newQuestions, { text: '' }]);
  };

  const removeQuestionField = (index) => {
    if (newQuestions.length > 1) {
      const updatedQuestions = newQuestions.filter((_, i) => i !== index);
      setNewQuestions(updatedQuestions);
    }
  };

  const updateNewQuestion = (index, value) => {
    const updatedQuestions = [...newQuestions];
    updatedQuestions[index].text = value;
    setNewQuestions(updatedQuestions);
  };

  const saveAllQuestions = async () => {
    if (!selectedTechnology) {
      toast.error('Please select a technology');
      return;
    }

    const validQuestions = newQuestions.filter(q => q.text.trim() !== '');
    
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsSaving(true);
    try {
      for (const question of validQuestions) {
        const payload = {
          text: question.text.trim(),
          technology: selectedTechnology.value
        };
        
        const result = await dispatch(saveQuestion(payload));
        
        if (!result?.success) {
          throw new Error(result?.error || 'Failed to add question');
        }
      }

      toast.success(`${validQuestions.length} question(s) added successfully`);
      setNewQuestions([{ text: '' }])
      setSelectedTechnology(null)
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to add questions');
      console.error('Error adding questions:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Questions</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={isSaving}
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Technology Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Technology *
          </label>
          <CustomDropdown
            options={technologyOptions}
            value={selectedTechnology ? [selectedTechnology] : []}
            onChange={(selected) => setSelectedTechnology(selected[0] || null)}
            placeholder="Select technology..."
            className="w-full"
          />
        </div>

        {/* Questions List */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Questions *
            </label>
            <button
              onClick={addNewQuestionField}
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              disabled={isSaving}
            >
              <FiPlus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {newQuestions.map((question, index) => (
            <div key={index} className="mb-3 flex gap-2">
              <textarea
                value={question.text}
                onChange={(e) => updateNewQuestion(index, e.target.value)}
                placeholder="Enter question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isSaving}
              />
              {newQuestions.length > 1 && (
                <button
                  onClick={() => removeQuestionField(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Remove question"
                  disabled={isSaving}
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={saveAllQuestions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Questions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionAddPopup;
