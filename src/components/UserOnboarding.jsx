import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Camera, User, Code, Award, ArrowRight } from 'lucide-react';
import { addCandidate } from '../reduxServices/actions/InterviewAction';

const UserOnboarding = ({ onComplete }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    technology: '',
    experience: '',
    photo: null,
    photoPreview: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [isValidatingFace, setIsValidatingFace] = useState(false);

  // Effect to handle video stream assignment
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch((err) => {
          console.error('Video play error:', err);
        });
      };
    }
  }, [showCamera, stream]);

  const technologies = [
    'JavaScript', 'Python', 'java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 
    'Swift', 'Kotlin', 'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 
    'Spring Boot', 'Laravel', 'Express.js', 'Flutter', 'React Native'
  ];

  const experienceLevels = [
    'Fresher (0-1 years)',
    'Junior (1-3 years)', 
    'Mid-level (3-5 years)',
    'Senior (5-8 years)',
    'Lead (8+ years)'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            photo: file,
            photoPreview: e.target.result
          }));
        };
        reader.readAsDataURL(file);
        setErrors(prev => ({ ...prev, photo: '' }));
      } else {
        setErrors(prev => ({ ...prev, photo: 'Please select a valid image file' }));
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrors(prev => ({ ...prev, photo: 'Unable to access camera. Please upload a photo instead.' }));
      setShowCamera(false);
    }
  };

  // Simple face detection using basic image analysis
  const detectFace = (canvas) => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple face detection based on skin tone detection and face-like patterns
    let skinPixels = 0;
    let totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Basic skin tone detection (simplified)
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinPixels++;
      }
    }
    
    const skinPercentage = (skinPixels / totalPixels) * 100;
    
    // If more than 2% of pixels are skin-like, assume face is present
    // This is a basic heuristic - for production, use proper face detection APIs
    return skinPercentage > 2;
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsValidatingFace(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Validate if face is present
      const hasFace = detectFace(canvas);
      
      if (!hasFace) {
        setIsValidatingFace(false);
        setErrors(prev => ({ 
          ...prev, 
          photo: 'No face detected in the photo. Please position your face clearly in the camera and try again.' 
        }));
        return;
      }
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        const photoUrl = canvas.toDataURL('image/jpeg');
        
        setFormData(prev => ({
          ...prev,
          photo: file,
          photoPreview: photoUrl
        }));
        
        stopCamera();
        setErrors(prev => ({ ...prev, photo: '' }));
        setIsValidatingFace(false);
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.technology) {
      newErrors.technology = 'Please select a technology';
    }
    
    if (!formData.experience) {
      newErrors.experience = 'Please select your experience level';
    }
    
    if (!formData.photo) {
      newErrors.photo = 'Please upload or capture a photo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Create FormData for multipart form submission
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('technology', formData.technology);
        formDataToSend.append('experience', formData.experience);
        
        // Add photo file if exists
        if (formData.photo) {
          formDataToSend.append('photo', formData.photo);
        }
        
        // Add timestamp
        formDataToSend.append('timestamp', new Date().toISOString());
        
        // Dispatch Redux action to save to backend
        const result = await dispatch(addCandidate(formDataToSend));
        
        if (result.success) {
          // Save user data to localStorage for local use
          const userData = {
            ...formData,
            photoPreview: formData.photoPreview,
            timestamp: new Date().toISOString(),
            id: result.data.id // Include backend ID if returned
          };
          localStorage.setItem('interviewUserData', JSON.stringify(userData));
          onComplete(userData);
        } else {
          setErrors({ submit: result.error || 'Failed to save candidate data' });
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors({ submit: 'An error occurred while saving your data. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
          <p className="text-gray-600">Let's get to know you before we start the interview</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Technology Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Code className="inline w-4 h-4 mr-1" />
              Primary Technology *
            </label>
            <select
              name="technology"
              value={formData.technology}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.technology ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select your primary technology</option>
              {technologies.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
            {errors.technology && <p className="text-red-500 text-sm mt-1">{errors.technology}</p>}
          </div>

          {/* Experience Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="inline w-4 h-4 mr-1" />
              Experience Level *
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.experience ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select your experience level</option>
              {experienceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
          </div>

          {/* Photo Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="inline w-4 h-4 mr-1" />
              Profile Photo *
            </label>
            
            {formData.photoPreview ? (
              <div className="text-center">
                <img 
                  src={formData.photoPreview} 
                  alt="Profile preview" 
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-purple-200"
                />
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photo: null, photoPreview: null }))}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Retake Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {showCamera ? (
                  <div className="text-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-64 h-48 rounded-lg mx-auto mb-4 bg-gray-200"
                    />
                    <div className="space-x-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isValidatingFace}
                        className={`px-4 py-2 rounded-lg text-white ${
                          isValidatingFace 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {isValidatingFace ? 'Validating...' : 'Capture'}
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        disabled={isValidatingFace}
                        className={`px-4 py-2 rounded-lg text-white ${
                          isValidatingFace 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Upload Photo
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
          </div>

          {/* Error message for submission */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                Continue to Interview
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default UserOnboarding;
