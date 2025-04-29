#!/bin/bash

# Tell node-postgres to skip native bindings
export NODE_PG_FORCE_NATIVE=0

# Install dependencies
npm install

# Build the frontend
npm run build

# Install serverless-http for Netlify functions
npm install --no-save serverless-http

# Install express and other needed dependencies for functions
npm install --no-save express cors pg connect-pg-simple express-session bcryptjs

# Build the functions
mkdir -p netlify/functions-dist
npx esbuild netlify/functions/api.js --bundle --platform=node --target=node16 --outdir=./netlify/functions-dist

# Copy the compiled functions to the Netlify functions folder
cp -r netlify/functions-dist/* netlify/functions/

echo "Build completed successfully!"