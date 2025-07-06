/**
 * Fish Image Downloader Script
 * 
 * This script downloads fish images from Wikimedia Commons and saves them
 * to the public/images/fish/ directory.
 * 
 * Usage:
 * 1. Run: node scripts/download-fish-images.js
 * 2. Images will be downloaded to public/images/fish/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promises: fsPromises } = fs;

// Import image URLs from data file
const { fishImageUrls } = require('../src/data/fishImageUrls');

// Target directory for saving images
const targetDir = path.join(__dirname, '../public/images/fish');

// Ensure target directory exists
const ensureDirectoryExists = async (directory) => {
  try {
    await fsPromises.access(directory);
  } catch (error) {
    // Directory doesn't exist, create it
    await fsPromises.mkdir(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
};

// Download an image from URL and save to filepath
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Main function to download all images
const downloadAllImages = async () => {
  try {
    // Ensure the target directory exists
    await ensureDirectoryExists(targetDir);

    console.log('Starting download of fish images...');
    
    // Create an array of download promises
    const downloadPromises = Object.entries(fishImageUrls).map(([id, url]) => {
      const filepath = path.join(targetDir, `${id}.jpg`);
      
      // Check if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`File already exists: ${filepath}`);
        return Promise.resolve();
      }
      
      // Download the image
      return downloadImage(url, filepath);
    });
    
    // Wait for all downloads to complete
    await Promise.all(downloadPromises);
    
    console.log('All fish images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading fish images:', error);
  }
};

// Run the download function
downloadAllImages();
