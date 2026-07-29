import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  qrCodeOutline,
  flashOutline,
  flashOffOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  cameraOutline,
  refreshOutline,
  arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonSpinner
  ]
})
export class ScanPage implements OnInit {
  private toastCtrl = inject(ToastController);

  flashOn = false;
  isScanning = true;
  manualTicket = '';
  isVerifying = false;
  scanResult: { ticket: string; valid: boolean; message: string } | null = null;

  constructor() {
    addIcons({
      qrCodeOutline,
      flashOutline,
      flashOffOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      cameraOutline,
      refreshOutline,
      arrowForwardOutline
    });
  }

  ngOnInit() {}

  toggleFlash() {
    this.flashOn = !this.flashOn;
  }

  async simulateScan() {
    this.isVerifying = true;
    setTimeout(async () => {
      this.isVerifying = false;
      const randomSuccess = Math.random() > 0.3;
      const fakeTicket = `TKT-${Math.floor(1000 + Math.random() * 9000)}-MZ`;

      this.scanResult = {
        ticket: fakeTicket,
        valid: randomSuccess,
        message: randomSuccess ? 'Valid Entry Ticket • Mouj Mahal Fun Zone' : 'Duplicate Ticket Attempt Detected!'
      };

      const toast = await this.toastCtrl.create({
        message: this.scanResult.message,
        duration: 3000,
        color: randomSuccess ? 'success' : 'danger',
        position: 'top',
        icon: randomSuccess ? 'checkmark-circle-outline' : 'alert-circle-outline'
      });
      await toast.present();
    }, 1200);
  }

  resetScan() {
    this.scanResult = null;
    this.manualTicket = '';
  }
}
