import { auditLogger, AuditEventType } from "./audit";

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  blockDurationMs: number; // How long to block after limit exceeded
}

export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private blockedUntil: Map<string, number> = new Map();

  constructor(private config: RateLimitConfig) {}

  private getKey(identifier: string, action: string): string {
    return `${identifier}:${action}`;
  }

  async checkLimit(identifier: string, action: string): Promise<boolean> {
    const key = this.getKey(identifier, action);
    const now = Date.now();

    // Check if currently blocked
    const blockedUntil = this.blockedUntil.get(key);
    if (blockedUntil && now < blockedUntil) {
      await auditLogger.logSecurityEvent(
        AuditEventType.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded for ${action} by ${identifier}`,
        { identifier, action, blockedUntil: new Date(blockedUntil) }
      );
      return false;
    }

    // Clean expired attempts
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(
      timestamp => now - timestamp < this.config.windowMs
    );

    // Check if limit exceeded
    if (validAttempts.length >= this.config.maxAttempts) {
      this.blockedUntil.set(key, now + this.config.blockDurationMs);
      await auditLogger.logSecurityEvent(
        AuditEventType.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded for ${action} by ${identifier}`,
        { identifier, action, attempts: validAttempts.length }
      );
      return false;
    }

    // Record attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  getRemainingAttempts(identifier: string, action: string): number {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(
      timestamp => now - timestamp < this.config.windowMs
    );
    return Math.max(0, this.config.maxAttempts - validAttempts.length);
  }

  getBlockedUntil(identifier: string, action: string): Date | null {
    const key = this.getKey(identifier, action);
    const blockedUntil = this.blockedUntil.get(key);
    return blockedUntil && Date.now() < blockedUntil ? new Date(blockedUntil) : null;
  }
}

// Enhanced password validation
export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long");
  } else if (password.length >= 12) {
    score += 1;
  }

  // Complexity checks
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (hasUppercase) score += 0.5;
  if (hasLowercase) score += 0.5;
  if (hasNumbers) score += 0.5;
  if (hasSpecialChars) score += 0.5;

  if (!hasUppercase) feedback.push("Add uppercase letters");
  if (!hasLowercase) feedback.push("Add lowercase letters");
  if (!hasNumbers) feedback.push("Add numbers");
  if (!hasSpecialChars) feedback.push("Add special characters (!@#$%^&*)");

  // Common password patterns
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^welcome/i
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push("Avoid common password patterns");
      score = Math.max(0, score - 1);
      break;
    }
  }

  // Sequential characters
  if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) {
    feedback.push("Avoid sequential characters");
    score = Math.max(0, score - 0.5);
  }

  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    feedback.push("Avoid repeated characters");
    score = Math.max(0, score - 0.5);
  }

  const isValid = score >= 2 && password.length >= 8;

  return {
    score: Math.round(score),
    feedback,
    isValid
  };
}

export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Additional checks
  if (email.length > 254) {
    return { isValid: false, message: "Email address too long" };
  }

  const localPart = email.split('@')[0];
  if (localPart.length > 64) {
    return { isValid: false, message: "Email local part too long" };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.{2,}/, // consecutive dots
    /^\./, // starts with dot
    /\.$/, // ends with dot
    /@\./, // @ followed by dot
    /\.@/ // dot followed by @
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return { isValid: false, message: "Invalid email format" };
    }
  }

  return { isValid: true };
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove basic HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .slice(0, 1000); // Limit length
}

// Create rate limiter instances
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per window
  blockDurationMs: 30 * 60 * 1000 // 30 minutes block
});

export const generalRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes  
  maxAttempts: 20, // 20 attempts per window
  blockDurationMs: 5 * 60 * 1000 // 5 minutes block
});