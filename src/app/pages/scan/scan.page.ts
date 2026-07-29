import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
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
    HttpClientModule,
    IonHeader,
    IonToolbar,
    IonTitle,
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
  async processScannedData(qrContent: string, serviceType: string, userId: any) {
    // Show a loading overlay spinner immediately while network executes
    const loading = await this.loadingController.create({
      message: 'Validating Entry Scan...',
    });
    await loading.present();

    try {
      
      // 2. Prepare payload matching requirements exactly
      const payload = {
        order_id: qrContent,
        service_type: serviceType,
        user_id: userId
      };

      // 3. Inject Bearer authentication token from your session state wrapper
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      this.http.post(this.authService.baseUrl + '/entry-scan', payload, { headers }).subscribe({
        next: async (apiResponse: any) => {
          await loading.dismiss();
          
          this.router.navigate(['/scan-result'], {
            state: { resultData: apiResponse }
          });

        console.log('API Response:', apiResponse);
        },
        error: async (err) => {
          await loading.dismiss();
          const errorPayload = err.error || { message: 'Failed to communicate with authorization servers.' };
          this.router.navigate(['/scan-result'], {
            state: { resultData: { success: false, ...errorPayload } }
          });
        console.error('API Error Response:', errorPayload);
        }
      });

    } catch (e) {
      await loading.dismiss();
      this.presentAlert('Parsing Crash', 'Failed to generate runtime data stream pipelines.');

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
