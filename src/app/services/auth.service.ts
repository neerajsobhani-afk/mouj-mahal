import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserData {
  role(role: any): string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  name: string;
}

export interface LoginSuccessResponse {
  success: true;
  message: string;
  data: UserData;
}

export interface LoginErrorResponse {
  success: false;
  message: string;
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  public baseUrl = 'https://apiv2.moujmahal.co.in/api';

  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.baseUrl}/ajax_login`;
    return this.http.post<LoginResponse>(url, { email, password });
  }

  saveUser(user: UserData): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUser(): UserData | null {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }
}
