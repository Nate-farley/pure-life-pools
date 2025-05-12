// src/pages/api/clients/phone/[PHONE_NUMBER].ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const PHONE_NUMBER = id;
  if (!PHONE_NUMBER || Array.isArray(PHONE_NUMBER)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  
  try {
    // Query the database for a client with the given phone number
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', PHONE_NUMBER)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Record not found error
        return res.status(404).json({ error: 'Client not found' });
      }
      throw error;
    }
    
    return res.status(200).json({ client: data });
  } catch (error: any) {
    console.error('Error fetching client by phone number:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch client' });
  }
}