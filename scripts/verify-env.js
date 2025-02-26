#!/usr/bin/env node

/**
 * This script verifies that all required environment variables are set
 * Run it before deployment to ensure your environment is properly configured
 */

// Skip verification during Vercel build process
if (process.env.VERCEL_ENV) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️ Running in Vercel environment, skipping environment variable verification');
  process.exit(0);
}

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GHL_CLIENT_ID',
  'GHL_CLIENT_SECRET',
  'GHL_REDIRECT_URI',
  'GHL_API_KEY',
  'GHL_AGENCY_API_TOKEN',
  'GHL_API_V1_BASE_URL',
  'GHL_API_V2_BASE_URL'
];

const missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these variables in your .env file or deployment environment.');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables are set!');
  
  // Verify URL format
  const urlVars = ['NEXTAUTH_URL', 'GHL_REDIRECT_URI'];
  const invalidUrls = [];
  
  for (const varName of urlVars) {
    try {
      new URL(process.env[varName]);
    } catch (e) {
      invalidUrls.push(varName);
    }
  }
  
  if (invalidUrls.length > 0) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ The following URLs may be invalid:');
    invalidUrls.forEach(varName => {
      console.warn(`   - ${varName}: ${process.env[varName]}`);
    });
  }
  
  // Check for development URLs in production
  if (process.env.NODE_ENV === 'production') {
    const productionWarnings = [];
    
    if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('localhost')) {
      productionWarnings.push('NEXTAUTH_URL contains "localhost" in production');
    }
    
    if (process.env.GHL_REDIRECT_URI && process.env.GHL_REDIRECT_URI.includes('localhost')) {
      productionWarnings.push('GHL_REDIRECT_URI contains "localhost" in production');
    }
    
    if (productionWarnings.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', '⚠️ Production environment warnings:');
      productionWarnings.forEach(warning => {
        console.warn(`   - ${warning}`);
      });
    }
  }
  
  console.log('\x1b[32m%s\x1b[0m', '✅ Environment verification complete!');
} 