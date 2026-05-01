/**
 * Vercel Serverless Function entry point.
 * Exposes the Express app to handle all /api/v1/* requests.
 *
 * Vercel automatically compiles this file with @vercel/node.
 */
export { app as default } from '../apps/api/src/app.js';
