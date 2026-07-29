import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  qrCodeOutline,
  cameraOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  closeCircleOutline,
  shieldCheckmarkOutline,
  warningOutline,
  locationOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})
export class ScanPage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  /**
   * API Response Message Variable.
   * Change this value manually in code or select from the top dropdown to test different pages:
   * - 'Entry allowed.'   => Variation 1 (200 OK — Entry Allowed)
   * - 'Invalid order.'   => Variation 2 (404 Not Found — Invalid Order)
   * - 'Already entered.' => Variation 3 (409 Conflict — Already Scanned)
   */
  apiMessage: string = 'Entry allowed.';

  // Response Payload Mock Data
  allowedData = {
    customerName: 'Alexander Sterling',
    ticketNumber: '#SZ-992-FX01',
    type: 'Fun Zone',
    time: '14:45 PM',
    gateName: 'North Gate B',
    status: 'Active',
    location: 'Fun Zone Entrance'
  };

  invalidData = {
    title: 'Invalid QR Code',
    message: 'This ticket is not found in the system.',
    auditSyncTime: '2 minutes ago'
  };

  alreadyEnteredData = {
    customerName: 'Marcus Holloway',
    badgeType: 'VIP PASS',
    ticketNumber: '#ENTRY-88291-FZ',
    previousEntry: '14:22 PM',
    lastSeenAt: 'North Plaza - Gate 4',
    warningMessage: 'Potential duplicate entry attempt detected. Deny access and verify ID if necessary.'
  };

  constructor() {
    addIcons({
      qrCodeOutline,
      cameraOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      closeCircleOutline,
      shieldCheckmarkOutline,
      warningOutline,
      locationOutline,
      arrowBackOutline
    });
  }

  ngOnInit() { }

  onMessageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.apiMessage = target.value;
    }
  }

  /**
   * Evaluates apiMessage variable and returns page response type:
   * 'allowed' | 'invalid' | 'already_entered'
   */
  get responseType(): 'allowed' | 'invalid' | 'already_entered' {
    const msg = (this.apiMessage || '').trim().toLowerCase();
    if (msg.includes('already') || msg.includes('409')) {
      return 'already_entered';
    }
    if (msg.includes('invalid') || msg.includes('not found') || msg.includes('404')) {
      return 'invalid';
    }
    return 'allowed';
  }

  onScanNext() {
    this.router.navigate(['/tabs/dashboard']);
  }
}
