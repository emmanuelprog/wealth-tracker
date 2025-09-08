import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  id?: string;
  user_id?: string;
  event_type: string;
  event_description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export enum AuditEventType {
  // Authentication Events
  USER_SIGN_IN = "USER_SIGN_IN",
  USER_SIGN_UP = "USER_SIGN_UP", 
  USER_SIGN_OUT = "USER_SIGN_OUT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  EMAIL_CHANGE = "EMAIL_CHANGE",
  
  // Profile Events
  PROFILE_UPDATE = "PROFILE_UPDATE",
  PROFILE_DELETE = "PROFILE_DELETE",
  
  // Account Events
  ACCOUNT_CREATE = "ACCOUNT_CREATE",
  ACCOUNT_UPDATE = "ACCOUNT_UPDATE",
  ACCOUNT_DELETE = "ACCOUNT_DELETE",
  
  // Transaction Events
  LARGE_TRANSACTION = "LARGE_TRANSACTION",
  TRANSACTION_CREATE = "TRANSACTION_CREATE",
  TRANSACTION_UPDATE = "TRANSACTION_UPDATE",
  TRANSACTION_DELETE = "TRANSACTION_DELETE",
  
  // Security Events
  FAILED_LOGIN = "FAILED_LOGIN",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  FAILED_PASSWORD_RESET = "FAILED_PASSWORD_RESET",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  
  // Settings Events
  SETTINGS_UPDATE = "SETTINGS_UPDATE"
}

class AuditLogger {
  private getBrowserInfo() {
    return {
      ip_address: "client", // Would be populated by edge function in production
      user_agent: navigator.userAgent
    };
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async logEvent(
    eventType: AuditEventType, 
    description: string, 
    metadata?: Record<string, any>
  ) {
    try {
      const user = await this.getCurrentUser();
      const browserInfo = this.getBrowserInfo();

      const auditEntry: AuditLogEntry = {
        user_id: user?.id,
        event_type: eventType,
        event_description: description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        },
        ...browserInfo
      };

      // Log to console for development
      console.log("[AUDIT]", auditEntry);

      // In production, this would send to audit_logs table
      // For now, we'll store in local storage for demonstration
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      existingLogs.push({
        ...auditEntry,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      });
      
      // Keep only last 100 logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(existingLogs));

    } catch (error) {
      console.error("Failed to log audit event:", error);
    }
  }

  async logAuthEvent(eventType: AuditEventType, email?: string, success: boolean = true) {
    await this.logEvent(
      eventType, 
      `${eventType.replace('_', ' ').toLowerCase()} ${success ? 'successful' : 'failed'}${email ? ` for ${email}` : ''}`,
      { email, success }
    );
  }

  async logProfileEvent(eventType: AuditEventType, changes?: Record<string, any>) {
    await this.logEvent(
      eventType,
      `Profile ${eventType.replace('PROFILE_', '').toLowerCase()}`,
      { changes }
    );
  }

  async logTransactionEvent(eventType: AuditEventType, amount?: number, merchant?: string) {
    const isLargeTransaction = amount && amount > 10000;
    
    await this.logEvent(
      isLargeTransaction ? AuditEventType.LARGE_TRANSACTION : eventType,
      `${eventType.replace('TRANSACTION_', 'Transaction ').toLowerCase()}${merchant ? ` for ${merchant}` : ''}${amount ? ` (${amount})` : ''}`,
      { amount, merchant, flagged_as_large: isLargeTransaction }
    );
  }

  async logSecurityEvent(eventType: AuditEventType, details: string, metadata?: Record<string, any>) {
    await this.logEvent(
      eventType,
      `Security event: ${details}`,
      { ...metadata, severity: "high" }
    );
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    try {
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      return logs.slice(-limit).reverse(); // Most recent first
    } catch (error) {
      console.error("Failed to retrieve audit logs:", error);
      return [];
    }
  }
}

export const auditLogger = new AuditLogger();
