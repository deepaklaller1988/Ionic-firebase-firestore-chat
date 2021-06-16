
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import  firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
 
export interface User {
  uid: string;
  email: string;
}
 
export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  imageFile:File;
  fromName: string;
  myMsg: boolean;
  filepath: string;
}
 
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  currentUser: User = null;
 
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore,
    private db: AngularFireDatabase, private storage: AngularFireStorage
    ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.currentUser = user;      
    });
  }
 
  async signup({ email, password }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
 
    const uid = credential.user.uid;
 
    return this.afs.doc(
      `users/${uid}`
    ).set({
      uid,
      email: credential.user.email,
    })
  }
 
  signIn({ email, password }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }
 
  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }
  addChatMessage(msg) {
    return this.afs.collection('messages').add({
      msg: msg,
      // imageFile:imageFile,
      from: this.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
   
  getChatMessages() {
    let users = [];
    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        return this.afs.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' }) as Observable<Message[]>;
      
      }),
      map(messages => {
        // Get the real name for each user
        for (let m of messages) {          
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }        
        return messages
      
      })
    )
  }
   
  private getUsers() {
    return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }
   
  private getUserForMsg(msgFromId, users: User[]): string {    
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email;
      }
    }
    return 'Deleted';
  }

  // onDeleteImg(img){
  //   this.deleteFileDatabase(img.name)
  //     .then(() => {
  //       this.deleteFileStorage(img.name);
  //     })
  //     .catch(error => console.log(error));

  // }
  // private deleteFileDatabase(name: string): Promise<void> {
  //   return this.db.list(this.).remove(name);
  // }

  // private deleteFileStorage(name: string): void {
  //   const storageRef = this.storage.ref(this.basePath);
  //   storageRef.child(name).delete();
  // }

  // ondeleteMsg(message){
  //   this.db.object('messages/' + message.id).remove();
  

  // }

}