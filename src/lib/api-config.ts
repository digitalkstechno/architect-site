/**
 * Centralized API configuration
 * Uses environment variable NEXT_PUBLIC_SA_API_URL from .env.local
 * Falls back to localhost for development if not defined
 */
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_SA_API_URL || "http://localhost:9000/architecture";
