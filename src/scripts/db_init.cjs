// src/scripts/db_init.js
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
const rootDir = path.resolve(__dirname, '../../');
const envPath = path.resolve(rootDir, '.env.local');

if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`.env.local not found at ${envPath}`);
  dotenv.config(); // Fall back to default .env if exists
}

// Verify connection info is loaded
console.log('Connection info loaded:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Supabase environment variables not found!');
  process.exit(1);
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function createClientsTable() {
  console.log('Creating clients table...');
  
  try {
    // First, check if the table already exists by trying to select from it
    const { error: checkError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    // If no error, table exists. If error with code 42P01, table doesn't exist
    if (checkError) {
      console.log('Table does not exist or cannot be accessed:', checkError.message);
      
      // Execute SQL to create the table via Supabase's stored procedures
      // Note: This requires you to have created a stored procedure in Supabase first
      
      // Since we can't create tables directly via the API, let's log instructions
      console.log('\nIMPORTANT: You need to create the clients table in Supabase manually.');
      console.log('Go to the Supabase dashboard, open SQL Editor, and run this query:');
      console.log(`
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  customer VARCHAR(255) NOT NULL,
  permitting VARCHAR(50) DEFAULT 'Pending',
  order_status VARCHAR(50) DEFAULT 'Confirmed',
  shell_delivery_date VARCHAR(50),
  opening_date VARCHAR(50),
  shell_drop VARCHAR(50),
  closing_date VARCHAR(50),
  plumbing_pressure_test VARCHAR(50),
  equipment_set VARCHAR(50),
  collar_footer_pour VARCHAR(50),
  decking VARCHAR(50),
  inspection_state VARCHAR(50),
  inspection_status VARCHAR(50) DEFAULT 'Not Started',
  final VARCHAR(50),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
      `);
      
      // Prompt the user to continue after creating the table
      console.log('\nAfter creating the table, run this script again to seed the data.');
      process.exit(0);
    }
    
    console.log('Clients table already exists, continuing...');
    return true;
  } catch (error) {
    console.error('Error checking/creating clients table:', error);
    throw error;
  }
}

async function seedInitialData() {
  console.log('Checking if seeding is needed...');
  
  try {
    // Check if data already exists
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking if data exists:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Data already exists, skipping seed.');
      return;
    }
    
    console.log('Table is empty, seeding initial data...');
    
    const initialClients = [
      {
        customer: 'Johnson Family',
        permitting: 'Approved',
        order_status: 'In Progress',
        shell_delivery_date: '04/15/2025',
        opening_date: '04/20/2025',
        shell_drop: '05/01/2025',
        closing_date: '05/15/2025',
        plumbing_pressure_test: '05/20/2025',
        equipment_set: '05/22/2025',
        collar_footer_pour: '05/24/2025',
        decking: '05/28/2025',
        inspection_state: '05/29/2025',
        inspection_status: 'Scheduled',
        final: '05/31/2025',
        progress: 65
      },
      {
        customer: 'Smith Corporation',
        permitting: 'Pending',
        order_status: 'Confirmed',
        shell_delivery_date: '04/22/2025',
        opening_date: '04/28/2025',
        shell_drop: '05/05/2025',
        closing_date: '05/20/2025',
        plumbing_pressure_test: '05/25/2025',
        equipment_set: '05/27/2025',
        collar_footer_pour: '05/29/2025',
        decking: '06/02/2025',
        inspection_state: '06/03/2025',
        inspection_status: 'Not Started',
        final: '06/08/2025',
        progress: 30
      },
      {
        customer: 'Martinez Residence',
        permitting: 'Approved',
        order_status: 'Completed',
        shell_delivery_date: '03/15/2025',
        opening_date: '03/20/2025',
        shell_drop: '03/30/2025',
        closing_date: '04/10/2025',
        plumbing_pressure_test: '04/15/2025',
        equipment_set: '04/17/2025',
        collar_footer_pour: '04/19/2025',
        decking: '04/22/2025',
        inspection_state: '04/23/2025',
        inspection_status: 'Passed',
        final: '04/25/2025',
        progress: 100
      },
      {
        customer: 'Wilson Development',
        permitting: 'Rejected',
        order_status: 'On Hold',
        shell_delivery_date: 'TBD',
        opening_date: 'TBD',
        shell_drop: 'TBD',
        closing_date: 'TBD',
        plumbing_pressure_test: 'TBD',
        equipment_set: 'TBD',
        collar_footer_pour: 'TBD',
        decking: 'TBD',
        inspection_state: 'TBD',
        inspection_status: 'Not Started',
        final: 'TBD',
        progress: 10
      },
      {
        customer: 'Thompson Project',
        permitting: 'In Review',
        order_status: 'Confirmed',
        shell_delivery_date: '05/05/2025',
        opening_date: '05/10/2025',
        shell_drop: '05/15/2025',
        closing_date: '05/30/2025',
        plumbing_pressure_test: '06/05/2025',
        equipment_set: '06/07/2025',
        collar_footer_pour: '06/09/2025',
        decking: '06/12/2025',
        inspection_state: '06/13/2025',
        inspection_status: 'Scheduled',
        final: '06/17/2025',
        progress: 45
      }
    ];
    
    // Insert all clients in a single batch
    const { data: insertedData, error: insertError } = await supabase
      .from('clients')
      .insert(initialClients)
      .select();
    
    if (insertError) {
      console.error('Error seeding initial data:', insertError);
      throw insertError;
    }
    
    console.log(`Successfully inserted ${insertedData.length} clients.`);
    
  } catch (error) {
    console.error('Error in seedInitialData:', error);
    throw error;
  }
}

async function setupDatabase() {
  console.log('Starting database setup...');
  
  try {
    await createClientsTable();
    await seedInitialData();
    
    console.log('Database setup completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, error };
  }
}

// Run the setup
setupDatabase()
  .then((result) => {
    console.log('Setup result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error during setup:', error);
    process.exit(1);
  });