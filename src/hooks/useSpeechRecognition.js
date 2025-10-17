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
  console.log("isUserSpeaking@@@@@@@@@@@@@", isUserSpeaking);


  // Initialize speech recognition
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
        if (isRecording && micEnabled) {
          setTimeout(() => {
            if (isRecording && recognitionRef.current) {
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
            if (isRecording && micEnabled) {
              setTimeout(() => {
                if (isRecording && recognitionRef.current) {
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
            if (isRecording && micEnabled) {
              setTimeout(() => {
                if (isRecording && recognitionRef.current) {
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
            if (isRecording && micEnabled) {
              setTimeout(() => {
                if (isRecording && recognitionRef.current) {
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
  }, [isRecording, micEnabled]);

  const startRecording = () => {
    if (recognitionRef.current && micEnabled) {
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
          if (micEnabled) {
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
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
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
