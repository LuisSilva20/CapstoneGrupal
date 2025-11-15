import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel,
  IonButton, IonInput, IonList
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth';
import { User } from 'src/app/interfaces/interfaces';

// Interfaz para tipar la respuesta de AuthService
interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  templateUrl: './inicio-sesion.page.html',
  styleUrls: ['./inicio-sesion.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonInput,
    IonList,
  ],
})
export class InicioSesionPage {
  inicioSesionForm: FormGroup;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.inicioSesionForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  async iniciarSesion() {
    if (!this.inicioSesionForm.valid) return;

    const { identifier, password } = this.inicioSesionForm.value;

    this.cargando = true;
    try {
      const res: AuthResponse = await this.authService.loginWithEmail(identifier, password);
      if (!res.success) {
        this.showAlert('Error', res.error ?? 'Error al iniciar sesión');
        return;
      }

      const toast = await this.toastCtrl.create({ message: 'Sesión iniciada!', duration: 2000 });
      toast.present();
      this.router.navigateByUrl('/inicio');
    } finally {
      this.cargando = false;
    }
  }

  async loginGoogle() {
    this.cargando = true;
    try {
      const res: AuthResponse = await this.authService.loginWithGoogle();
      if (!res.success) {
        this.showAlert('Error', res.error ?? 'Error al iniciar sesión con Google');
        return;
      }

      const toast = await this.toastCtrl.create({ message: 'Sesión con Google iniciada!', duration: 2000 });
      toast.present();
      this.router.navigateByUrl('/inicio');
    } finally {
      this.cargando = false;
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    alert.present();
  }
}
