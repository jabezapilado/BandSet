import app from '../server/app.js';

// Vercel serves this catch-all file as the production API function.
// Express keeps the same /api/* routes used during local development.
export default app;
