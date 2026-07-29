import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  checkmarkCircleOutline,
  notificationsOutline,
  refreshOutline,
  documentTextOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class DashboardPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  todayEntries: number | null = null;
  isLoading = false;

  constructor() {
    addIcons({
      personOutline,
      checkmarkCircleOutline,
      notificationsOutline,
      refreshOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    this.loadDashboardStats();
  }

  ionViewWillEnter() {
    this.loadDashboardStats();
  }

  openScanResult() {
    this.router.navigate(['/tabs/scan-result']);
  }

  loadDashboardStats() {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.isLoading = true;
      this.authService.getDashboardStats(user.id).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && res.results && res.results.todays_scans !== undefined) {
            this.todayEntries = res.results.todays_scans;
          } else if (res && res.todays_scans !== undefined) {
            this.todayEntries = res.todays_scans;
          } else {
            this.todayEntries = 0;
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Failed to fetch dashboard stats:', err);
          if (this.todayEntries === null) {
            this.todayEntries = 0;
          }
        }
      });
    } else {
      this.todayEntries = 0;
    }
  }
}
