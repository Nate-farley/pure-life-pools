// src/pages/api/scrape.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from 'fs/promises';

async function getExistingImages() {
  try {
    const outputDir = path.join(process.cwd(), 'public', 'downloaded_images');

    // Check if directory exists
    try {
      await fs.access(outputDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(outputDir, { recursive: true });
      return [];
    }

    // Read directory
    const files = await fs.readdir(outputDir);

    // Return files in the expected format
    return files.map((filename) => ({
      success: true,
      filename,
      url: `/downloaded_images/${filename}`,
    }));
  } catch (error) {
    console.error('Error reading existing images:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First check for existing images
    const existingImages = await getExistingImages();

    // If we have existing images, return them
    if (existingImages.length > 0) {
      console.log('Returning cached images:', existingImages.length);
      return res.status(200).json({
        message: 'Images retrieved from cache',
        results: existingImages,
        fromCache: true,
      });
    }

    // If no existing images, proceed with web scraping
    const { url, className } = req.body;

    if (!url || !className) {
      return res.status(400).json({ error: 'URL and className are required' });
    }

    const webpageResponse = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(webpageResponse.data);
    const imageElements = $(`.${className}`);
    const outputDir = path.join(process.cwd(), 'public', 'downloaded_images');

    const results = [];
    let index = 0;

    for (const element of imageElements) {
      const srcAttr = $(element).attr('src');
      if (!srcAttr) continue;

      try {
        const imageUrl = new URL(srcAttr, url).toString();
        const filename = `${Date.now()}_${index}_${path.basename(imageUrl)}`;
        const filepath = path.join(outputDir, filename);

        const imageResponse = await axios({
          method: 'GET',
          url: imageUrl,
          responseType: 'arraybuffer',
        });

        await fs.writeFile(filepath, imageResponse.data);

        results.push({
          success: true,
          filename,
          url: `/downloaded_images/${filename}`,
        });

        index++;
      } catch (error) {
        console.error(`Failed to process image ${srcAttr}:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          url: srcAttr,
        });
      }
    }

    return res.status(200).json({
      message: 'Images processed',
      results,
      fromCache: false,
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
