// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'authToken'; // Key for localStorage

  // Save token to localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Clear token from localStorage
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Check if token exists
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
