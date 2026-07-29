import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserData {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  name?: string;
  role?: string;
  serviceType?: string;
  service_type?: string;
  user_type?: string;
  [key: string]: any;
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
    const role = user?.role || user?.serviceType || user?.service_type || user?.user_type || '';
    if (role) {
      localStorage.setItem('serviceType', role);
    }
  }

  getUser(): UserData | null {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  }

  saveServiceType(serviceType: string): void {
    localStorage.setItem('serviceType', serviceType);
  }

  getServiceType(): string {
    const directRole = localStorage.getItem('serviceType');
    if (directRole) return directRole;
    const user = this.getUser();
    return user?.role || user?.serviceType || user?.service_type || user?.user_type || '';
  }

  verifyOrder(orderId: string, serviceType: string): Observable<any> {
    const url = `${this.baseUrl}/get_order`;
    return this.http.post(url, { orderId, serviceType });
  }

  getDashboardStats(userId: number): Observable<any> {
    const url = `${this.baseUrl}/entry-dashboard?user_id=${userId}`;
    return this.http.get(url);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('serviceType');
  }
}

