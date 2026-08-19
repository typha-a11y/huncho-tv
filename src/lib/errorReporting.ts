import React from 'react';

export interface ErrorReportMetadata {
  componentStack?: string;
  [key: string]: unknown;
}

/**
 * Pluggable Error Reporting Stub (Ready for Sentry / Telemetry SDK integration)
 */
export function reportError(error: unknown, info?: ErrorReportMetadata): void {
  const errObj = error instanceof Error ? error : new Error(String(error));
  
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    console.error('[HUNCHO TV ERROR MONITOR]:', errObj, info);
  } else {
    // Production stub: Ready to plug in Sentry.captureException(errObj, { extra: info })
    console.error('[PRODUCTION ERROR LOGGED]:', errObj.message, info?.componentStack);
  }
}
