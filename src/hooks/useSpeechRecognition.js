import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [micEnabled, setMicEnabled] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const speakingTimeoutRef = useRef(null);
  const isRecordingRef = useRef(false);
  const micEnabledRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    micEnabledRef.current = micEnabled;
  }, [micEnabled]);

  // Initialize speech recognition (once)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Enhanced settings for better reliability
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Add grammar hints for better recognition (if supported)
      // if ('webkitSpeechGrammarList' in window) {
      //   const grammar = '#JSGF V1.0; grammar interview; public <interview> = <word>*; <word> = /.*/ ;';
      //   const speechRecognitionList = new window.webkitSpeechGrammarList();
      //   speechRecognitionList.addFromString(grammar, 1);
      //   recognitionRef.current.grammars = speechRecognitionList;
      // }

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';

        setIsUserSpeaking(true);
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = setTimeout(() => {
          setIsUserSpeaking(false);
        }, 800); // after 1.2s of silence -> silent
        
        // Process only new results from resultIndex
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Append final results to our accumulated transcript
            finalTranscriptRef.current += transcript + ' ';
            setFinalTranscript(finalTranscriptRef.current);
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update current answer with accumulated final text + current interim
        setCurrentAnswer(finalTranscriptRef.current + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Auto-restart if still recording and not manually stopped
        if (isRecordingRef.current && micEnabledRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch (error) {
                console.log('Recognition restart failed:', error);
              }
            }
          }, 100);
        } else {
          setIsRecording(false);
        }
      };

      // Handle errors and restart recognition
      recognitionRef.current.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        
        // Handle different error types
        switch (event.error) {
          case 'no-speech':
            // Continue listening for speech
            if (isRecordingRef.current && micEnabledRef.current) {
              setTimeout(() => {
                if (isRecordingRef.current && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (error) {
                    console.log('Recognition restart after no-speech failed:', error);
                  }
                }
              }, 100);
            }
            break;
          case 'audio-capture':
            console.error('Microphone access denied or not available');
            setIsRecording(false);
            setIsListening(false);
            break;
          case 'not-allowed':
            console.error('Microphone permission denied');
            setIsRecording(false);
            setIsListening(false);
            break;
          case 'network':
            // Try to restart after network error
            if (isRecordingRef.current && micEnabledRef.current) {
              setTimeout(() => {
                if (isRecordingRef.current && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (error) {
                    console.log('Recognition restart after network error failed:', error);
                  }
                }
              }, 1000);
            }
            break;
          default:
            // For other errors, try to restart
            if (isRecordingRef.current && micEnabledRef.current) {
              setTimeout(() => {
                if (isRecordingRef.current && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (error) {
                    console.log('Recognition restart after error failed:', error);
                  }
                }
              }, 500);
            }
            break;
        }
      };

      // Handle when recognition starts
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
    }
    // Cleanup on unmount
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      recognitionRef.current = null;
      clearTimeout(speakingTimeoutRef.current);
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && micEnabledRef.current) {
      setIsRecording(true);
      console.log("IsListening", isListening);

      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsRecording(false);
        setIsListening(false);
        
        // Retry after a short delay
        setTimeout(() => {
          if (micEnabledRef.current) {
            try {
              recognitionRef.current.start();
              setIsRecording(true);
              setIsListening(true);
            } catch (retryError) {
              console.error('Retry failed:', retryError);
            }
          }
        }, 1000);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        try { recognitionRef.current.abort?.(); } catch {}
      }
      setIsRecording(false);
      setIsListening(false);
      clearTimeout(speakingTimeoutRef.current);
      setIsUserSpeaking(false);
    }
  };

  const resetTranscript = () => {
    setCurrentAnswer('');
    setFinalTranscript('');
    finalTranscriptRef.current = '';
  };

  return {
    isRecording,
    isListening,
    currentAnswer,
    finalTranscript,
    micEnabled,
    setMicEnabled,
    startRecording,
    stopRecording,
    resetTranscript,
    isUserSpeaking
  };
};
