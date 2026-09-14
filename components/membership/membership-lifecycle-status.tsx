'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar,
  Mail
} from 'lucide-react';
import { MembershipStatusValidator, ValidationResult } from '../../lib/services/membership-status-validator';

interface MembershipLifecycleStatusProps {
  customerId: string;
  className?: string;
}

export function MembershipLifecycleStatus({ customerId, className }: MembershipLifecycleStatusProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validator = new MembershipStatusValidator();

  useEffect(() => {
    if (customerId) {
      validateStatus();
    }
  }, [customerId]);

  const validateStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await validator.validateMembershipStatus(customerId);
      setValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate membership');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isValid: boolean) => {
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    switch (status) {
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string, isValid: boolean) => {
    if (isValid) return 'default';
    
    switch (status) {
      case 'expired':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatExpirationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Validating Membership...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Validation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={validateStatus} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Validation
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Membership Data</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Membership Status
        </CardTitle>
        <CardDescription>
          Real-time membership validation and lifecycle information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(validation.status, validation.isValid)}
            <span className="font-medium">
              {validation.isValid ? 'Active Membership' : 'Inactive Membership'}
            </span>
          </div>
          <Badge variant={getStatusColor(validation.status, validation.isValid)}>
            {validation.status.charAt(0).toUpperCase() + validation.status.slice(1)}
          </Badge>
        </div>

        {/* Status Message */}
        {validation.message && (
          <Alert variant={validation.isValid ? 'default' : 'destructive'}>
            <AlertDescription>{validation.message}</AlertDescription>
          </Alert>
        )}

        {/* Expiration Information */}
        {validation.expirationDate && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Expiration Date:</span>
              <span>{formatExpirationDate(validation.expirationDate)}</span>
            </div>
            
            {validation.daysUntilExpiration !== undefined && validation.daysUntilExpiration > 0 && (
              <div className="text-sm text-muted-foreground">
                {validation.daysUntilExpiration} days remaining
              </div>
            )}
          </div>
        )}

        {/* Renewal Warning */}
        {validation.requiresRenewal && validation.isValid && (
          <Alert variant="default" className="border-yellow-200 bg-yellow-50">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Your membership expires soon. Consider renewing to continue enjoying benefits.
            </AlertDescription>
          </Alert>
        )}

        {/* Expired Membership Notice */}
        {!validation.isValid && validation.status === 'expired' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your membership has expired. Renew now to restore your benefits including 15% off eligible supplements and skincare, 10% off water and soil products, and free UAE delivery.
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Benefits:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>10–15% Category Discounts</span>
            </div>
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>Free Delivery</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={validateStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          
          {validation.requiresRenewal && (
            <Button size="sm" asChild>
              <a href="/membership/renew">
                Renew Membership
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}