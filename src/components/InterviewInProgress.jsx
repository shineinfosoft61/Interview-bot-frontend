import React from 'react';
import { Mic, MicOff, SkipForward, Clock } from 'lucide-react';

const InterviewInProgress = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  isRecording,
  isListening,
  isSpeaking,
  micEnabled,
  currentAnswer,
  startRecording,
  stopRecording,
  handleNextQuestion,
  formatTime,
  isUserSpeaking
}) => {

  // console.log("@@@@@@@@@@@@@@@@@@@isRecording", isRecording);
  // console.log("@@@@@@@@@@@@@@@@@@@isListening", isListening);
  // console.log("@@@@@@@@@@@@@@@@@@@micEnabled", micEnabled);
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Inline keyframes for mouth animation */}
        <style>{`
          @keyframes mouthTalk {
            0% { transform: translateX(-50%) scaleX(0.8) scaleY(0.25); height: 2px; }
            50% { transform: translateX(-50%) scaleX(1.15) scaleY(1); height: 8px; }
            100% { transform: translateX(-50%) scaleX(0.8) scaleY(0.25); height: 2px; }
          }
        `}</style>
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Interview in Progress</h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions} - {currentQuestion?.technology} ({currentQuestion?.difficulty_level})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className={`${timeLeft <= 30 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{currentQuestionIndex + 1}</span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion ? currentQuestion.text : 'Loading question...'}
          </h2>

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSpeaking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                !micEnabled || isSpeaking
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm font-medium text-gray-600">
                  {isSpeaking ? 'Speaking question...' : 
                   isRecording ? 'Recording...' : 
                   !micEnabled ? 'Please wait...' : 'Click to start recording'}
                </p>
                <div
                  className={`ml-2 px-2 py-1 rounded-full text-xs flex items-center gap-2 border bg-gray-50 text-gray-600 border-gray-200`}
                  title={isUserSpeaking ? 'Speaking now' : 'Silent'}
                  aria-label={isUserSpeaking ? 'Speaking now' : 'Silent'}
                >
                  {/* Emoji with mouth overlay that animates while speaking */}
                  <span className="relative inline-flex items-center justify-center w-8 h-8">
                    <span className="text-2xl leading-none" role="img" aria-hidden="true">😶</span>
                    <span
                      className="absolute bottom-[1px] left-1/2 w-4 bg-gray-700 rounded-sm"
                      style={
                        isUserSpeaking
                          ? { animation: 'mouthTalk 0.35s infinite ease-in-out', transformOrigin: 'center', zIndex: 10 }
                          : { transform: 'translateX(-50%) scaleY(0.3)', height: '2px', zIndex: 10 }
                      }
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-medium">
                    {isUserSpeaking ? 'Speaking…' : 'Silent'}
                  </span>
                </div>
              </div>
              {isListening && (
                <p className="text-xs text-blue-600 mt-1">Listening for your response...</p>
              )}
              {isSpeaking && (
                <p className="text-xs text-orange-600 mt-1">🔊 Question being read aloud...</p>
              )}
            </div>
          </div>

          {/* Current Answer Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer:
            </label>
            <div className="min-h-[100px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-700">
                {currentAnswer || 'Start recording to see your answer appear here...'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {currentAnswer ? 'Answer recorded' : 'No answer yet'}
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={!currentQuestion}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 flex items-center gap-2"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Finish Interview' : 'Next Question'}
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timer Warning */}
        {timeLeft <= 30 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">⚠️ Time is running out! You have {timeLeft} seconds left.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewInProgress;
