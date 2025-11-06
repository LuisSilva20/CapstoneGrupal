import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

  async loginWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      return null;
    }
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
