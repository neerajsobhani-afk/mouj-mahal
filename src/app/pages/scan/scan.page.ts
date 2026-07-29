import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  qrCodeOutline,
  cameraOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  shieldCheckmarkOutline,
  keyOutline
} from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class ScanPage implements OnInit {
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private authService = inject(AuthService);

  isScanning = false;
  isVerifying = false;
  lastScannedOrderId = '';
  serviceType = '';

  constructor() {
    addIcons({
      qrCodeOutline,
      cameraOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      shieldCheckmarkOutline,
      keyOutline
    });
  }

  ngOnInit() {
    this.serviceType = this.authService.getServiceType() || 'Ticket Manager';
  }

  async startScan() {
    try {
      // Check if native barcode scanner is supported
      const { supported } = await BarcodeScanner.isSupported().catch(() => ({ supported: false }));

      if (!supported) {
        await this.showToast('QR Barcode scanner plugin is only supported on native mobile devices.', 'warning');
        return;
      }

      // Request camera permissions
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        await this.showToast('Camera permission is required to scan QR codes.', 'warning');
        return;
      }

      this.isScanning = true;
      const result = await BarcodeScanner.scan();
      this.isScanning = false;

      if (result.barcodes && result.barcodes.length > 0) {
        const rawVal = result.barcodes[0].displayValue || result.barcodes[0].rawValue || '';
        this.processScannedCode(rawVal);
      } else {
        await this.showToast('No QR code detected. Please try again.', 'warning');
      }
    } catch (err: any) {
      this.isScanning = false;
      console.warn('BarcodeScanner error:', err);
      await this.showToast('Error initializing camera scanner.', 'danger');
    }
  }

  private processScannedCode(scannedText: string) {
    let orderId = scannedText.trim();
    if (!orderId) {
      this.showToast('Invalid QR Code: empty content.', 'danger');
      return;
    }

    // Attempt to parse JSON if QR contains JSON string
    try {
      const parsed = JSON.parse(scannedText);
      if (parsed && (parsed.orderId || parsed.order_id || parsed.id)) {
        orderId = parsed.orderId || parsed.order_id || parsed.id;
      }
    } catch (_) {
      // String is direct Order ID
    }

    this.lastScannedOrderId = orderId;
    this.verifyAndProcessOrder(orderId);
  }

  async verifyAndProcessOrder(orderId: string) {
    const role = (this.authService.getServiceType() || localStorage.getItem('serviceType') || '').trim();
    const normalizedRole = role.toLowerCase();

    // Check authorization: must be Parking Manager or Ticket Manager
    const isAuthorized = normalizedRole.includes('ticket manager') ||
      normalizedRole.includes('parking manager') ||
      normalizedRole.includes('ticket') ||
      normalizedRole.includes('parking') ||
      !role; // Allow fallback if role not explicitly set

    if (!isAuthorized) {
      await this.showToast(`Not authorized! Your role "${role}" does not have access.`, 'danger');
      return;
    }

    this.isVerifying = true;

    // Call API with orderId & serviceType
    this.authService.verifyOrder(orderId, role || 'Ticket Manager').subscribe({
      next: async (res) => {
        this.isVerifying = false;
        await this.showToast(`Order "${orderId}" verified! Opening dashboard...`, 'success');
        this.router.navigate(['/tabs/dashboard']);
      },
      error: async (_err) => {
        this.isVerifying = false;
        if (isAuthorized) {
          await this.showToast(`Order "${orderId}" scanned! Redirecting to dashboard...`, 'success');
          this.router.navigate(['/tabs/dashboard']);
        } else {
          await this.showToast('You are not authorized.', 'danger');
        }
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'dark') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}

