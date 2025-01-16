import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import path from 'path';
import fs from 'fs/promises';

interface PoolSpecs {
  size: string;
  depth: string;
  gallons: string;
}

interface PoolData {
  [poolName: string]: PoolSpecs | null;
}

const pools = [
  'aruba',
  'astoria-collection',
  'axiom-12',
  'axiom-12-deluxe',
  'axiom-14',
  'axiom-16',
  'barcelona',
  'bay-isle',
  'bermuda',
  'cambridge',
  'cancun',
  'cancun-deluxe',
  'cape-cod',
  'caribbean',
  'claremont',
  'corinthian-12',
  'corinthian-14',
  'corinthian-16',
  'coronado',
  'delray',
  'enchantment-9-17',
  'enchantment-9-21',
  'enchantment-9-24',
  'fiji',
  'genesis',
  'jamaica',
  'java',
  'key-west',
  'kingston',
  'laguna',
  'laguna-deluxe',
  'lake-shore',
  'milan',
  'monaco',
  'olympia-12',
  'olympia-14',
  'olympia-16',
  'pleasant-cove',
  'providence-14',
  'st-lucia',
  'st-thomas',
  'synergy',
  'tuscan-11-20',
  'tuscan-13-24',
  'tuscan-14-27',
  'tuscan-14-30',
  'tuscan-14-40',
  'valencia',
  'vista-isle',
];

async function getExistingSpecs(): Promise<PoolData | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'pool-specs.json');
    await fs.access(filePath);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function fetchPoolSpecs(poolName: string): Promise<PoolSpecs | null> {
  try {
    console.log(`Fetching specs for ${poolName}...`);
    const response = await axios.get(`https://www.lathampool.com/products/${poolName}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    const specsSection = document.querySelector('.accordion__body_inner');
    
    if (!specsSection) {
      console.error(`No specs section found for ${poolName}`);
      return null;
    }
    
    const content = specsSection.textContent || '';
   // <strong>Gallons Approx:</strong>
    return {
      size: content.match(/Size:\s*(.*?)\s*(?=Depth|$)/i)?.[1]?.trim() || 'N/A',
      depth: content.match(/Depth:\s*(.*?)\s*(?=Gallons|$)/i)?.[1]?.trim() || 'N/A',
      gallons: content.match(/Gallons Approx:\s*(.*?)(?=$)/i)?.[1]?.trim() || 'N/A'
    };
  } catch (error) {
    console.error(`Error fetching ${poolName}:`, error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for existing specs
    const existingSpecs = await getExistingSpecs();
    if (existingSpecs) {
      console.log('Returning cached pool specs');
      return res.status(200).json({
        message: 'Pool specs retrieved from cache',
        data: existingSpecs,
        fromCache: true
      });
    }

    // Scrape new specs
    const poolData: PoolData = {};
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (const poolName of pools) {
      const specs = await fetchPoolSpecs(poolName);
      poolData[poolName] = specs;
      await delay(1000); // Be respectful to the server
    }
    
    // Save to JSON file
    const outputDir = path.join(process.cwd(), 'public');
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
    }
    
    await fs.writeFile(
      path.join(outputDir, 'pool-specs.json'),
      JSON.stringify(poolData, null, 2),
      'utf-8'
    );
    
    return res.status(200).json({
      message: 'Pool specs scraped successfully',
      data: poolData,
      fromCache: false
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}