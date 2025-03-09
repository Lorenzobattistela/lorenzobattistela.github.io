import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CONFIG from '../../lib/config';
import { getAllPostIds, getPostData } from '../../lib/posts';

export default function Post({ postData }) {
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
    
    // Simple matrix-like background effect
    const fontSize = 15;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);
    const symbols = '01λΣ∫∇∂∀∃∈∉⊂⊃⊆⊇⊕⊗∧∨∩∪≈≠≡≤≥√∞∝∠∧∨⊕⊗⊥∥∴∵∼⊢⊣⊤⊥⋀⋁⋂⋃';
    
    let animationId;
    let frameCount = 0;
    const framesToSkip = 4 - animationSpeed; // Skip frames based on speed setting
    
    function drawRain() {
      // Only render every X frames based on speed setting
      frameCount++;
      if (frameCount < framesToSkip) {
        animationId = requestAnimationFrame(drawRain);
        return;
      }
      frameCount = 0;
      
      ctx.fillStyle = 'rgba(20, 20, 28, 0.05)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#84a88d';
      ctx.font = `${fontSize}px monospace`;
      
      // Drawing the symbols
      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        
        // Determine if we're in the content area
        const isInContentArea = x > contentLeft && x < contentRight;
        
        // Skip most renders in content area
        if (isInContentArea && Math.random() > 0.08) continue;
        
        // Reduce opacity in content area
        if (isInContentArea) {
          ctx.globalAlpha = 0.2; // Even more subtle in content area
        } else {
          ctx.globalAlpha = 0.8;
        }
        
        // Random symbol to print
        const text = symbols[Math.floor(Math.random() * symbols.length)];
        
        // x = i * fontSize, y = value of drops[i] * fontSize
        ctx.fillText(text, x, drops[i] * fontSize);
        
        // Randomly reset the symbol "y" position
        if (drops[i] * fontSize > height && Math.random() > 0.97) {
          drops[i] = 0;
        }
        
        // Increment y coordinate based on speed
        // Slow down drops based on animation speed
        const speedFactor = animationSpeed === 1 ? 0.4 : animationSpeed === 2 ? 0.7 : 1.0;
        drops[i] += speedFactor;
      }
      
      // Reset global alpha
      ctx.globalAlpha = 1;
      
      animationId = requestAnimationFrame(drawRain);
    }
    
    drawRain();
    
    // Cleanup
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
        <title>{postData.title} | {CONFIG.title}</title>
        <meta name="description" content={postData.description || ''} />
      </Head>

      {animationEnabled && <canvas ref={canvasRef} className="background-canvas" />}

      <main className="post-content">
        <nav className="post-nav">
          <div className="post-nav-left">
            <Link href="/" legacyBehavior>
              <a>← Home</a>
            </Link>
          </div>
          <div className="post-nav-right">
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
        </nav>

        <article>
          <h1>{postData.title}</h1>
          <div className="post-meta">
            <time>{postData.date}</time>
          </div>
          
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
          />
        </article>
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

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData
    }
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false
  };
}
