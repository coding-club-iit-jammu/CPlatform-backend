import { Injectable } from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseServicesService {

  constructor(private firedata: AngularFireDatabase) { }

  async fetchUserType(username:string){
    const database = this.firedata.database;
    let type = "";
    await database.ref('users/').child(username).child('type').once('value',snapshot=>{
      type = snapshot.val();
    });
    return type;
  }
}
