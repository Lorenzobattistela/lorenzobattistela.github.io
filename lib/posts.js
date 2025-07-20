// lib/posts.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'posts');

/* ---------- helper: turn .tex → .md so we can reuse the same pipeline ---------- */
function texToMarkdown(tex) {
  if (tex.trim().startsWith('---')) {
    const parts = tex.split('---');
    if (parts.length >= 3) {
      const frontMatter = parts[1];
      let content = parts.slice(2).join('---');
      
      // Basic LaTeX to Markdown conversion
      content = content
        .replace(/\\section\{([^}]+)\}/g, '## $1')
        .replace(/\\subsection\{([^}]+)\}/g, '### $1')
        .replace(/\\title\{([^}]+)\}/g, '# $1')
        .replace(/\\maketitle/g, '')
        .replace(/\\begin\{document\}/g, '')
        .replace(/\\end\{document\}/g, '')
        .replace(/\\documentclass.*$/gm, '')
        .replace(/\\usepackage.*$/gm, '')
        .replace(/\\newtheorem.*$/gm, '')
        .replace(/\\author\{([^}]+)\}/g, '*By $1*')
        .replace(/\\date\{([^}]+)\}/g, '*$1*')
        // Keep math environments as-is
        .replace(/\$\$([\s\S]*?)\$\$/g, '$$$$1$$')
        .replace(/\$([^$]+)\$/g, '$$$1$$');
      
      return `---\n${frontMatter}---\n\n${content.trim()}`;
    }
  }
  
  return tex;
}

/* ---------- helper: unified pipeline ---------- */
async function mdToHtml(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

/* ---------- public API (unchanged signatures) ---------- */
export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    const id = fileName.replace(/\.(md|tex)$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // if it’s .tex, temporarily turn it into markdown front-matter
    const raw = fileName.endsWith('.tex')
      ? texToMarkdown(fileContents)
      : fileContents;

    const matterResult = matter(raw);
    return { id, ...matterResult.data };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => ({
    params: { id: fileName.replace(/\.(md|tex)$/, '') }
  }));
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const texPath = path.join(postsDirectory, `${id}.tex`);

  const realPath = fs.existsSync(fullPath) ? fullPath : texPath;
  const fileContents = fs.readFileSync(realPath, 'utf8');

  const isTex = realPath.endsWith('.tex');
  const raw = isTex ? texToMarkdown(fileContents) : fileContents;

  const matterResult = matter(raw);
  const contentHtml = await mdToHtml(matterResult.content);

  return {
    id,
    contentHtml,
    ...matterResult.data
  };
}
