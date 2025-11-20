import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
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

  async canActivate(): Promise<boolean> {
    try {
      const current = this.auth.currentUser;
      if (current) {
        return true;
      } else {
        // Eliminar el foco antes de redirigir
        const activeElement = document.activeElement as HTMLElement | null;
        activeElement?.blur();

        const toast = await this.toastController.create({
          message: 'Debe iniciar sesión',
          duration: 2500,
          position: 'bottom'
        });
        await toast.present();
        this.router.navigate(['/inicio-sesion']);
        return false;
      }
    } catch (err) {
      // Eliminar el foco antes de redirigir en caso de error
      const activeElement = document.activeElement as HTMLElement | null;
      activeElement?.blur();

      const toast = await this.toastController.create({
        message: 'Error validando sesión',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
      this.router.navigate(['/inicio-sesion']);
      return false;
    }
  }
}
