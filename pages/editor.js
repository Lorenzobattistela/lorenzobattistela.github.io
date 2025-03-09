import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import CONFIG from '../lib/config';

// Import the SimpleMDE editor dynamically to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function Editor() {
  const [value, setValue] = useState('# New Post\n\nWrite your content here...');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Configuration for the SimpleMDE editor
  const editorOptions = {
    autofocus: true,
    spellChecker: false,
    toolbar: [
      'bold', 'italic', 'heading', '|', 
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', 'code', 'table', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ],
    status: ['autosave', 'lines', 'words', 'cursor'],
    previewRender: (plainText) => {
      return <ReactMarkdown>{plainText}</ReactMarkdown>;
    },
    uploadImage: true,
    promptURLs: true,
    autoSave: {
      enabled: true,
      delay: 1000,
      uniqueId: 'blog-post-editor'
    }
  };

  // Handle editor value change
  const handleChange = (value) => {
    setValue(value);
    localStorage.setItem('editorContent', value);
  };

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Generate a file for download
  const downloadMarkdown = () => {
    if (!title.trim()) {
      alert('Please enter a title for your post');
      return;
    }

    const date = new Date().toISOString();
    const frontMatter = `---
title: "${title}"
description: "${description}"
date: "${date}"
---

`;
    const content = frontMatter + value;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load content from localStorage on initial load
  useEffect(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      setValue(savedContent);
    }
  }, []);

  return (
    <div className="editor-container">
      <Head>
        <title>Editor | {CONFIG.title}</title>
      </Head>

      <div className="editor-header">
        <Link href="/" legacyBehavior>
          <a className="back-link">← Back to Blog</a>
        </Link>
        <h1>Markdown Editor</h1>
        <div className="editor-controls">
          <button onClick={togglePreview} className="preview-button">
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </button>
          <button onClick={downloadMarkdown} className="download-button">
            Download Markdown
          </button>
        </div>
      </div>

      <div className="metadata-section">
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
        <input
          type="text"
          placeholder="Post Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="description-input"
        />
      </div>

      {previewMode ? (
        <div className="preview-container">
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          >
            {value}
          </ReactMarkdown>
        </div>
      ) : (
        <SimpleMDE
          value={value}
          onChange={handleChange}
          options={editorOptions}
          className="markdown-editor"
        />
      )}
    </div>
  );
}