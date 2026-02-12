// Server-side exports (for Server Components and Server Actions)
export { createClient, createAdminClient } from './server';

// Middleware export
export { updateSession } from './middleware';

// Note: Browser client should be imported directly from './client'
// to avoid importing server code in client bundles
