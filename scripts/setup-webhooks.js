#!/usr/bin/env node

/**
 * Stripe Webhook Setup Script
 * 
 * This script helps set up Stripe webhooks for local development.
 * It provides instructions and automates some setup steps.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔌 Stripe Webhook Setup Script');
console.log('==============================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local not found. Please create it first by copying from .env.example');
  process.exit(1);
}

// Read current .env.local
const envContent = fs.readFileSync(envPath, 'utf8');

// Check if Stripe CLI is installed
try {
  execSync('stripe --version', { stdio: 'ignore' });
  console.log('✅ Stripe CLI is installed');
} catch (error) {
  console.log('❌ Stripe CLI not found. Please install it first:');
  console.log('   https://stripe.com/docs/stripe-cli#install\n');
  console.log('   On macOS: brew install stripe/stripe-cli/stripe');
  console.log('   On Windows: scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git');
  console.log('   On Windows: scoop install stripe');
  process.exit(1);
}

// Check if logged in to Stripe CLI
try {
  execSync('stripe config --list', { stdio: 'ignore' });
  console.log('✅ Stripe CLI is authenticated');
} catch (error) {
  console.log('❌ Please login to Stripe CLI first:');
  console.log('   stripe login');
  process.exit(1);
}

console.log('\n📝 Webhook Configuration Instructions:');
console.log('=====================================\n');

console.log('For LOCAL DEVELOPMENT:');
console.log('1. Run this command in a separate terminal:');
console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhook\n');

console.log('2. Copy the webhook signing secret from the CLI output');
console.log('   It will look like: whsec_1234567890abcdef...\n');

console.log('3. Add it to your .env.local file:');
console.log('   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here\n');

// Check if webhook secret is already configured
if (envContent.includes('STRIPE_WEBHOOK_SECRET=') && !envContent.includes('STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here')) {
  console.log('✅ Webhook secret appears to be configured in .env.local');
} else {
  console.log('⚠️  Webhook secret not found in .env.local - you\'ll need to add it');
}

console.log('\nFor PRODUCTION:');
console.log('1. Go to Stripe Dashboard > Webhooks: https://dashboard.stripe.com/webhooks');
console.log('2. Click "Add endpoint"');
console.log('3. Set endpoint URL to: https://yourdomain.com/api/stripe/webhook');
console.log('4. Select these events:');

const events = [
  'customer.subscription.created',
  'customer.subscription.updated', 
  'customer.subscription.deleted',
  'checkout.session.completed',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
];

events.forEach(event => {
  console.log(`   ✓ ${event}`);
});

console.log('\n5. Copy the webhook signing secret to your production environment variables\n');

console.log('🧪 Testing Webhooks:');
console.log('==================\n');

console.log('Once webhooks are configured, you can test them:');
console.log('1. Start your development server: npm run dev');
console.log('2. In another terminal, trigger test events:');
console.log('   stripe trigger customer.subscription.created');
console.log('   stripe trigger checkout.session.completed');
console.log('   stripe trigger invoice.payment_succeeded\n');

console.log('📊 Webhook Events Handled:');
console.log('=========================\n');

const eventDescriptions = {
  'customer.subscription.created': 'When a new subscription is created',
  'customer.subscription.updated': 'When subscription details change (plan, status, etc.)',
  'customer.subscription.deleted': 'When a subscription is cancelled',
  'checkout.session.completed': 'When a checkout session completes successfully',
  'invoice.payment_succeeded': 'When a subscription payment succeeds',
  'invoice.payment_failed': 'When a subscription payment fails'
};

Object.entries(eventDescriptions).forEach(([event, description]) => {
  console.log(`• ${event}`);
  console.log(`  ${description}\n`);
});

console.log('📁 Webhook Endpoint:');
console.log('===================\n');
console.log('Your webhook endpoint is located at:');
console.log('app/api/stripe/webhook/route.ts\n');

console.log('This endpoint:');
console.log('• Verifies webhook signatures for security');
console.log('• Processes subscription and payment events');
console.log('• Syncs data between Stripe and your Supabase database');
console.log('• Handles errors gracefully and logs events\n');

console.log('🎉 Setup Complete!');
console.log('=================\n');
console.log('Your webhook infrastructure is ready. Follow the instructions above');
console.log('to configure webhooks for your environment.\n');

console.log('Need help? Check out:');
console.log('• docs/stripe-setup.md for detailed documentation');
console.log('• https://stripe.com/docs/webhooks for Stripe webhook docs');
console.log('• Your webhook endpoint at /api/stripe/webhook for implementation details\n'); 