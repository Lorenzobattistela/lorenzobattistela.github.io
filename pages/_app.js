import '../styles/globals.scss';
import 'katex/dist/katex.min.css';
import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';
import CONFIG from '../lib/config';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={CONFIG.description} />
        <meta name="author" content={CONFIG.author} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
