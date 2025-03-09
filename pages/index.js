import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CONFIG from '../lib/config';
import { getSortedPostsData } from '../lib/posts';

export default function Home({ allPostsData }) {
  const canvasRef = useRef(null);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(2); // 1 = slow, 2 = medium, 3 = fast
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !animationEnabled) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    
    // Content area dimensions (where to reduce animation density)
    const contentWidth = Math.min(1100, width * 0.9); // Increased from 800px
    const contentLeft = (width - contentWidth) / 2;
    const contentRight = contentLeft + contentWidth;
    
    // ASCII donut animation
    let A = 1;
    let B = 1;
    const R1 = 1;
    const R2 = 2;
    const K1 = 150;
    const K2 = 5;
    const chars = '.,-~:;=!*#$@'.split('');
    
    let animationId;
    let frameCount = 0;
    const framesToSkip = 4 - animationSpeed; // Skip frames based on speed setting
    
    function renderFrame() {
      // Only render every X frames based on speed setting
      frameCount++;
      if (frameCount < framesToSkip) {
        animationId = requestAnimationFrame(renderFrame);
        return;
      }
      frameCount = 0;
      
      ctx.fillStyle = 'rgba(20, 20, 28, 0.05)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#84a88d';
      ctx.font = '15px monospace';
      
      // Slow down the rotation
      A += 0.03;
      B += 0.01;
      
      // Precompute cosines and sines of A and B
      const cosA = Math.cos(A);
      const sinA = Math.sin(A);
      const cosB = Math.cos(B);
      const sinB = Math.sin(B);
      
      for (let j = 0; j < height; j += 20) {
        for (let i = 0; i < width; i += 10) {
          // Determine if we're in the content area
          const isInContentArea = i > contentLeft && i < contentRight;
          
          // Skip most renders in content area
          if (isInContentArea && Math.random() > 0.08) continue;
          
          const x = i / width * 4 - 2;
          const y = j / height * 4 - 2;
          
          const z = 1 / (x * x + y * y + 1) ** 0.5;
          
          // Rotate in 3D space
          const tx = x * cosB * z + y * sinB * z;
          const ty = y * cosB * z - x * sinB * z;
          const tz = z;
          
          // Reduce opacity in content area
          if (isInContentArea) {
            ctx.globalAlpha = 0.2; // Even more subtle in content area
          } else {
            ctx.globalAlpha = 0.8;
          }
          
          // Draw characters based on position
          const idx = Math.floor(Math.random() * chars.length);
          const char = chars[idx];
          
          if (Math.random() > 0.995) {
            ctx.fillText('λ', i, j);  // Occasionally draw lambda symbol
          } else if (Math.random() > 0.997) {
            ctx.fillText('∫', i, j);  // Occasionally draw integral symbol
          } else if (Math.random() > 0.999) {
            ctx.fillText('Σ', i, j);  // Occasionally draw sigma symbol
          } else if (Math.random() > 0.9) {
            ctx.fillText(char, i, j);
          }
        }
      }
      
      // Reset global alpha
      ctx.globalAlpha = 1;
      
      animationId = requestAnimationFrame(renderFrame);
    }
    
    renderFrame();
    
    // Clean up effect
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationEnabled, animationSpeed]);
  
  // Toggle animation on/off
  const toggleAnimation = () => {
    setAnimationEnabled(!animationEnabled);
  };
  
  // Change animation speed
  const changeSpeed = () => {
    setAnimationSpeed((prevSpeed) => (prevSpeed % 3) + 1); // Cycle through 1, 2, 3
  };

  return (
    <div className="container">
      <Head>
        <title>{CONFIG.title}</title>
        <meta name="description" content={CONFIG.description} />
      </Head>

      {animationEnabled && <canvas ref={canvasRef} className="background-canvas" />}

      <main>
        <div className="header">
          <div className="header-top">
            <h1>{CONFIG.title}</h1>
            <div className="animation-controls">
              <button 
                className="animation-toggle" 
                onClick={toggleAnimation}
                aria-label={animationEnabled ? "Disable background animation" : "Enable background animation"}
              >
                {animationEnabled ? "Disable Animation" : "Enable Animation"}
              </button>
              
              {animationEnabled && (
                <button 
                  className="animation-speed" 
                  onClick={changeSpeed}
                  aria-label={`Current speed: ${animationSpeed === 1 ? 'Slow' : animationSpeed === 2 ? 'Medium' : 'Fast'}`}
                >
                  Speed: {animationSpeed === 1 ? 'Slow' : animationSpeed === 2 ? 'Medium' : 'Fast'}
                </button>
              )}
            </div>
          </div>
          <p className="description">
            Software Developer and Researcher at{' '}
            <a href="https://higherorderco.com/" target="_blank" rel="noopener noreferrer">
              @HigherOrderCO
            </a>
          </p>
        </div>

        <div className="posts-container">
          <h2>Posts</h2>
          <ul className="posts-list">
            {allPostsData.map(({ id, date, title, description }) => (
              <li key={id} className="post-item">
                <Link href={`/posts/${id}`} legacyBehavior>
                  <a>
                    <h3>{title}</h3>
                    <p className="post-description">{description}</p>
                    <small className="date">{date}</small>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer>
        <div className="footer-content">
          <p>
            <a href={CONFIG.social.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {CONFIG.social.twitter && (
              <a href={CONFIG.social.twitter} target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            )}
            {CONFIG.social.linkedin && (
              <a href={CONFIG.social.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData
    }
  };
}
