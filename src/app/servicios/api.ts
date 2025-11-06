import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc } from '@angular/fire/firestore';
import { from, Observable, map } from 'rxjs';
import { User, IntentoExamen, PreguntaExamen, KnowledgeTree, Curso, Leccion } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private usuariosCollection = 'users';
  private cursosCollection = 'cursos';
  private leccionesCollection = 'lecciones';
  private preguntasCollection = 'preguntas';
  private resultadosCollection = 'resultados';
  private arbolesCollection = 'arboles';

  constructor(@Inject(Firestore) private firestore: Firestore) {}

  // ===========================
  // ===== SESIÓN / LOGIN ======
  // ===========================
  isLogged(): boolean {
    return !!sessionStorage.getItem('username'); // true si hay usuario en sesión
  }

  // ===========================
  // ===== USUARIOS ===========
  // ===========================
  listarUsuarios(): Observable<User[]> {
    const usuariosRef = collection(this.firestore, this.usuariosCollection);
    return collectionData(usuariosRef, { idField: 'id' }) as Observable<User[]>;
  }

  crearUsuario(newUsuario: Omit<User, 'id'>): Observable<User> {
    const usuariosRef = collection(this.firestore, this.usuariosCollection);
    return from(addDoc(usuariosRef, newUsuario)).pipe(
      map(docRef => ({ id: docRef.id, ...newUsuario } as User))
    );
  }

  getUserByUsername(username: string): Observable<User[]> {
    return this.listarUsuarios().pipe(
      map(users => users.filter(u => u.username?.toLowerCase() === username.toLowerCase()))
    );
  }

  getUserByUsernameOrEmail(valor: string): Observable<User[]> {
    const q = (valor || '').trim().toLowerCase();
    if (!q) return from([]);
    return this.listarUsuarios().pipe(
      map(users => users.filter(
        u => (u.username?.toLowerCase() === q) || (u.email.toLowerCase() === q)
      ))
    );
  }

  actualizarUsuario(id: string, datos: Partial<User>): Observable<void> {
    const userDoc = doc(this.firestore, `${this.usuariosCollection}/${id}`);
    return from(updateDoc(userDoc, datos));
  }

  // ===========================
  // ===== CURSOS ============
  // ===========================
  getAllCursos(): Observable<Curso[]> {
    const cursosRef = collection(this.firestore, this.cursosCollection);
    return collectionData(cursosRef, { idField: 'id' }) as Observable<Curso[]>;
  }

  crearCurso(newCurso: Omit<Curso, 'id'>): Observable<Curso> {
    const cursosRef = collection(this.firestore, this.cursosCollection);
    return from(addDoc(cursosRef, newCurso)).pipe(
      map(docRef => ({ id: docRef.id, ...newCurso } as Curso))
    );
  }

  // ===========================
  // ===== LECCIONES ==========
  // ===========================
  getLeccionesByCurso(cursoId: string | number): Observable<Leccion[]> {
    const leccionesRef = collection(this.firestore, this.leccionesCollection);
    return collectionData(leccionesRef, { idField: 'id' }).pipe(
      map((lecciones: any[]) =>
        lecciones
          .map(l => ({ ...l } as Leccion))
          .filter(l => l.cursoId.toString() === cursoId.toString())
      )
    );
  }

  crearLeccion(newLeccion: Omit<Leccion, 'id'>): Observable<Leccion> {
    const leccionesRef = collection(this.firestore, this.leccionesCollection);
    return from(addDoc(leccionesRef, newLeccion)).pipe(
      map(docRef => ({ id: docRef.id, ...newLeccion } as Leccion))
    );
  }

  // ===========================
  // ===== PREGUNTAS ==========
  // ===========================
  getPreguntas(treeId?: string | number): Observable<PreguntaExamen[]> {
    const preguntasRef = collection(this.firestore, this.preguntasCollection);
    return collectionData(preguntasRef, { idField: 'id' }).pipe(
      map((pregs: any[]) =>
        pregs
          .map(p => ({ ...p } as PreguntaExamen))
          .filter(p => treeId ? p.treeId?.toString() === treeId.toString() : true)
      )
    );
  }

  // ===========================
  // ===== RESULTADOS / INTENTOS
  // ===========================
  guardarIntento(usuarioId: string, respuestas: any[], score: number): Observable<IntentoExamen> {
    const resultadosRef = collection(this.firestore, this.resultadosCollection);
    const intento: IntentoExamen = {
      usuarioId,
      fecha: new Date().toISOString(),
      respuestas,
      puntaje: score,
    };
    return from(addDoc(resultadosRef, intento)).pipe(map(() => intento));
  }

  getIntentos(usuarioId: string): Observable<IntentoExamen[]> {
    const resultadosRef = collection(this.firestore, this.resultadosCollection);
    return collectionData(resultadosRef, { idField: 'id' }).pipe(
      map((res: any[]) =>
        res
          .map(r => ({ ...r } as IntentoExamen))
          .filter(r => r.usuarioId === usuarioId)
      )
    );
  }

  // ===========================
  // ===== ÁRBOLES ============
  // ===========================
  getArboles(): Observable<KnowledgeTree[]> {
    const treesRef = collection(this.firestore, this.arbolesCollection);
    return collectionData(treesRef, { idField: 'id' }).pipe(
      map((trees: any[]) => trees.map(t => ({ ...t } as KnowledgeTree)))
    );
  }
}
