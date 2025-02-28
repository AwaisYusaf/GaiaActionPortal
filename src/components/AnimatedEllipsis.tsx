'use client';

import { useState, useEffect } from 'react';

const AnimatedEllipsis = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        switch (prevDots) {
          case '':
            return '.';
          case '.':
            return '..';
          case '..':
            return '...';
          case '...':
            return '';
          default:
            return '';
        }
      });
    }, 500); // Change dot every 500ms

    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block min-w-[24px] text-[#00ff7f] font-mono text-lg">{dots}</span>;
};

export default AnimatedEllipsis;
