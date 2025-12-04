import React, { useEffect, useState } from 'react';
import { FileText, X, Save, Link as LinkIcon, Clock, Loader2 } from 'lucide-react';
import { updateHRDocument, getHrDocument, getRequirement } from '../reduxServices/actions/InterviewAction';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';


const HrDocPopup = ({ editHrDoc, closeModal, setEditHrDoc, quickInterview }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    technology: '',
    experience: '',
    shine_link: '',
    time: '',
    upload_doc: '',
    updated_at: ''
  });
  const [saving, setSaving] = useState(false);
  const requirements = useSelector((state) => state.InterviewReducer.requirement || []);

  const toDateTimeLocal = (value) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      const pad = (n) => `${n}`.padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const mi = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    } catch {
      return '';
    }
  };

  // Populate fields from editHrDoc whenever it changes
  useEffect(() => {
    if (!editHrDoc) return;
    setFormData({
      name: editHrDoc.name || '',
      email: editHrDoc.email || '',
      phone: editHrDoc.phone || '',
      technology: editHrDoc.technology || '',
      experience: editHrDoc.experience || '',
      shine_link: editHrDoc.shine_link || '',
      time: toDateTimeLocal(editHrDoc.time),
      upload_doc: editHrDoc.upload_doc || '',
      requirement: editHrDoc.requirement_id || editHrDoc.requirement || '',
      is_quick: quickInterview
    });
  }, [editHrDoc]);

  useEffect(() => {
    // Fetch requirements when the component mounts
    const fetchRequirements = async () => {
      try {
        await dispatch(getRequirement());
      } catch (error) {
        console.error('Error fetching requirements:', error);
      }
    };
    
    fetchRequirements();
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!editHrDoc?.id) return;
      setSaving(true);
      // Convert datetime-local to ISO or pass as is depending on backend
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        technology: formData.technology,
        experience: formData.experience || null,
        shine_link: formData.shine_link || null,
        time: formData.time ? new Date(formData.time).toISOString() : null,
        requirement: formData.requirement || null,
        is_quick : formData.is_quick
      };
      const res = await dispatch(updateHRDocument(editHrDoc.id, payload));
      if (res?.success) {
        toast.success('Interview updated successfully');
        closeModal();
        setEditHrDoc(null);
        dispatch(getHrDocument());
      } else {
        toast.error(res?.error || 'Failed to update interview');
      }
    } catch (e) {
      toast.error('Failed to update interview');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!saving) closeModal(); }} />
      <div className="relative bg-white w-full max-w-3xl md:max-w-4xl mx-4 sm:mx-6 md:mx-8 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-5 md:px-8 text-gray-800 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Edit Interview</h3>
          </div>
          <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODIFIED: Grid layout now explicitly sets fields to take up half the space (col-span-6) for a two-column layout on all field rows, except where a three-column layout is needed (Status/Date/Time). */}
        <div className="px-6 py-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

          {/* Name and Email */}
          <div className="md:col-span-6">
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="md:col-span-6">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Phone and Technology */}
          <div className="md:col-span-6">
            <label className="block text-sm text-gray-600 mb-1">Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="md:col-span-6">
            <label className="block text-sm text-gray-600 mb-1">Technology</label>
            <input name="technology" value={formData.technology} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Links */}
          <div className="md:col-span-6">
            <label className="block text-sm text-gray-600 mb-1">Shine Link</label>
            <input name="shine_link" value={formData.shine_link} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
          </div>
          <div className="md:col-span-6">
            <label className="block text-sm text-gray-600 mb-1">Experience</label>
            <input name="experience" value={formData.experience} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://meet.google.com/..." />
          </div>

          {/* Date + Time combined */}
          <div className="md:col-span-6">
            <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /> Date & Time</label>
            <input type="datetime-local" name="time" value={formData.time} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Requirement Dropdown */}
          <div className="md:col-span-12">
            <label className="block text-sm text-gray-600 mb-1">Requirement</label>
            <select
              name="requirement"
              value={formData.requirement || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Requirement</option>
              {requirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.name || `Requirement ${req.id}`}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Footer - Styled to match the image UI */}
        <div className="px-6 py-4 md:px-8 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button disabled={saving} onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-60">Cancel</button>
          <button disabled={saving} onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black shadow-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HrDocPopup;
