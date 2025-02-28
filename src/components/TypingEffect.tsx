'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypingEffectProps {
  questions: string[];
  typingSpeed?: number;
  pauseBetweenQuestions?: number;
  className?: string;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  questions,
  typingSpeed = 100,
  pauseBetweenQuestions = 2000,
  className = '',
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];

    if (isTyping && !isPaused) {
      if (!isDeleting && displayedText.length < currentQuestion.length) {
        // Typing forward
        timerRef.current = setTimeout(() => {
          setDisplayedText(currentQuestion.substring(0, displayedText.length + 1));
        }, typingSpeed + Math.random() * 50); // Add some randomness to typing speed
      } else if (!isDeleting && displayedText.length === currentQuestion.length) {
        // Finished typing, pause before deleting
        timerRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, pauseBetweenQuestions);
      } else if (isDeleting && displayedText.length > 0) {
        // Deleting
        timerRef.current = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, typingSpeed / 2); // Delete faster than typing
      } else if (isDeleting && displayedText.length === 0) {
        // Finished deleting, move to next question
        setIsDeleting(false);
        setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [questions, currentQuestionIndex, displayedText, isTyping, isPaused, isDeleting, typingSpeed, pauseBetweenQuestions]);

  return (
    <span className={className}>
      {displayedText}
    </span>
  );
};

export default TypingEffect;
