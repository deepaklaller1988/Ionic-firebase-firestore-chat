import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, Platform, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { ChatService } from '../../service/chat.service';
// import { Router } from '@angular/router';
// import { CameraService } from 'src/app/services/camera/camera.service';
// import { ImagePicker } from '@ionic-native/image-picker/ngx';
// import { File } from '@ionic-native/File';
// import { MediaCapture } from '@ionic-native/media-capture/ngx';
// import { Media } from '@ionic-native/media/ngx';
// import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
// import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
// import { ActionSheetController } from '@ionic/angular';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import  firebase from 'firebase';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { finalize, tap } from 'rxjs/operators';
import { AngularFireList,AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
// import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

export interface imgFile {
  name: string;
  filepath: string;
  // size: number;
}
 
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})


export class ChatPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  
 
  messages: Observable<any[]>;
  newMsg = '';
  imageFile="";
  uid : string = ''; 
  interlocutorUID : string  = ''; 


  ngFireUploadTask: AngularFireUploadTask;

  progressNum: Observable<number>;

  progressSnapshot: Observable<any>;

  fileUploadedPath: Observable<string>;

  files: Observable<imgFile[]>;

  FileName: string;
  FileSize: number;

  isImgUploading: boolean;
  isImgUploaded: boolean;
  allMsg:any[];
  private basePath = '/uploads';
  myallmsgId:any
  currentUser
  private ngFirestoreCollection: AngularFirestoreCollection<imgFile>;

    constructor(
    private chatService: ChatService,
     private router: Router,
    //  private camera: CameraService,
    //  private imagePicker: ImagePicker,
    //  private mediaCapture: MediaCapture,
    //  private file: File,
    //  private media: Media,
    //  private streamingMedia: StreamingMedia,
    //  private photoViewer: PhotoViewer,
    //  private actionSheetController: ActionSheetController,
    //  private plt: Platform,
    //  private toastCtrl: ToastController,
    //  private storage: AngularFireStorage,
    //  private afs: AngularFirestore,
     private db: AngularFireDatabase,
     private alertCtrl:AlertController,
     private angularFirestore: AngularFirestore,
     private angularFireStorage: AngularFireStorage,
     private afAuth: AngularFireAuth,

     ) { 
      this.afAuth.onAuthStateChanged((user) => {
        this.currentUser = user;      
      });
      this.isImgUploading = false;
    this.isImgUploaded = false;
    
    this.ngFirestoreCollection = angularFirestore.collection<imgFile>('filesCollection');
    this.files = this.ngFirestoreCollection.valueChanges();
     }
 
  ngOnInit() {
 
    this.messages = this.chatService.getChatMessages();
 
  
     this.messages.subscribe(res=>{
  
      this.allMsg = res;
      // console.log("my all msg",this.allMsg)
     
      this.allMsg.find(x =>{
        // console.log(x)

        x.id
       this.myallmsgId=x.id
        // console.log("message id",this.myallmsgId)
      } )
    })
  }
 
  sendMessage() {
    this.chatService.addChatMessage(this.newMsg).then(() => {
      // console.log("image ",this.imageFile)
      console.log(" msg",this.newMsg)
      this.newMsg = '';
      // this.imageFile='';
      this.content.scrollToBottom();
    
    });
  }

  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

 // file upload on firebase


  fileUpload(event: FileList) {
   
      
    const file = event.item(0)
    // const filePath = `${this.basePath}/${event.file.name}`;

    if (file.type.split('/')[0] !== 'image') { 
      console.log('File type is not supported!')
      return;
    }

    this.isImgUploading = true;
    this.isImgUploaded = false;

    this.FileName = file.name;

    const fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;

    const imageRef = this.angularFireStorage.ref(fileStoragePath);

    this.ngFireUploadTask = this.angularFireStorage.upload(fileStoragePath, file);

    this.progressNum = this.ngFireUploadTask.percentageChanges();
    this.progressSnapshot = this.ngFireUploadTask.snapshotChanges().pipe(
      
      finalize(() => {
        this.fileUploadedPath = imageRef.getDownloadURL();
        
        this.fileUploadedPath.subscribe(resp=>{
          this.fileStorage({
            name: file.name,
            filepath: resp,
            // size: this.FileSize
          });
        //  const filePath = `${this.basePath}/${fileUpload.file.name}`;
          this.isImgUploading = false;
          this.isImgUploaded = true;
        },error => {
          console.log(error);
        })
      }),
      // tap(snap => {
      //     this.FileSize = snap.totalBytes;
      // })
    )
}


fileStorage(image: imgFile) {
    const ImgId = this.angularFirestore.createId();
    
    this.ngFirestoreCollection.doc(ImgId).set(image).then(data => {
      console.log(data);
    }).catch(error => {
      console.log(error);
    });
}  

deleteImage(img){
  console.log("delete image",img)
 
  this.angularFireStorage.storage.refFromURL(img.filepath).delete();

  // Delete the file
  

//   this.deleteFileDatabase(img.name)
//   .then(() => {
//     this.deleteFileStorage(img.name);
//   })
//   .catch(error => console.log(error));

// }

// private deleteFileDatabase(name: string): Promise<void> {
// return this.db.list(filepath).remove(name);
// }

// private deleteFileStorage(name: string): void {
// const storageRef = this.angularFireStorage.ref(filepath);
// storageRef.child(name).delete();

}
  fileStoragePath(fileStoragePath: any) {
    throw new Error('Method not implemented.');
  }



async deleteMsg (message) {
  const alert = await this.alertCtrl.create({
    cssClass: 'my-alert-class',
    header: 'Alert |',
    subHeader: '',
    message: 'Do you want to delete this message.',
    buttons:
    [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => {
          console.log('Confirm Cancel: blah');
        }
      }, {
        text: 'Okay',
        handler: () => {
          //delete message from firestoredatabase
          // console.log('Confirm Okay, message id=',message.id);
            firebase.firestore().collection("messages").doc(message.id).delete().then(() => {
              console.log("Document successfully deleted!");
          }).catch((error) => {
              console.error("Error removing document: ", error);
          });           
        }
      }
    ]
  });

  await alert.present();

 } 

 updateMsg(message){
  firebase.firestore().collection("messages").doc(message.id).update({
    msg: 'my new message',
    // imageFile:imageFile,
    from: this.currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log("Document successfully update!");
}).catch((error) => {
    console.error("Error removing document: ", error);
});  
 }
}


