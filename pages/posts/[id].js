import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CONFIG from '../../lib/config';
import { getAllPostIds, getPostData } from '../../lib/posts';

export default function Post({ postData }) {
  return (
    <div className="container">
      <Head>
        <title>{postData.title} | {CONFIG.title}</title>
        <meta name="description" content={postData.description || ''} />
      </Head>

      <main className="post-content">
        <nav className="post-nav">
          <div className="post-nav-left">
            <Link href="/" legacyBehavior>
              <a>← Home</a>
            </Link>
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
