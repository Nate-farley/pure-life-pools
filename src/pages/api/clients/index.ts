// src/pages/api/clients.ts
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
  // Handle GET request - fetch all clients
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      console.log(error)
      if (error) throw error;
      
      return res.status(200).json({ clients: data || [] });
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch clients' });
    }
  }
  
  // Handle POST request - create a new client
  else if (req.method === 'POST') {
    try {
      const clientData = req.body;
      
      if (!clientData.customer) {
        return res.status(400).json({ error: 'Customer name is required' });
      }
      
      // Check if a client with the same phone number already exists (if phone is provided)
      if (clientData.phone) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', clientData.phone)
          .single();
        
        if (existingClient) {
          return res.status(400).json({ 
            error: 'A client with this phone number already exists' 
          });
        }
      }
      
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select();
      
      if (error) throw error;
      
      return res.status(201).json({ client: data[0] });
    } catch (error: any) {
      console.error('Error creating client:', error);
      return res.status(500).json({ error: error.message || 'Failed to create client' });
    }
  }
  
  // Handle unsupported methods
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}