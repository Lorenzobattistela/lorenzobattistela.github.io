import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CONFIG from '../lib/config';
import { getSortedPostsData } from '../lib/posts';

export default function Home({ allPostsData }) {
  return (
    <div className="container">
      <Head>
        <title>{CONFIG.title}</title>
        <meta name="description" content={CONFIG.description} />
      </Head>

      <main>
        <div className="header">
          <div className="header-top">
            <h1>{CONFIG.title}</h1>
          </div>
          <p className="description">
            Software Developer and Researcher at{' '}
            <a href="https://higherorderco.com/" target="_blank" rel="noopener noreferrer">
              @HigherOrderCO
            </a>
          </p>
        </div>

                <img src="/images/car_gif.gif" alt="Car GIF" className="car-gif" />
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
