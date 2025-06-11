# Subscription System Monitoring & Maintenance

This guide covers best practices for monitoring and maintaining your subscription system after it has gone live. Ongoing monitoring is critical to ensure revenue integrity, customer satisfaction, and system stability.

## Table of Contents
1. [Monitoring Fundamentals](#monitoring-fundamentals)
2. [Critical Metrics to Track](#critical-metrics-to-track)
3. [Alerts and Notifications](#alerts-and-notifications)
4. [Regular Maintenance Tasks](#regular-maintenance-tasks)
5. [Data Reconciliation](#data-reconciliation)
6. [Customer Support Workflows](#customer-support-workflows)
7. [Security Monitoring](#security-monitoring)
8. [Performance Tuning](#performance-tuning)
9. [Scaling Considerations](#scaling-considerations)

## Monitoring Fundamentals

### Monitoring Layers

A complete monitoring strategy should cover multiple layers:

1. **Business Metrics**: Subscription conversion, churn, MRR/ARR
2. **Customer Experience**: Checkout completion rates, support tickets
3. **System Health**: API performance, database loads, error rates
4. **Integration Health**: Webhook delivery, Stripe API status
5. **Security**: Access patterns, authentication failures

### Key Principles

- **Proactive over Reactive**: Detect issues before customers do
- **End-to-End Visibility**: Monitor the entire subscription flow
- **Actionable Alerts**: Only alert on issues that require human intervention
- **Trend Analysis**: Track metrics over time to identify gradual degradation
- **Regular Audits**: Scheduled reviews of system health and data consistency

## Critical Metrics to Track

### Business Health Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| MRR (Monthly Recurring Revenue) | Total monthly subscription revenue | Growing month-over-month | Decline >5% |
| Churn Rate | % of customers canceling | <5% monthly | >8% monthly |
| Conversion Rate | % of visitors who subscribe | >3% | <1% |
| ARPU (Average Revenue Per User) | MRR / Total customers | Stable or growing | Decline >10% |
| Trial Conversion | % of trials converting to paid | >25% | <15% |

### System Health Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Checkout Success Rate | % of initiated checkouts completed | >80% | <60% |
| Webhook Processing Rate | % of webhooks processed successfully | >99% | <95% |
| API Response Time | Time to complete subscription API calls | <500ms | >2000ms |
| Error Rate | % of subscription operations failing | <0.5% | >2% |
| Database Query Time | Time for subscription-related queries | <100ms | >500ms |

### Integration Health Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Stripe API Success Rate | % of successful Stripe API calls | >99.9% | <99% |
| Webhook Delivery Time | Time from event to webhook processing | <30s | >5min |
| Data Consistency | % of subscriptions matching between Stripe/DB | 100% | <98% |
| Failed Payments | % of subscription payments failing | <3% | >7% |
| Recovery Rate | % of failed payments recovered | >60% | <40% |

## Alerts and Notifications

### Critical Alerts (Immediate Action)

Configure immediate alerts for these critical issues:

- **Webhook Failures**: Consistent webhook delivery failures
- **Payment Failures**: Unusual spike in failed payments
- **Database Errors**: Errors in subscription table operations
- **API Downtime**: Stripe API or your subscription endpoints down
- **Security Incidents**: Unusual access patterns or breach attempts

### Warning Alerts (Monitor Closely)

Set up warning-level alerts for these conditions:

- **Increasing Churn**: Churn rate above normal for 3+ days
- **Declining Conversion**: Conversion rate below target for 7+ days
- **Performance Degradation**: Consistently slower API response times
- **Webhook Delays**: Webhooks consistently taking >2min to process
- **Sync Issues**: Data inconsistency between Stripe and database

### Monitoring Dashboard

Create a dashboard with these key views:

1. **Executive View**: MRR, churn, growth rate, customer count
2. **Operations View**: System health, error rates, webhook status
3. **Customer Support View**: Failed payments, subscription status changes
4. **Developer View**: API performance, database metrics, error logs

## Regular Maintenance Tasks

### Daily Tasks

- [ ] Review critical error logs
- [ ] Check webhook delivery status
- [ ] Monitor failed payment notifications
- [ ] Verify API response times are within normal range

### Weekly Tasks

- [ ] Analyze subscription conversion and churn metrics
- [ ] Review customer support tickets related to payments
- [ ] Check for database performance issues
- [ ] Verify data consistency between Stripe and your database
- [ ] Monitor resource usage (database connections, API rate limits)

### Monthly Tasks

- [ ] Perform full data reconciliation between Stripe and database
- [ ] Review and optimize database queries
- [ ] Analyze customer lifecycle and upgrade patterns
- [ ] Check for unused/inactive subscriptions
- [ ] Verify tax and compliance settings are up to date

### Quarterly Tasks

- [ ] Security audit of subscription system
- [ ] Performance optimization review
- [ ] Analyze pricing effectiveness and consider adjustments
- [ ] Review and update subscription feature allocation
- [ ] Evaluate customer feedback for subscription improvements

## Data Reconciliation

Regular reconciliation between Stripe and your database is essential to maintain data integrity.

### Automated Reconciliation

Implement an automated reconciliation script that:

1. Fetches all subscriptions from Stripe
2. Compares with your database records
3. Identifies discrepancies (missing records, status mismatches)
4. Logs issues for review
5. Automatically corrects clear mismatches

```typescript
// Example reconciliation logic (pseudocode)
async function reconcileSubscriptions() {
  // Get all subscriptions from Stripe
  const stripeSubscriptions = await stripe.subscriptions.list({ limit: 100 });
  
  // Process each subscription
  for (const subscription of stripeSubscriptions.data) {
    // Check if subscription exists in database
    const dbSubscription = await getSubscriptionByStripeId(subscription.id);
    
    if (!dbSubscription) {
      // Missing in database - create record
      await createSubscriptionRecord(subscription);
      logDiscrepancy('missing_in_db', subscription.id);
    } else if (dbSubscription.status !== subscription.status) {
      // Status mismatch - update database
      await updateSubscriptionStatus(subscription.id, subscription.status);
      logDiscrepancy('status_mismatch', subscription.id);
    } else if (dbSubscription.plan_id !== getPlanFromStripe(subscription)) {
      // Plan mismatch - update plan
      await updateSubscriptionPlan(subscription.id, getPlanFromStripe(subscription));
      logDiscrepancy('plan_mismatch', subscription.id);
    }
    // Check other important fields...
  }
  
  // Optional: Check for subscriptions in DB not in Stripe
  // (requires pagination through all Stripe subscriptions first)
}
```

### Manual Audit Process

Perform manual audits quarterly:

1. Export subscription data from both systems
2. Compare total counts, revenue amounts, and plan distributions
3. Identify statistical anomalies
4. Investigate specific customer accounts with discrepancies
5. Document reconciliation findings

## Customer Support Workflows

### Common Support Scenarios

Prepare workflows for these common subscription support scenarios:

#### 1. Subscription Not Showing After Payment

**Customer Report**: "I paid for a subscription but don't see it in my account"

**Investigation Steps**:
1. Verify payment in Stripe Dashboard
2. Check webhook delivery for `checkout.session.completed`
3. Look for errors in webhook processing logs
4. Check customer ID mapping in database

**Resolution Options**:
- Use Sync button on billing page
- Manually trigger webhook event processing
- Create/update subscription record if payment confirmed

#### 2. Incorrect Plan Access

**Customer Report**: "I upgraded to Pro but still see Starter features"

**Investigation Steps**:
1. Check subscription status in Stripe
2. Verify plan ID in your database
3. Check feature access logic
4. Look for plan update webhooks

**Resolution Options**:
- Use Sync button to update plan
- Clear user session cache
- Manually update plan in database if needed

#### 3. Failed Payment Handling

**Customer Report**: "My card was charged but subscription shows as past_due"

**Investigation Steps**:
1. Check payment status in Stripe
2. Look for `invoice.payment_succeeded` webhook
3. Verify subscription status in database
4. Check for error logs

**Resolution Options**:
- Manually update subscription status
- Trigger payment success flow
- Issue refund if double-charged

### Support Tools

Provide support team with these tools:

1. **Customer Subscription Lookup**: Search by email, customer ID
2. **Subscription Status History**: View all status changes
3. **Manual Sync Button**: Force sync with Stripe
4. **Payment Timeline**: View all payment attempts
5. **Session Info**: View user's current session data

## Security Monitoring

### Critical Security Areas

Monitor these areas for potential security issues:

1. **Authentication**: Watch for unusual login patterns
2. **API Access**: Monitor for excessive API calls to subscription endpoints
3. **Customer Data**: Track access to payment and subscription information
4. **Webhooks**: Verify webhook signature validation
5. **Privilege Escalation**: Monitor for unauthorized plan changes

### Security Best Practices

- Regularly rotate webhook secrets
- Use the principle of least privilege for database access
- Log all subscription status changes with user context
- Implement rate limiting on subscription endpoints
- Monitor for unusual subscription creation/cancellation patterns

## Performance Tuning

### Common Performance Bottlenecks

Watch for these performance issues:

1. **Webhook Processing**: Slow handling of high-volume events
2. **Database Queries**: Inefficient joins or missing indexes
3. **Stripe API Rate Limits**: Hitting limits during busy periods
4. **Customer Lookup**: Slow customer/subscription lookups
5. **Checkout Flow**: Slow redirect or confirmation steps

### Optimization Strategies

```typescript
// Example: Optimize subscription lookup with caching
const subscriptionCache = new Map();

async function getSubscriptionWithCache(userId) {
  const cacheKey = `sub_${userId}`;
  
  // Check cache first
  if (subscriptionCache.has(cacheKey)) {
    const cached = subscriptionCache.get(cacheKey);
    // Return cache if fresh (less than 5 minutes old)
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }
  }
  
  // Cache miss or stale - get from database
  const subscription = await getSubscriptionFromDb(userId);
  
  // Cache result
  subscriptionCache.set(cacheKey, {
    data: subscription,
    timestamp: Date.now()
  });
  
  return subscription;
}
```

### Database Optimizations

- Add indexes for frequently queried columns:
  ```sql
  CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
  CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
  CREATE INDEX idx_subscriptions_status ON subscriptions(status);
  ```

- Optimize join queries:
  ```sql
  -- Efficient query with proper joins
  SELECT s.*, p.email, p.full_name
  FROM subscriptions s
  INNER JOIN profiles p ON s.user_id = p.user_id
  WHERE s.status = 'active'
  ORDER BY s.current_period_end
  LIMIT 100;
  ```

## Scaling Considerations

### Handling Growth

Prepare for scaling your subscription system:

1. **Webhook Processing**: Move to queue-based processing for high volume
2. **Database Partitioning**: Consider partitioning subscription data for large user bases
3. **Read Replicas**: Use read replicas for subscription reporting queries
4. **Caching Layer**: Implement caching for subscription status and features
5. **Microservices**: Consider breaking out subscription logic into dedicated service

### Internationalization

Prepare for international expansion:

1. **Multi-Currency Support**: Configure plans in multiple currencies
2. **Tax Handling**: Integrate with tax calculation services
3. **Payment Methods**: Add region-specific payment methods
4. **Localization**: Translate checkout and subscription UI
5. **Compliance**: Research regional payment regulations

---

By implementing these monitoring and maintenance practices, you'll ensure your subscription system remains reliable, performant, and scalable as your business grows.

For additional information, refer to these resources:
- [Subscription Management](./subscription.md)
- [Stripe Setup Guide](./stripe-setup.md)
- [Subscription Go-Live Checklist](./subscription-go-live.md) 