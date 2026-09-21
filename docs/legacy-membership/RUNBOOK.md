# ATP Membership System Operations Runbook

This runbook provides step-by-step procedures for operating and maintaining the ATP membership system.

## System Overview

The ATP membership system provides:
- Annual membership subscriptions (99 AED)
- 15% discount on premium services
- Free delivery on all products
- Automated lifecycle management
- Real-time monitoring and alerting

## Daily Operations

### Morning Health Check (5 minutes)

1. **Check System Health**
   ```bash
   curl https://your-domain.com/api/monitoring/membership/health
   ```
   
   Expected: `"status": "healthy"`

2. **Review Overnight Alerts**
   - Check admin dashboard for new alerts
   - Review error logs for critical issues
   - Verify webhook processing status

3. **Validate Key Metrics**
   - Active memberships count
   - New signups from previous day
   - Revenue tracking accuracy
   - Webhook success rate

### Weekly Operations (30 minutes)

1. **Membership Analytics Review**
   - Login to admin dashboard
   - Review weekly signup trends
   - Analyze cancellation patterns
   - Check revenue vs. targets

2. **System Performance Check**
   - Review API response times
   - Check Shopify API usage limits
   - Validate cache performance
   - Monitor database query performance

3. **Data Integrity Validation**
   - Spot-check membership records
   - Verify discount calculations
   - Confirm webhook data sync
   - Test renewal notifications

## Incident Response Procedures

### High Priority Incidents

#### P1: Membership System Down
**Symptoms**: Health check returns critical status, no new memberships processing

**Immediate Actions (5 minutes)**:
1. Check system status dashboard
2. Verify application deployment status
3. Check Shopify API connectivity
4. Review recent deployment logs

**Investigation Steps**:
```bash
# Check application logs
vercel logs --follow

# Test webhook endpoints
curl -X POST https://your-domain.com/api/webhooks/shopify/orders/paid \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verify Shopify API access
curl -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_ACCESS_TOKEN" \
  https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-01/customers.json
```

**Resolution Steps**:
1. If deployment issue: Rollback to last known good version
2. If API issue: Check Shopify status and credentials
3. If database issue: Restart services and check connections
4. If webhook issue: Re-register webhooks

#### P1: Payment Processing Failures
**Symptoms**: Members reporting payment failures, no new memberships created

**Immediate Actions**:
1. Check Shopify checkout functionality
2. Verify webhook processing for orders/paid
3. Review payment gateway status
4. Check for API rate limiting

**Investigation**:
```bash
# Check recent order webhooks
grep "Processing membership purchase" /var/log/app.log

# Verify Shopify order status
curl -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_ACCESS_TOKEN" \
  https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-01/orders.json?status=any&limit=10
```

### Medium Priority Incidents

#### P2: Discount Not Applied
**Symptoms**: Members reporting missing 15% discount

**Investigation Steps**:
1. Check membership status for affected customer
2. Verify cart middleware functionality
3. Test discount calculation logic
4. Review recent code changes

**Resolution**:
```bash
# Test discount calculation
npm run test:membership:discounts

# Check customer membership status
curl https://your-domain.com/api/membership/customer/{customerId}/status

# Manually apply discount if needed
curl -X POST https://your-domain.com/api/membership/customer/{customerId}/apply-discount
```

#### P2: Webhook Processing Delays
**Symptoms**: Delayed membership activation, webhook failure alerts

**Investigation**:
1. Check webhook queue status
2. Review Shopify webhook delivery attempts
3. Verify webhook endpoint response times
4. Check for rate limiting issues

**Resolution**:
```bash
# Check webhook processing logs
grep "webhook" /var/log/app.log | tail -100

# Manually process failed webhooks
curl -X POST https://your-domain.com/api/webhooks/retry \
  -H "Content-Type: application/json" \
  -d '{"webhookId": "webhook_id_here"}'
```

### Low Priority Incidents

#### P3: Monitoring Alerts
**Symptoms**: Warning alerts in monitoring dashboard

**Standard Response**:
1. Review alert details and trends
2. Check if issue is recurring
3. Update monitoring thresholds if needed
4. Document patterns for future reference

## Maintenance Procedures

### Monthly Maintenance

#### Membership Data Cleanup (15 minutes)
```bash
# Clean up expired sessions
npm run cleanup:expired-sessions

# Archive old membership records
npm run archive:old-memberships

# Update membership statistics
npm run update:membership-stats
```

#### Performance Optimization (20 minutes)
```bash
# Analyze slow queries
npm run analyze:performance

# Update cache configurations
npm run optimize:cache

# Review and update API rate limits
npm run review:rate-limits
```

### Quarterly Maintenance

