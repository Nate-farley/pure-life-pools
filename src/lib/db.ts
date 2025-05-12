import { QueryArrayConfig, sql } from '@vercel/postgres';

export async function executeQuery(query: QueryArrayConfig<never[]>, params = []) {
  try {
    const result = await sql.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}