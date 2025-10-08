import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, User, Edit, MicOff, CheckCircle, XCircle, Volume2 } from 'lucide-react';

const InterviewStart = ({ 
  currentQuestion, 
  questionsLoading, 
  speechEnabled, 
  setSpeechEnabled, 
  startInterview, 
  totalQuestions,
  userData,
  resetToOnboarding
}) => {
  // Mic test states
  const [micTestState, setMicTestState] = useState('idle'); // idle, testing, success, failed
  const [micTestTranscript, setMicTestTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  
  const testText = "Test voice hear..";
  
  // Initialize speech recognition for mic test
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMicTestTranscript(transcript);
        setMicTestState('success');
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setMicTestState('failed');
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const startMicTest = () => {
    if (recognitionRef.current) {
      setMicTestState('testing');
      setMicTestTranscript('');
      recognitionRef.current.start();
    } else {
      setMicTestState('failed');
    }
  };
  
  const resetMicTest = () => {
    setMicTestState('idle');
    setMicTestTranscript('');
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* User Profile Section */}
        {/* {userData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Candidate Profile</h3>
              <button
                onClick={resetToOnboarding}
                className="text-purple-600 hover:text-purple-800 p-1"
                title="Edit Profile"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {userData.photoPreview && (
                <img 
                  src={userData.photoPreview} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                />
              )}
              <div className="text-left flex-1">
                <p className="font-medium text-gray-800">{userData.name}</p>
                <p className="text-sm text-purple-600">{userData.technology}</p>
                <p className="text-xs text-gray-600">{userData.experience}</p>
              </div>
            </div>
          </div>
        )} */}

        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Bot</h1>
          <p className="text-gray-600">
            Ready to start your interview? You'll have 2 minutes per question to provide your answer using voice input.
          </p>
        </div>

        {/* Microphone Test Section */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Microphone Test
          </h3>
          
          {micTestState === 'idle' && (
            <div>
              <p className="text-sm text-yellow-700 mb-3">
                Test your microphone before starting the interview. Please read the following text aloud:
              </p>
              <div className="bg-white p-3 rounded border border-yellow-300 mb-3">
                <p className="text-sm font-medium text-gray-800 italic">
                  "{testText}"
                </p>
              </div>
              <button
                onClick={startMicTest}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Mic Test
              </button>
            </div>
          )}
          
          {micTestState === 'testing' && (
            <div>
              <div className="flex items-center justify-center gap-2 text-yellow-600 mb-3">
                <div className="animate-pulse">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="font-medium">Listening... Please speak now</span>
              </div>
              <div className="bg-white p-3 rounded border border-yellow-300 mb-3">
                <p className="text-sm font-medium text-gray-800 italic">
                  "{testText}"
                </p>
              </div>
              <button
                onClick={resetMicTest}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <MicOff className="w-4 h-4" />
                Cancel Test
              </button>
            </div>
          )}
          
          {micTestState === 'success' && (
            <div>
              <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Microphone Working!</span>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
                <p className="text-sm text-green-800 mb-2">
                  <strong>You said:</strong>
                </p>
                <p className="text-sm text-gray-800 italic">
                  "{micTestTranscript}"
                </p>
              </div>
              <button
                onClick={resetMicTest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Test Again
              </button>
            </div>
          )}
          
          {micTestState === 'failed' && (
            <div>
              <div className="flex items-center justify-center gap-2 text-red-600 mb-3">
                <XCircle className="w-6 h-6" />
                <span className="font-medium">Microphone Test Failed</span>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200 mb-3">
                <p className="text-sm text-red-800">
                  Please check your microphone permissions and ensure your microphone is working properly.
                </p>
              </div>
              <button
                onClick={resetMicTest}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}
        </div>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Each question will be spoken aloud first</li>
            <li>• Microphone auto-starts after question is read</li>
            <li>• Each question has a 2-minute timer</li>
            <li>• Auto-advance after 2 minutes or click Next</li>
            <li>• All answers are saved automatically</li>
          </ul>
        </div>

        {questionsLoading ? (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Loading question...</span>
          </div>
        ) : !currentQuestion ? (
          <div className="text-red-600 mb-4">
            <p>Failed to load question. Please check your connection and try again.</p>
          </div>
        ) : (
          <div>
            <button
              onClick={startInterview}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Interview ({totalQuestions} Questions)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewStart;
