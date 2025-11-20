import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';

import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User, AuthResponse } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.loadSession();
  }

  // ============================================================
  // 🔹 LOGIN UNIVERSAL (username o email)
  // ============================================================
  async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      const isEmail = identifier.includes('@');

      if (isEmail) {
        return this.loginWithEmail(identifier, password);
      }

      const emailFromUsername = await this.findEmailByUsername(identifier);

      if (!emailFromUsername) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      return this.loginWithEmail(emailFromUsername, password);

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // 🔹 LOGIN CON EMAIL (DEBE SER PÚBLICO)
  // ============================================================
  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      const fbUser = cred.user;

      let user = await this.getUserByUid(fbUser.uid);

      if (!user) {
        const newUser: Omit<User, 'id'> = {
          nombre: fbUser.displayName ?? '',
          apellidos: '',
          email: fbUser.email ?? email,
          username: (fbUser.email ?? email).split('@')[0],
          isactive: true,
          examHistory: [],
          learningProgress: {},
          cursosCompletados: [],
          progreso: 0,
        };

        user = await this.saveUserFirestore(newUser, fbUser.uid);
      }

      this.saveSession(user);
      return { success: true, user };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // 🔹 LOGIN CON GOOGLE
  // ============================================================
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);
      const fbUser = cred.user;

      let user = await this.getUserByUid(fbUser.uid);

      if (!user) {
        const newUser: Omit<User, 'id'> = {
          nombre: fbUser.displayName ?? '',
          apellidos: '',
          email: fbUser.email ?? '',
          username: (fbUser.email ?? '').split('@')[0],
          isactive: true,
          examHistory: [],
          learningProgress: {},
          cursosCompletados: [],
          progreso: 0,
        };

        user = await this.saveUserFirestore(newUser, fbUser.uid);
      }

      this.saveSession(user);
      return { success: true, user };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // 🔹 REGISTRO
  // ============================================================
  async register(userData: Omit<User, 'id'>, password: string): Promise<AuthResponse> {
    try {
      const email = userData.email;

      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      const fbUser = cred.user;

      const user = await this.saveUserFirestore(userData, fbUser.uid);

      this.saveSession(user);

      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // 🔹 OBTENER email desde username
  // ============================================================
  private async findEmailByUsername(username: string): Promise<string | null> {
    const ref = collection(this.firestore, 'users');
    const q = query(ref, where('username', '==', username));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    return snap.docs[0].data()['email'] ?? null;
  }

  // ============================================================
  // 🔹 OBTENER USUARIO POR UID
  // ============================================================
  private async getUserByUid(uid: string): Promise<User | null> {
    const ref = doc(this.firestore, 'users', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data() as User;
  }

  // ============================================================
  // 🔹 GUARDAR USUARIO EN FIRESTORE
  // ============================================================
  private async saveUserFirestore(userData: Omit<User, 'id'>, uid: string): Promise<User> {
    const ref = doc(this.firestore, 'users', uid);
    await setDoc(ref, userData);
    return { id: uid, ...userData };
  }

  // ============================================================
  // 🔹 SESIÓN LOCAL
  // ============================================================
  private saveSession(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  private loadSession() {
    const data = localStorage.getItem('user');
    if (!data) return;
    this.userSubject.next(JSON.parse(data));
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
