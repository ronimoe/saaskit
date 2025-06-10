#!/usr/bin/env node

/**
 * Stripe Subscription Plans Setup Script
 * 
 * This script creates the subscription products and prices in your Stripe account
 * programmatically. Run this script once to set up your subscription plans.
 * 
 * Usage:
 *   node scripts/setup-stripe.js
 * 
 * Requirements:
 *   - STRIPE_SECRET_KEY environment variable set in .env.local
 *   - Stripe account access
 */

const Stripe = require('stripe');

// Load environment variables from .env.local if it exists
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Check for required environment variable
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  console.error('   Please add it to your .env.local file');
  process.exit(1);
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

// Subscription plan configurations
const PLANS = {
  STARTER: {
    name: 'Starter',
    description: 'Perfect for getting started',
    price: 999, // $9.99 in cents
    features: [
      'Up to 3 projects',
      'Basic analytics',
      'Email support',
      '5GB storage',
    ],
    metadata: {
      plan_type: 'starter',
      project_limit: '3',
      storage_gb: '5',
      support_type: 'email',
    }
  },
  PRO: {
    name: 'Pro',
    description: 'For growing businesses',
    price: 2999, // $29.99 in cents
    features: [
      'Up to 10 projects',
      'Advanced analytics',
      'Priority support',
      '50GB storage',
      'Team collaboration',
    ],
    metadata: {
      plan_type: 'pro',
      project_limit: '10',
      storage_gb: '50',
      support_type: 'priority',
      team_collaboration: 'true',
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 9999, // $99.99 in cents
    features: [
      'Unlimited projects',
      'Custom analytics',
      '24/7 phone support',
      '500GB storage',
      'Advanced team features',
      'Custom integrations',
    ],
    metadata: {
      plan_type: 'enterprise',
      project_limit: 'unlimited',
      storage_gb: '500',
      support_type: 'phone_24_7',
      team_collaboration: 'true',
      custom_integrations: 'true',
    }
  },
};

async function createProducts() {
  console.log('🚀 Setting up Stripe subscription plans...\n');

  const results = {};

  for (const [planKey, planConfig] of Object.entries(PLANS)) {
    try {
      console.log(`📦 Creating ${planConfig.name} product...`);

      // Create the product
      const product = await stripe.products.create({
        name: planConfig.name,
        description: planConfig.description,
        metadata: {
          ...planConfig.metadata,
          features: planConfig.features.join('|'), // Store features as pipe-separated string
        },
        type: 'service',
      });

      console.log(`✅ Product created: ${product.id}`);

      // Create the price for monthly recurring billing
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: planConfig.price,
        currency: 'usd',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        metadata: planConfig.metadata,
      });

      console.log(`💰 Price created: ${price.id}`);

      results[planKey] = {
        productId: product.id,
        priceId: price.id,
        name: planConfig.name,
        price: planConfig.price,
      };

      console.log(`✅ ${planConfig.name} plan setup complete!\n`);

    } catch (error) {
      console.error(`❌ Error creating ${planConfig.name} plan:`, error.message);
      
      // Check if product already exists
      if (error.code === 'resource_already_exists') {
        console.log(`⚠️  ${planConfig.name} product may already exist. Skipping...\n`);
      } else {
        throw error;
      }
    }
  }

  return results;
}

async function listExistingProducts() {
  console.log('🔍 Checking for existing Stripe products...\n');

  try {
    const products = await stripe.products.list({ limit: 10 });
    const prices = await stripe.prices.list({ limit: 20 });

    if (products.data.length === 0) {
      console.log('No existing products found.\n');
      return { products: [], prices: [] };
    }

    console.log('📋 Existing products:');
    products.data.forEach(product => {
      console.log(`  - ${product.name} (${product.id})`);
    });

    console.log('\n💰 Existing prices:');
    prices.data.forEach(price => {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
      const interval = price.recurring ? `/${price.recurring.interval}` : '';
      console.log(`  - ${price.id}: ${amount}${interval}`);
    });

    console.log('');
    return { products: products.data, prices: prices.data };

  } catch (error) {
    console.error('❌ Error fetching existing products:', error.message);
    throw error;
  }
}

function generateEnvOutput(results) {
  console.log('📝 Environment Variables Configuration:\n');
  console.log('Copy these values to your .env.local file:\n');
  console.log('# Stripe Subscription Plan Price IDs');
  
  for (const [planKey, planData] of Object.entries(results)) {
    console.log(`STRIPE_${planKey}_PRICE_ID=${planData.priceId}`);
  }
  
  console.log('\n');
}

function generateSummary(results) {
  console.log('📊 Stripe Setup Summary:\n');
  
  Object.values(results).forEach(plan => {
    const price = plan.price / 100; // Convert cents to dollars
    console.log(`${plan.name}:`);
    console.log(`  Product ID: ${plan.productId}`);
    console.log(`  Price ID: ${plan.priceId}`);
    console.log(`  Monthly Price: $${price.toFixed(2)}`);
    console.log('');
  });
}

async function main() {
  try {
    console.log('🔑 Using Stripe Secret Key:', process.env.STRIPE_SECRET_KEY.slice(0, 12) + '...\n');

    // List existing products first
    await listExistingProducts();

    // Create the products and prices
    const results = await createProducts();

    // Generate output only if we created products successfully
    if (Object.keys(results).length > 0) {
      generateSummary(results);
      generateEnvOutput(results);
      
      console.log('🎉 Stripe setup completed successfully!');
      console.log('👆 Copy the environment variables above to your .env.local file');
    } else {
      console.log('⚠️  No new products were created. Check for existing products above.');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is correct and has the right permissions');
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createProducts, listExistingProducts }; 