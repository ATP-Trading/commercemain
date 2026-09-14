'use client';

import React from 'react';
import { MembershipError, MembershipErrorCode } from '../../lib/errors/membership-errors';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  AlertTriangle, 
  Wifi, 
  CreditCard, 
  RefreshCw, 
  X,
  Info,
  AlertCircle
} from 'lucide-react';

interface MembershipErrorDisplayProps {
  error: MembershipError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  dismissLabel?: string;
}

export function MembershipErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false,
  dismissLabel = 'Dismiss error'
}: MembershipErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.code) {
      case MembershipErrorCode.NETWORK_ERROR:
      case MembershipErrorCode.SERVICE_UNAVAILABLE:
        return <Wifi className="w-4 h-4" />;
      case MembershipErrorCode.PAYMENT_FAILED:
      case MembershipErrorCode.PAYMENT_REQUIRED:
        return <CreditCard className="w-4 h-4" />;
      case MembershipErrorCode.MEMBERSHIP_EXPIRED:
      case MembershipErrorCode.MEMBERSHIP_NOT_FOUND:
        return <Info className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getErrorVariant = () => {
    switch (error.code) {
      case MembershipErrorCode.MEMBERSHIP_EXPIRED:
      case MembershipErrorCode.MEMBERSHIP_NOT_FOUND:
        return 'default';
      case MembershipErrorCode.PAYMENT_FAILED:
      case MembershipErrorCode.VALIDATION_FAILED:
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  const canRetry = error.shouldRetry() && onRetry;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
        {getErrorIcon()}
        <span>{error.getUserMessage()}</span>
        {canRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 px-2 text-red-600 hover:text-red-700"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            aria-label={dismissLabel}
            className="h-6 px-2 text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert variant={getErrorVariant()} className="relative">
      <div className="flex items-start gap-3">
        {getErrorIcon()}
        <div className="flex-1 min-w-0">
          <AlertDescription className="text-sm">
            {error.getUserMessage()}
          </AlertDescription>
          
          {showDetails && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                <div><strong>Code:</strong> {error.code}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.details.field && (
                  <div><strong>Field:</strong> {error.details.field}</div>
                )}
                {error.details.requestId && (
                  <div><strong>Request ID:</strong> {error.details.requestId}</div>
                )}
              </div>
            </details>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {canRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
            aria-label={dismissLabel}
              className="h-8 w-8 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

interface MembershipErrorListProps {
  errors: MembershipError[];
  onRetry?: (index: number) => void;
  onDismiss?: (index: number) => void;
  onDismissAll?: () => void;
  showDetails?: boolean;
  maxVisible?: number;
}

export function MembershipErrorList({
  errors,
  onRetry,
  onDismiss,
  onDismissAll,
  showDetails = false,
  maxVisible = 3
}: MembershipErrorListProps) {
  if (errors.length === 0) return null;

  const visibleErrors = errors.slice(0, maxVisible);
  const hiddenCount = errors.length - maxVisible;

  return (
    <div className="space-y-2">
      {onDismissAll && errors.length > 1 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismissAll}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss All
          </Button>
        </div>
      )}
      
      {visibleErrors.map((error, index) => (
        <MembershipErrorDisplay
          key={`${error.code}-${index}`}
          error={error}
          onRetry={onRetry ? () => onRetry(index) : undefined}
          onDismiss={onDismiss ? () => onDismiss(index) : undefined}
          showDetails={showDetails}
        />
      ))}
      
      {hiddenCount > 0 && (
        <div className="text-xs text-muted-foreground text-center py-2">
          +{hiddenCount} more error{hiddenCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

interface FieldErrorDisplayProps {
  error: string | null;
  touched?: boolean;
  className?: string;
}

export function FieldErrorDisplay({ 
  error, 
  touched = true, 
  className = '' 
}: FieldErrorDisplayProps) {
  if (!error || !touched) return null;

  return (
    <div className={`flex items-center gap-1 text-sm text-red-600 mt-1 ${className}`}>
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

interface NetworkStatusDisplayProps {
  isOffline: boolean;
  onRetry?: () => void;
}

export function NetworkStatusDisplay({ isOffline, onRetry }: NetworkStatusDisplayProps) {
  if (!isOffline) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <Wifi className="w-4 h-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>You appear to be offline. Some features may be limited.</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface LoadingErrorStateProps {
  isLoading: boolean;
  error: MembershipError | null;
  onRetry?: () => void;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingErrorState({
  isLoading,
  error,
  onRetry,
  loadingText = 'Loading...',
  children
}: LoadingErrorStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <MembershipErrorDisplay
          error={error}
          onRetry={onRetry}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }

  return <>{children}</>;
}