import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; // Injected for page redirection
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonFabButton,
  AlertController,
  LoadingController 
} from '@ionic/angular/standalone';
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { Torch } from '@capawesome/capacitor-torch';

import { addIcons } from 'ionicons';
import { qrCodeOutline, flash, flashOff, close } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service'; // Adjust path to your auth service

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
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonFabButton
  ]
})
export class ScanPage implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private authService = inject(AuthService); // Used to pull your active session token

  scanResult: string | null = null;
  isScanning: boolean = false;
  isTorchOn: boolean = false;
  service_type: any  = localStorage.getItem('service_type');
  user_id: any;

  constructor() {
    addIcons({
      'qr-code-outline': qrCodeOutline,
      'flash': flash,
      'flash-off': flashOff,
      'close': close
    });
  }

  ngOnInit() {
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null;
    if (currentUser) {
      this.user_id = currentUser.id;
      console.log('User ID:', this.user_id);
    } else {
      this.router.navigate(['/login']);
    }
    BarcodeScanner.isSupported().then((result) => {
      if (!result.supported) {
        this.presentAlert('Framework Warning', 'Barcode scanning is not supported on this platform view.');
      }
    });
  }

  async startScan() {
    try {
      const permission = await BarcodeScanner.requestPermissions();
      if (permission.camera !== 'granted') {
        this.presentAlert('Permission Denied', 'Camera access is required.');
        return;
      }

      this.scanResult = null;
      this.isScanning = true;
      document.querySelector('body')?.classList.add('barcode-scanner-active');

      await BarcodeScanner.addListener(
        'barcodesScanned',
        async (event) => {
          if (event && event.barcodes && event.barcodes.length > 0) {
            const rawValue = event.barcodes[0].displayValue;
            this.scanResult = rawValue;
            
            this.stopScan();
            this.processScannedData(rawValue, this.service_type, this.user_id);
          }
        }
      );

      await BarcodeScanner.startScan({
        formats: [BarcodeFormat.QrCode],
        lensFacing: LensFacing.Back
      });

    } catch (error: any) {
      console.error('Scan Runtime Breakdown Event:', error);
      this.stopScan();
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
  }

  async toggleTorch() {
    try {
      if (this.isTorchOn) {
        await Torch.disable();
        this.isTorchOn = false;
      } else {
        await Torch.enable();
        this.isTorchOn = true;
      }
    } catch (error) {
      this.presentAlert('Torch Error', 'Flashlight could not be toggled.');
    }
  }

  async stopScan() {
    this.isScanning = false;
    this.isTorchOn = false;
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
    await Torch.disable(); 
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  ngOnDestroy() {
    this.stopScan();
  }
}
