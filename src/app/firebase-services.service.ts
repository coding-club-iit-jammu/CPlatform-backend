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

  async fetchNameBranchStudent(username:string){
    const database = this.firedata.database;
    let s = {};
    var temp;
    await database.ref('users/').child(username).child('name').once('value',snapshot=>{
      temp = snapshot.val();
    }).then(()=>{
      s["name"] = temp;
    });
    await database.ref('users/').child(username).child('branch').once('value',snapshot=>{
      temp = snapshot.val();
    }).then(()=>{
      s["branch"] = temp;
    });
    return s;
  }
}
