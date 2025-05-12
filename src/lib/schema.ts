// lib/db/schema.js
// @ts-nocheck
import { sql } from '@vercel/postgres';

export async function setupDatabase() {
  try {
    // Create clients table
    await sql`
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
      )
    `;
    
    console.log('Clients table created successfully');
    
    // Check if the table is empty and populate with initial data if needed
    const { rowCount } = await sql`SELECT COUNT(*) FROM clients`;
    
    if (rowCount === 0) {
      await seedInitialData();
      console.log('Initial data seeded successfully');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, error };
  }
}

async function seedInitialData() {
  const initialClients = [];
  
  for (const client of initialClients) {
    await sql`
      INSERT INTO clients (
        customer, permitting, order_status, 
        shell_delivery_date, opening_date, shell_drop, 
        closing_date, plumbing_pressure_test, equipment_set, 
        collar_footer_pour, decking, 
        inspection_status, final, progress
      ) VALUES (
        ${client.customer}, ${client.permitting}, ${client.order_status}, 
        ${client.shell_delivery_date}, ${client.opening_date}, ${client.shell_drop}, 
        ${client.closing_date}, ${client.plumbing_pressure_test}, ${client.equipment_set}, 
        ${client.collar_footer_pour}, ${client.decking},
        ${client.inspection_status}, ${client.final}, ${client.progress}
      )
    `;
  }
}
