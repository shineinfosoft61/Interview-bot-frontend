import React, { useState, useEffect } from 'react';
import { FileText, X, Save, Loader2 } from 'lucide-react';
import { updateRequirement } from '../reduxServices/actions/InterviewAction';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const EditRequirementPopup = ({ requirement, onClose, onUpdate }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    experience: '',
    technology: '',
    No_of_openings: '',
    notice_period: '',
    priority: false,
  });
  const [saving, setSaving] = useState(false);

  // Populate form data when requirement prop changes
  useEffect(() => {
    if (requirement) {
      setFormData({
        name: requirement.name || '',
        experience: requirement.experience || '',
        technology: requirement.technology || '',
        No_of_openings: requirement.No_of_openings || '',
        notice_period: requirement.notice_period || '',
        priority: requirement.priority || false,
      });
    }
  }, [requirement]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requirement?.id) return;
    
    setSaving(true);
    try {
      const result = await dispatch(updateRequirement(requirement.id, formData));
      if (result?.success) {
        toast.success('Requirement updated successfully');
        onUpdate(result.data);
        onClose();
      } else {
        toast.error(result?.error || 'Failed to update requirement');
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
      toast.error('An error occurred while updating the requirement');
    } finally {
      setSaving(false);
    }
  };

  if (!requirement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!saving) onClose(); }} />
      <div className="relative bg-white w-full max-w-3xl md:max-w-4xl mx-4 sm:mx-6 md:mx-8 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-5 md:px-8 text-gray-800 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Edit Job Requirement</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-200"
            disabled={saving}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Experience <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g., 3-5 years"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Technology <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="technology"
                value={formData.technology}
                onChange={handleChange}
                placeholder="e.g., React, Node.js"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Number of Openings
              </label>
              <input
                type="number"
                name="No_of_openings"
                value={formData.No_of_openings}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Notice Period (days)
              </label>
              <input
                type="number"
                name="notice_period"
                value={formData.notice_period}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="priority"
                  name="priority"
                  checked={formData.priority}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                High Priority
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequirementPopup;
