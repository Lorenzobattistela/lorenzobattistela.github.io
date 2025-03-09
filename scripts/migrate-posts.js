import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const oldPostsDir = path.join(process.cwd(), '../lorenzobattistela.github.io/posts');
const newPostsDir = path.join(process.cwd(), 'posts');
const imagesDir = path.join(process.cwd(), 'public/images');

// Make sure the images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to convert a date string to ISO format
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Function to extract frontmatter from old post format
function extractFrontMatter(content) {
  const match = content.match(/<!--:::({[\s\S]*?}):::-->/);
  
  if (match && match[1]) {
    try {
      const data = JSON.parse(match[1]);
      return {
        title: data.post_title || '',
        description: data.post_description || '',
        date: formatDate(data.post_created_at) || '',
      };
    } catch (e) {
      console.error('Error parsing frontmatter JSON:', e);
      return { title: '', description: '', date: '' };
    }
  }
  
  return { title: '', description: '', date: '' };
}

// Function to clean up the content
function cleanContent(content) {
  // Remove frontmatter
  content = content.replace(/<!--:::({[\s\S]*?}):::-->/, '');
  
  // If there's a line with just "X min read", remove it
  content = content.replace(/^\d+\s+min\s+read\s*$/m, '');
  
  return content.trim();
}

// Function to process image paths
function processImages(content, folderName) {
  const imgDir = path.join(imagesDir, folderName);
  
  // Create directory for this post's images if it doesn't exist
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }
  
  // Replace image references in the content
  content = content.replace(/!\[(.*?)\]\((\.\/([^)]+))\)/g, (match, alt, fullPath, fileName) => {
    // Copy the image from the old location to the new location
    const oldImgPath = path.join(oldPostsDir, folderName, fileName);
    const newImgPath = path.join(imgDir, fileName);
    
    try {
      if (fs.existsSync(oldImgPath)) {
        fs.copyFileSync(oldImgPath, newImgPath);
        console.log(`Copied image: ${fileName}`);
      } else {
        console.warn(`Image not found: ${oldImgPath}`);
      }
    } catch (e) {
      console.error(`Error copying image ${fileName}:`, e);
    }
    
    // Return the new image reference
    return `![${alt}](/images/${folderName}/${fileName})`;
  });
  
  return content;
}

// Main function to migrate posts
function migratePosts() {
  // Read all folders in the old posts directory
  const folders = fs.readdirSync(oldPostsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`Found ${folders.length} post folders to migrate.`);
  
  // Process each folder
  for (const folder of folders) {
    const oldPostPath = path.join(oldPostsDir, folder, 'post.md');
    
    // Check if post.md exists
    if (!fs.existsSync(oldPostPath)) {
      console.warn(`No post.md file found in ${folder}, skipping.`);
      continue;
    }
    
    try {
      // Read the old post content
      const oldContent = fs.readFileSync(oldPostPath, 'utf8');
      
      // Extract frontmatter
      const frontMatter = extractFrontMatter(oldContent);
      
      // Clean up the content
      let newContent = cleanContent(oldContent);
      
      // Process images
      newContent = processImages(newContent, folder);
      
      // Create the new post with frontmatter
      const newPostContent = matter.stringify(newContent, frontMatter);
      
      // Write the new post
      const newPostPath = path.join(newPostsDir, `${folder}.md`);
      fs.writeFileSync(newPostPath, newPostContent);
      
      console.log(`Migrated post: ${folder}`);
    } catch (e) {
      console.error(`Error migrating post ${folder}:`, e);
    }
  }
  
  console.log('Migration complete!');
}

// Run the migration
migratePosts();