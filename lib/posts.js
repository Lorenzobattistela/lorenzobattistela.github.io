import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import katex from 'katex';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data
    };
  });
  
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    };
  });
}

// Process math with KaTeX
function processMath(content) {
  // First, handle block math with $$...$$
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    try {
      return `<div class="math-block">${katex.renderToString(formula.trim(), { 
        displayMode: true,
        throwOnError: false
      })}</div>`;
    } catch (e) {
      console.error('KaTeX error:', e);
      return match; // Return original content if there's an error
    }
  });
  
  // Then handle inline math with $...$, avoiding $ used for currency
  processed = processed.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    // Skip if it looks like currency ($ followed by a number)
    if (/^\s*\d/.test(formula)) {
      return match;
    }
    
    try {
      return katex.renderToString(formula.trim(), { 
        displayMode: false,
        throwOnError: false
      });
    } catch (e) {
      console.error('KaTeX error:', e);
      return match; // Return original content if there's an error
    }
  });
  
  return processed;
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Process math expressions first
  const contentWithMath = processMath(matterResult.content);
  
  // Use marked to convert markdown into HTML string
  const contentHtml = marked.parse(contentWithMath);

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  };
}