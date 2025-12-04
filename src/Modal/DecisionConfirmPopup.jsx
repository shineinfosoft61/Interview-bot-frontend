import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { getHrDocument, updateHRDocument } from '../reduxServices/actions/InterviewAction';

/*
  DecisionConfirmPopup
  Props:
  - isOpen: boolean
  - candidate: object | null
  - onClose: () => void
  - onPass: () => void
  - onFail: () => void
*/
const DecisionConfirmPopup = ({ isOpen, candidate, onClose }) => {
  if (!isOpen || !candidate) return null;

  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDecision = async (action) => {
    console.log('handleDecision called with action:', action);
    if (!candidate) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        is_selected: action,
      };
      const res = await dispatch(updateHRDocument(candidate.id, payload));
      if (!res.success) {
        setError('Failed to update candidate status');
      }
      await dispatch(getHrDocument());
      onClose?.();
    } catch (e) {
      console.error('Error updating candidate status:', e);
      setError('An error occurred while updating the status');
    } finally {
      setSubmitting(false);
    }
  };

  const totalScore =
    candidate.total_score ?? candidate.totalScore ?? candidate.score ?? 'N/A';
  const communicationScore =
    candidate.total_communication_score ??
    candidate.communicationScore ??
    candidate.comm_score ??
    'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Confirm Decision</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-gray-700">
          <p>
            Are you sure you want to mark the candidate{' '}
            <span className="font-semibold">{candidate?.name || 'N/A'}</span>{' '}
            as Pass or Fail?
          </p>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Score</span>
              <span className="font-medium">{totalScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Communication Score</span>
              <span className="font-medium">{communicationScore}</span>
            </div>
          </div>
          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex items-center justify-end space-x-3">
          <button
            onClick={() => handleDecision('False')}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : 'Mark as Fail'}
          </button>
          <button
            onClick={() => handleDecision('True')}
            className="px-4 py-2 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Please wait...' : 'Mark as Pass'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionConfirmPopup;
