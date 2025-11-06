import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
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
  IonAvatar,
  IonIcon
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Api } from 'src/app/servicios/api';
import { AuthService } from 'src/app/servicios/auth';
import { User } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  templateUrl: './inicio-sesion.page.html',
  styleUrls: ['./inicio-sesion.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonIcon, IonAvatar,
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

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.inicioSesionForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ionViewWillEnter() {
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.inicioSesionForm.reset({
      username: '',
      password: '',
    });
  }

  async iniciarSesion() {
    if (!this.inicioSesionForm.valid) {
      this.showAlert('Error', 'Por favor completa todos los campos correctamente.');
      return;
    }

    const identifier = this.inicioSesionForm.value.username?.trim() ?? '';
    const password = this.inicioSesionForm.value.password ?? '';

    if (!identifier || !password) {
      this.showAlert('Error', 'Usuario o contraseña vacíos.');
      return;
    }

    try {
      const resp: User[] = (await this.api.getUserByUsernameOrEmail(identifier).toPromise() as User[]) ?? [];

      if (!resp || resp.length === 0) {
        this.showAlert('Usuario no existe', 'Debe registrarse primero.');
        return;
      }

      const usuario: User = resp[0];

      if (!usuario.isactive) {
        this.showAlert('Usuario inactivo', 'Contacta al administrador.');
        return;
      }

      if (usuario.password !== password) {
        this.showAlert('Error', 'Contraseña incorrecta.');
        return;
      }

      // Guardar datos del usuario en sessionStorage
      sessionStorage.setItem('username', usuario.username ?? '');
      sessionStorage.setItem('email', usuario.email ?? '');
      sessionStorage.setItem('nombre', usuario.nombre ?? '');
      sessionStorage.setItem('apellidos', usuario.apellidos ?? '');
      sessionStorage.setItem('ingresado', 'true');

      if ((usuario as any).idCurso) {
        sessionStorage.setItem('userCursoId', String((usuario as any).idCurso));
      }

      const toast = await this.toastCtrl.create({
        message: 'Sesión iniciada correctamente!',
        duration: 2000,
      });
      await toast.present();

      this.router.navigateByUrl('/inicio');
    } catch (error) {
      console.error('Error en iniciarSesion():', error);
      this.showAlert('Error', 'Ocurrió un error al intentar iniciar sesión.');
    }
  }

  // 🔹 Nuevo método: login con Google
  async loginGoogle() {
    try {
      const user = await this.auth.loginWithGoogle(); // devuelve objeto User de Firebase
      if (!user) return;

      // Guardar datos en sessionStorage
      sessionStorage.setItem('username', user.displayName ?? '');
      sessionStorage.setItem('email', user.email ?? '');
      sessionStorage.setItem('nombre', user.displayName?.split(' ')[0] ?? '');
      sessionStorage.setItem('apellidos', user.displayName?.split(' ').slice(1).join(' ') ?? '');
      sessionStorage.setItem('ingresado', 'true');

      const toast = await this.toastCtrl.create({
        message: 'Sesión iniciada con Google correctamente!',
        duration: 2000,
      });
      await toast.present();

      this.router.navigateByUrl('/inicio');
    } catch (err) {
      console.error('Error loginGoogle:', err);
      this.showAlert('Error', 'No se pudo iniciar sesión con Google.');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Ok'],
    });
    await alert.present();
  }
}
