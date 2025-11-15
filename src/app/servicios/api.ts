import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { from, Observable, map, of } from 'rxjs';
import { User, Curso, Leccion, PreguntaExamen, IntentoExamen, KnowledgeTree } from '../interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class Api {
  private usersCollection = 'users';
  private cursosCollection = 'cursos';
  private leccionesCollection = 'lecciones';
  private preguntasCollection = 'preguntas';
  private resultadosCollection = 'resultados';
  private arbolesCollection = 'arboles';

  constructor(@Inject(Firestore) private firestore: Firestore) {}

  // 🔹 Crear usuario
  crearUsuario(newUsuario: Omit<User, 'id'>, uid: string): Observable<User> {
    const userDoc = doc(this.firestore, this.usersCollection, uid);
    return from(setDoc(userDoc, { ...newUsuario, id: uid })).pipe(map(() => ({ ...newUsuario, id: uid })));
  }

  // 🔹 Actualizar usuario
  actualizarUsuario(id: string, datos: Partial<User>): Observable<void> {
    if (!id) return of();
    const userDoc = doc(this.firestore, this.usersCollection, id);
    return from(updateDoc(userDoc, datos));
  }

  // 🔹 Cursos
  getAllCursos(): Observable<Curso[]> {
    return collectionData(collection(this.firestore, this.cursosCollection), { idField: 'id' }) as Observable<Curso[]>;
  }
  crearCurso(newCurso: Omit<Curso, 'id'>): Observable<Curso> {
    const ref = collection(this.firestore, this.cursosCollection);
    return from(addDoc(ref, newCurso)).pipe(map(docRef => ({ ...newCurso, id: docRef.id })));
  }

  // 🔹 Lecciones
  getLeccionesByCurso(cursoId: string | number): Observable<Leccion[]> {
    return collectionData(collection(this.firestore, this.leccionesCollection), { idField: 'id' }).pipe(
      map((lecciones: any[]) => lecciones.filter(l => l.cursoId?.toString() === cursoId.toString()))
    );
  }
  crearLeccion(newLeccion: Omit<Leccion, 'id'>): Observable<Leccion> {
    const ref = collection(this.firestore, this.leccionesCollection);
    return from(addDoc(ref, newLeccion)).pipe(map(docRef => ({ ...newLeccion, id: docRef.id })));
  }

  // 🔹 Preguntas
  getPreguntas(treeId?: string | number): Observable<PreguntaExamen[]> {
    return collectionData(collection(this.firestore, this.preguntasCollection), { idField: 'id' }).pipe(
      map((pregs: any[]) => treeId ? pregs.filter(p => p.treeId?.toString() === treeId.toString()) : pregs)
    );
  }

  // 🔹 Resultados
  guardarIntento(usuarioId: string, respuestas: any[], score: number): Observable<IntentoExamen> {
    const intento: IntentoExamen = { usuarioId, fecha: new Date().toISOString(), respuestas, puntaje: score };
    return from(addDoc(collection(this.firestore, this.resultadosCollection), intento)).pipe(map(() => intento));
  }
  getIntentos(usuarioId: string): Observable<IntentoExamen[]> {
    return collectionData(collection(this.firestore, this.resultadosCollection), { idField: 'id' }).pipe(
      map((res: any[]) => res.filter(r => r.usuarioId === usuarioId))
    );
  }

  // 🔹 Árboles
  getArboles(): Observable<KnowledgeTree[]> {
    return collectionData(collection(this.firestore, this.arbolesCollection), { idField: 'id' }).pipe(
      map((trees: any[]) => trees as KnowledgeTree[])
    );
  }
}