#### System Updates (60 minutes)
1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   npm run test:full
   ```

2. **Shopify API Version Update**
   - Review Shopify API changelog
   - Update API version in configuration
   - Test all integrations
   - Deploy with monitoring

3. **Security Review**
   - Review access tokens and permissions
   - Update webhook secrets
   - Audit user access levels
   - Check for security vulnerabilities

## Monitoring and Alerting

### Key Metrics Dashboard

Access the admin dashboard to monitor:

**Business Metrics**:
- Active memberships: Target >1000
- Monthly signups: Target >100
- Renewal rate: Target >80%
- Cancellation rate: Target <5%
- Average revenue per member: Target 99 AED

**Technical Metrics**:
- API response time: Target <500ms
- Webhook success rate: Target >99%
- Error rate: Target <1%
- Uptime: Target >99.9%

### Alert Thresholds

**Critical Alerts** (Immediate Response):
- System health status: critical
- API error rate: >5% in 5 minutes
- Webhook failure rate: >10% in 5 minutes
- Payment processing failures: >3 in 5 minutes

**Warning Alerts** (Response within 1 hour):
- High cancellation rate: >10% daily
- API response time: >1000ms average
- Webhook delays: >5 minutes
- Low signup rate: <5 daily

**Info Alerts** (Review during business hours):
- Membership milestones reached
- Unusual usage patterns
- Performance improvements available

### Log Analysis

#### Important Log Patterns

**Success Patterns**:
```
✅ Membership created for customer {customerId}
✅ Discount applied: {amount} AED saved
✅ Webhook processed successfully: {webhookType}
```

**Warning Patterns**:
```
⚠️ Membership Warning: High cancellation rate
⚠️ API rate limit approaching: {percentage}%
⚠️ Webhook retry attempt: {attempt}/3
```

**Error Patterns**:
```
❌ Membership Alert: {error_message}
❌ Webhook processing failed: {error}
❌ API error: {endpoint} returned {status_code}
```

#### Log Analysis Commands
```bash
# Check error rate in last hour
grep "❌" /var/log/app.log | grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" | wc -l

# Find most common errors
grep "❌" /var/log/app.log | cut -d':' -f2 | sort | uniq -c | sort -nr | head -10

# Check webhook processing times
grep "webhook.*processed" /var/log/app.log | grep "$(date '+%Y-%m-%d')"
```

## Backup and Recovery

### Data Backup Procedures

**Daily Automated Backups**:
- Membership data exported to secure storage
- Configuration files backed up
- Database snapshots created

**Manual Backup** (when needed):
```bash
# Export membership data
npm run export:membership-data --output=backup-$(date +%Y%m%d).json

# Backup configuration
cp .env.production .env.backup-$(date +%Y%m%d)

# Create system snapshot
npm run create:system-snapshot
```

### Recovery Procedures

#### Data Recovery
```bash
# Restore membership data
npm run import:membership-data --input=backup-20240101.json

# Verify data integrity
npm run verify:membership-data

# Sync with Shopify
npm run sync:shopify-data
```

#### System Recovery
```bash
# Restore from snapshot
npm run restore:system-snapshot --snapshot=snapshot-20240101

# Verify system health
npm run health:check

# Re-register webhooks if needed
npm run setup:shopify:webhooks
```

## Escalation Procedures

### Internal Escalation

**Level 1**: Operations Team
- Initial incident response
- Basic troubleshooting
- System monitoring

**Level 2**: Development Team
- Code-related issues
- Integration problems
- Performance optimization

**Level 3**: Architecture Team
- System design issues
- Major outages
- Security incidents

### External Escalation

**Shopify Support**:
- API issues beyond rate limits
- Webhook delivery problems
- Platform-wide outages

**Infrastructure Provider**:
- Hosting platform issues
- Network connectivity problems
- DNS resolution issues

### Emergency Contacts

```
Operations Team: +971-XX-XXX-XXXX
Development Team: +971-XX-XXX-XXXX
Architecture Team: +971-XX-XXX-XXXX
Business Stakeholders: +971-XX-XXX-XXXX
```

## Performance Tuning

### Optimization Checklist

**Weekly Performance Review**:
- [ ] Check API response times
- [ ] Review cache hit rates
- [ ] Analyze database query performance
- [ ] Monitor memory usage
- [ ] Check CDN performance

**Monthly Optimization**:
- [ ] Update cache strategies
- [ ] Optimize database indexes
- [ ] Review and update API rate limits
- [ ] Analyze and optimize slow endpoints
- [ ] Update performance monitoring thresholds

### Common Performance Issues

**Slow API Responses**:
1. Check Shopify API rate limits
2. Review cache configuration
3. Optimize database queries
4. Consider request batching

**High Memory Usage**:
1. Check for memory leaks
2. Review cache size limits
3. Optimize data structures
4. Consider garbage collection tuning

**Database Performance**:
1. Analyze slow queries
2. Update database indexes
3. Consider query optimization
4. Review connection pooling

## Security Procedures

### Security Monitoring

**Daily Security Checks**:
- Review access logs for anomalies
- Check for failed authentication attempts
- Monitor API usage patterns
- Verify webhook signature validation

**Weekly Security Review**:
- Review user access permissions
- Check for security updates
- Analyze security alerts
- Update security monitoring rules

### Incident Response

**Security Incident Procedure**:
1. **Immediate Response** (5 minutes)
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Investigation** (30 minutes)
   - Analyze logs and evidence
   - Determine scope of incident
   - Identify root cause

3. **Containment** (60 minutes)
   - Implement security patches
   - Update access controls
   - Monitor for continued threats

4. **Recovery** (Variable)
   - Restore affected services
   - Verify system integrity
   - Update security measures

### Security Contacts

```
Security Team: security@your-domain.com
Incident Response: incident@your-domain.com
Emergency Security: +971-XX-XXX-XXXX
```

---

## Quick Reference

### Emergency Commands
```bash
# System health check
curl https://your-domain.com/api/monitoring/membership/health

# Restart services
vercel --prod

# Check recent logs
vercel logs --follow

# Test webhook endpoints
npm run test:webhooks

# Validate membership data
npm run validate:membership-data
```

### Important URLs
- Admin Dashboard: `/admin/membership`
- Health Monitoring: `/api/monitoring/membership/health`
- System Logs: Vercel Dashboard
- Shopify Admin: `https://{store}.myshopify.com/admin`

### Support Information
- Documentation: `/docs`
- API Reference: `/api-docs`
- Status Page: `/status`
- Contact Support: support@your-domain.com