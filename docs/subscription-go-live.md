# Subscription System Go-Live Checklist

This document provides a comprehensive checklist for preparing your subscription system for production deployment. Follow these steps to ensure a smooth transition from development to a live environment.

## Table of Contents
1. [Pre-Launch Preparation](#pre-launch-preparation)
2. [Stripe Configuration](#stripe-configuration)
3. [Database Preparation](#database-preparation)
4. [Environment Variables](#environment-variables)
5. [Testing Before Launch](#testing-before-launch)
6. [Launch Process](#launch-process)
7. [Post-Launch Monitoring](#post-launch-monitoring)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Pre-Launch Preparation

### Business Decisions
- [ ] Finalize subscription plan pricing and features
- [ ] Determine trial period length (if applicable)
- [ ] Define cancellation, refund, and proration policies
- [ ] Determine tax handling approach
- [ ] Create terms of service and privacy policy documents
- [ ] Decide on payment methods to accept (credit cards, ACH, etc.)
- [ ] Set up customer support channels for payment questions

### Legal Requirements
- [ ] Review compliance requirements for your target markets (GDPR, CCPA, etc.)
- [ ] Ensure terms of service include subscription terms
- [ ] Add cookie/tracking notices if using analytics
- [ ] Prepare invoice templates with required legal information
- [ ] Check payment processor requirements for your business type

## Stripe Configuration

### Move from Test to Production
- [ ] Create or access your production Stripe account
- [ ] Update Stripe API keys in your environment to production keys
- [ ] Configure production webhook endpoints (different from test)
- [ ] Set up production Stripe Customer Portal configuration

### Product & Plan Setup
- [ ] Create production subscription products and prices
- [ ] Add critical metadata to all products:
  ```
  plan: starter|pro|enterprise
  ```
- [ ] Ensure product names match your application plan names
- [ ] Configure tax settings if applicable
- [ ] Set up payment method requirements

### Critical Webhook Configuration
- [ ] Set up production webhook endpoint in Stripe Dashboard
  - URL: `https://yourdomain.com/api/stripe/webhook`
- [ ] Enable these webhook events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copy the webhook signing secret to your production environment
- [ ] Test webhook delivery with Stripe dashboard tools

### Customer Portal Setup
- [ ] Configure the Customer Portal in production Stripe Dashboard
- [ ] Set business information, branding, and return URL
- [ ] Configure which products can be switched between
- [ ] Set proper cancellation options
- [ ] Test portal access through your application

## Database Preparation

### Schema Verification
- [ ] Verify all required tables exist in production:
  - `profiles` with `stripe_customer_id` column
  - `stripe_customers` table for customer mapping
  - `subscriptions` table for subscription data
- [ ] Ensure all Row Level Security (RLS) policies are applied
- [ ] Verify database functions for customer creation are deployed

### Production Database Migrations
- [ ] Back up production database before migrations
- [ ] Apply all subscription-related migrations
- [ ] Validate constraint setup, especially:
  ```sql
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start)
  ```
- [ ] Verify indexes on frequently queried columns

## Environment Variables

### Production Configuration
- [ ] Update all Stripe-related environment variables:
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] Update subscription plan price IDs:
  ```
  STRIPE_STARTER_PRICE_ID=price_live_...
  STRIPE_PRO_PRICE_ID=price_live_...
  STRIPE_ENTERPRISE_PRICE_ID=price_live_...
  ```
- [ ] Ensure `NEXT_PUBLIC_APP_URL` points to production URL
- [ ] Verify Supabase production credentials are set
- [ ] Set `NODE_ENV=production` for production environment

### Validation
- [ ] Validate environment configuration on production
- [ ] Check feature flags and ensure subscriptions are enabled:
  ```
  NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=true
  ```
- [ ] Verify no test credentials are used in production

## Testing Before Launch

### Manual Testing Scenarios
- [ ] Complete new subscription checkout flow
- [ ] Test subscription management through Customer Portal
- [ ] Verify plan switching (upgrade/downgrade)
- [ ] Test cancellation flow and confirm database updates
- [ ] Verify subscription renewal process
- [ ] Test guest checkout and account linking
- [ ] Verify webhook processing by monitoring logs

### Edge Cases to Test
- [ ] Test with various payment methods
- [ ] Try subscription actions with different user roles
- [ ] Test expired card handling
- [ ] Verify past-due subscription handling
- [ ] Test behavior when webhooks are delayed
- [ ] Verify proper error handling for declined payments
- [ ] Test manual sync button functionality

### Performance and Load Testing
- [ ] Test concurrent subscription creations
- [ ] Verify webhook handler performance
- [ ] Check database query performance under load
- [ ] Test customer data lookup performance

## Launch Process

### Staged Rollout
- [ ] Consider a staged rollout to a subset of users
- [ ] Monitor initial subscriptions closely
- [ ] Have a rollback plan ready

### Go-Live Sequence
1. [ ] Deploy application to production
2. [ ] Verify webhook endpoints are receiving events
3. [ ] Create a test subscription to validate end-to-end flow
4. [ ] Enable public access to subscription features
5. [ ] Announce launch to users

### Marketing and Communications
- [ ] Update pricing page on your website
- [ ] Prepare and send announcement emails
- [ ] Update documentation for users
- [ ] Brief customer support team on subscription details

## Post-Launch Monitoring

### Key Metrics to Track
- [ ] Subscription conversion rate
- [ ] Webhook delivery success rate
- [ ] Failed payment rate
- [ ] Customer support tickets related to payments
- [ ] Database performance metrics
- [ ] API response times for subscription endpoints

### Monitoring Tools
- [ ] Set up Stripe Dashboard notifications
- [ ] Configure alerts for webhook failures
- [ ] Monitor database errors related to subscriptions
- [ ] Track Stripe API rate limits and usage

### Regular Audits
- [ ] Daily: Check webhook delivery status
- [ ] Weekly: Review error logs and failed payments
- [ ] Monthly: Analyze subscription analytics
- [ ] Quarterly: Review pricing and plan structure

## Troubleshooting Common Issues

### Subscription Updates Not Reflecting
If subscription changes in Stripe don't appear in your application:

1. Verify webhook delivery in Stripe Dashboard
2. Check webhook logs for processing errors
3. Use the "Sync with Stripe" button on the billing page
4. Confirm product metadata is correctly set

### Failed Webhook Deliveries
If webhooks aren't being received:

1. Verify webhook URL is correct and accessible
2. Check webhook signing secret is correct
3. Ensure all required events are selected
4. Monitor server logs for webhook verification errors

### Customer Portal Issues
If customers have problems with the portal:

1. Verify portal configuration in Stripe Dashboard
2. Check return URL is correctly set
3. Ensure all products are available for switching
4. Confirm webhook events for subscription updates are enabled

### Database Inconsistencies
If database doesn't match Stripe data:

1. Use the "Sync with Stripe" feature for affected users
2. Check for database constraint violations
3. Verify webhook handler is processing events correctly
4. Review transaction handling in database operations

---

By following this checklist, you'll ensure your subscription system is properly configured and ready for production use. Remember to regularly monitor your system after launch and address any issues promptly.

For more detailed information on specific components, refer to:
- [Subscription Management](./subscription.md)
- [Stripe Setup Guide](./stripe-setup.md)
- [Database Schema](./database-schema.md) 