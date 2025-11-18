import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IniciadoGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: Auth,
    private toastController: ToastController
  ) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          // Usuario logeado → permite acceso
          resolve(true);
        } else {
          // No logeado → mostrar toast y redirigir
          const toast = await this.toastController.create({
            message: 'Debe iniciar sesión',
            duration: 2500
          });
          toast.present();
          this.router.navigate(['/inicio-sesion']);
          resolve(false);
        }
      });
    });
  }
}
