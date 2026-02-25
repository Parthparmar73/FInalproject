import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  private firestore = inject(Firestore);

  private colRef = collection(
    this.firestore,
    'users'
  );

  addData(data: any) {
    return addDoc(this.colRef, data);
  }

  getData(uid: string) {

    const q = query(
      this.colRef,
      where('uid', '==', uid)
    );

    return collectionData(q, {
      idField: 'id'
    });
  }

  updateData(id: string, data: any) {

    const docRef = doc(
      this.firestore,
      'users/' + id
    );

    return updateDoc(docRef, data);
  }

  deleteData(id: string) {

    const docRef = doc(
      this.firestore,
      'users/' + id
    );

    return deleteDoc(docRef);
  }
  getUserData(uid: string) {
    return this.getData(uid);
  }
  
}
