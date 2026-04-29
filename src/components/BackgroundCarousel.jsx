import React, { useEffect, useState } from 'react';

const images = [
  new URL('../assets/anosiravo1.jpg', import.meta.url).href,
  new URL('../assets/anosiravo2.jpg', import.meta.url).href,
  new URL('../assets/anosiravo3.jpg', import.meta.url).href,
  new URL('../assets/anosiravo4.jpg', import.meta.url).href,
];

const BackgroundCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${img}) center center/cover no-repeat fixed`,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: i === index ? 1 : 0,
            transition: 'opacity 1.5s ease',
            willChange: 'opacity',
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundCarousel;
