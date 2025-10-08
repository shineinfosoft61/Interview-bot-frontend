import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialTime = 120) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  const startTimer = (time = initialTime) => {
    console.log('startTimer called with:', time);
    setTimeLeft(time);
    setIsActive(true);
    console.log('Timer state set - timeLeft:', time, 'isActive: true');
  };

  const stopTimer = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const resetTimer = (time = initialTime) => {
    setTimeLeft(time);
    setIsActive(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime
  };
};
