/**
 * Vercel Serverless Function entry point.
 * Exposes the Express app to handle all /api/v1/* requests.
 *
 * Vercel automatically compiles this file with @vercel/node.
 */

// Force-include pg so @vercel/nft (Node File Tracer) detects it statically.
// Sequelize loads the PostgreSQL dialect via require(variable), which NFT
// cannot trace — the explicit static import ensures the package ends up
// in the Lambda node_modules bundle.
import 'pg';

export { app as default } from '../apps/api/src/app.js';
