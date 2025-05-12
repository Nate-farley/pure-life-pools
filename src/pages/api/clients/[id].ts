// src/pages/api/clients/[id].ts
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
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  // Handle GET request - fetch a specific client
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Record not found error
          return res.status(404).json({ error: 'Client not found' });
        }
        throw error;
      }
      
      return res.status(200).json({ client: data });
    } catch (error: any) {
      console.error('Error fetching client:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch client' });
    }
  }
  
  // Handle PUT request - update a client
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      if (!updates.customer) {
        return res.status(400).json({ error: 'Customer name is required' });
      }
      
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (data.length === 0) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      return res.status(200).json({ client: data[0] });
    } catch (error: any) {
      console.error('Error updating client:', error);
      return res.status(500).json({ error: error.message || 'Failed to update client' });
    }
  }
  
  // Handle DELETE request - delete a client
  else if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error deleting client:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete client' });
    }
  }
  
  // Handle unsupported methods
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}