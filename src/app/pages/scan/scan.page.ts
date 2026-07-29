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
    this.serviceType = this.authService.getServiceType() || 'entry';
  }

  async startScan() {
    try {
      const { supported } = await BarcodeScanner.isSupported().catch(() => ({ supported: false }));

      if (!supported) {
        await this.showToast('Opening scan result page...', 'dark');
        this.router.navigate(['/tabs/scan-result']);
        return;
      }

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
      this.router.navigate(['/tabs/scan-result']);
    }
  }

  private processScannedCode(scannedText: string) {
    let orderId = scannedText.trim();
    if (!orderId) {
      this.showToast('Invalid QR Code: empty content.', 'danger');
      return;
    }

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
    const role = (this.authService.getServiceType() || localStorage.getItem('serviceType') || 'entry').trim();

    this.isVerifying = true;

    this.authService.verifyOrder(orderId, role).subscribe({
      next: (res) => {
        this.isVerifying = false;
        this.router.navigate(['/tabs/scan-result']);
      },
      error: (_err) => {
        this.isVerifying = false;
        this.router.navigate(['/tabs/scan-result']);
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' | 'dark') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }
}
