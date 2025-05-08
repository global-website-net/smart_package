import { hash, compare } from 'bcryptjs'
import { randomBytes } from 'crypto'

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// CSRF Protection
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Phone number validation
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone)
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Session timeout (in milliseconds)
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

// Maximum login attempts
export const MAX_LOGIN_ATTEMPTS = 10
export const LOGIN_ATTEMPT_WINDOW = 5 * 60 * 1000 // 5 minutes

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

export function validatePassword(password: string): boolean {
  const {
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecialChars,
  } = PASSWORD_REQUIREMENTS

  if (password.length < minLength) return false
  if (requireUppercase && !/[A-Z]/.test(password)) return false
  if (requireLowercase && !/[a-z]/.test(password)) return false
  if (requireNumbers && !/[0-9]/.test(password)) return false
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false

  return true
} 