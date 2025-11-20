import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getQuestion } from '../reduxServices/actions/InterviewAction';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTimer } from '../hooks/useTimer';
import UserOnboarding from './UserOnboarding';
import InterviewStart from './InterviewStart';
import InterviewComplete from './InterviewComplete';
import InterviewInProgress from './InterviewInProgress';
import { saveAnswer } from '../reduxServices/actions/InterviewAction';
import { useParams } from 'react-router-dom';
import { getHrDocument, updateHRDocument } from '../reduxServices/actions/InterviewAction';


const InterviewBot = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { questions } = useSelector(state => state.InterviewReducer);
  
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const tabSwitchesRef = useRef(0);
  const lastSwitchAtRef = useRef(0);
  const stopCameraRef = useRef(null);

  const totalQuestions = 10;
  
  const speechSynthesisRef = useRef(null);
  
  // Use custom hooks
  const {
    isRecording,
    isListening,
    currentAnswer,
    micEnabled,
    setMicEnabled,
    startRecording,
    stopRecording,
    resetTranscript,
    isUserSpeaking
  } = useSpeechRecognition();
  
  const {
    timeLeft,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime
  } = useTimer(120);

  // Check for existing user data on component mount
  useEffect(() => {
    const savedUserData = localStorage.getItem('interviewUserData');
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        setUserData(parsedData);
        setIsOnboardingComplete(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
  }, []);

  // Fetch first question when onboarding is complete
  useEffect(() => {
    if (isOnboardingComplete) {
      fetchNewQuestion();
    }
  }, [dispatch, isOnboardingComplete]);

  const fetchNewQuestion = async () => {
    setQuestionsLoading(true);
    try {
      await dispatch(getQuestion(id));
    } catch (error) {
      console.error('Error fetching question:', error);
    }
    setQuestionsLoading(false);
  };

  // Keep currentQuestion in sync with questions and currentQuestionIndex
  // This effect does NOT trigger timers or speech; it only sets the question reference
  useEffect(() => {
    if (questions.length === 0) return;
    const clampedIndex = Math.min(currentQuestionIndex, questions.length - 1);
    if (questions[clampedIndex]) {
      setCurrentQuestion(questions[clampedIndex]);
    }
  }, [questions, currentQuestionIndex]);

  // Start timer and speak when the currentQuestion changes while interview is in progress
  useEffect(() => {
    if (!currentQuestion) return;
    if (isStarted && !interviewComplete) {
      const questionTimeLimit = currentQuestion.time_limit || 120;
      resetTimer(questionTimeLimit);
      startTimer(questionTimeLimit);
      if (speechEnabled && currentQuestion.text) {
        speakQuestion(currentQuestion.text);
      }
    }
  }, [currentQuestion, isStarted, speechEnabled, interviewComplete]);

  // Timer auto-advance logic
  useEffect(() => {
    if (timeLeft === 0 && isStarted && !interviewComplete) {
      handleNextQuestion();
    }
  }, [timeLeft, isStarted, interviewComplete]);

  // Text-to-Speech function
  const speakQuestion = (questionText) => {
    if ('speechSynthesis' in window && speechEnabled) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      setIsSpeaking(true);
      setMicEnabled(false); // Disable mic while speaking
      
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setMicEnabled(true); // Enable mic after speaking
        // Auto-start recording after question is spoken
        setTimeout(() => {
          if (!isRecording) {
            startRecording();
          }
        }, 500);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setMicEnabled(true);
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // If speech synthesis not available, just enable mic
      setMicEnabled(true);
      setTimeout(() => {
        if (!isRecording) {
          startRecording();
        }
      }, 500);
    }
  };


  const startInterview = () => {
    if (currentQuestion) {
      setIsStarted(true);
      startTimer(currentQuestion.time_limit || 120);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setInterviewComplete(false);
      setMicEnabled(false); // Start with mic disabled
      // Speak the first question
      if (speechEnabled && currentQuestion.text) {
        speakQuestion(currentQuestion.text);
      } else {
        setMicEnabled(true);
      }
    }
  };


  const handleNextQuestion = async () => {
    if (!currentQuestion) return;
    
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setMicEnabled(true);
    resetTranscript();
    
    // Save current answer
    const newAnswer = {
      hr : id,
      question: currentQuestion.id,
      candidate: userData.id,
      answer_text: currentAnswer,
      timestamp: new Date().toISOString(),
      timeSpent: (currentQuestion.time_limit || 120) - timeLeft
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    const result = await dispatch(saveAnswer(newAnswer));

    // Save to localStorage (simulating database)
    localStorage.setItem('interviewAnswers', JSON.stringify(updatedAnswers));

    // Move to next question from pre-fetched list if available
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetTranscript();
      stopRecording();
      setMicEnabled(false); // Disable mic for next question
      return; // We already have the next question in memory
    }

    // If we have exhausted pre-fetched questions but interview isn't over, fetch more
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetTranscript();
      stopRecording();
      setMicEnabled(false);
      await fetchNewQuestion();
      return;
    } else {
      // Turn off camera before completing interview
      try {
        if (typeof stopCameraRef.current === 'function') {
          stopCameraRef.current();
        }
      } catch (e) {
        console.debug('Failed to stop camera on completion:', e);
      }
      setInterviewComplete(true);
      stopRecording();
      setMicEnabled(false);
      stopTimer();

        const payload = {
          interview_status: "Completed",
          interview_closed: true,
          tab_count: tabSwitchesRef.current,
        };
        const res = await dispatch(updateHRDocument(id, payload));
        if (res?.success) {
          toast.success('Interview updated successfully');
          dispatch(getHrDocument());
        } else {
          toast.error(res?.error || 'Failed to update interview');
        }
            
    }
  };


  const handleOnboardingComplete = (userInfo) => {
    setUserData(userInfo);
    setIsOnboardingComplete(true);
  };

  const resetInterview = async () => {
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    resetTimer(120);
    setAnswers([]);
    resetTranscript();
    setInterviewComplete(false);
    setMicEnabled(false);
    stopRecording();
    // Fetch a new first question
    await fetchNewQuestion();
  };

  const resetToOnboarding = () => {
    // Clear all data and return to onboarding
    localStorage.removeItem('interviewUserData');
    localStorage.removeItem('interviewAnswers');
    setUserData(null);
    setIsOnboardingComplete(false);
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    resetTimer(120);
    setAnswers([]);
    resetTranscript();
    setInterviewComplete(false);
    setMicEnabled(false);
    stopRecording();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Show onboarding if not completed
  if (!isOnboardingComplete) {
    return <UserOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (!isStarted) {
    return (
      <InterviewStart
        currentQuestion={currentQuestion}
        questionsLoading={questionsLoading}
        speechEnabled={speechEnabled}
        setSpeechEnabled={setSpeechEnabled}
        startInterview={startInterview}
        totalQuestions={totalQuestions}
        userData={userData}
        resetToOnboarding={resetToOnboarding}
      />
    );
  }

  if (interviewComplete) {
    return (
      <InterviewComplete
        answers={answers}
        totalQuestions={totalQuestions}
        resetInterview={resetInterview}
      />
    );
  }

  
  return (
    <InterviewInProgress
      currentQuestion={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={totalQuestions}
      timeLeft={timeLeft}
      isRecording={isRecording}
      isListening={isListening}
      isSpeaking={isSpeaking}
      micEnabled={micEnabled}
      currentAnswer={currentAnswer}
      startRecording={startRecording}
      stopRecording={stopRecording}
      handleNextQuestion={handleNextQuestion}
      formatTime={formatTime}
      isUserSpeaking={isUserSpeaking}
      tabSwitchesRef={tabSwitchesRef}
      lastSwitchAtRef={lastSwitchAtRef}
      registerStopCamera={(fn) => { stopCameraRef.current = fn; }}
    />
  );
};

export default InterviewBot;
