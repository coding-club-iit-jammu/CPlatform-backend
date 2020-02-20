import { Injectable } from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseServicesService {

  course: string;
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

  async fetchCourses(username:string){
    const database = this.firedata.database;
    let s = [];
    var temp;
    await database.ref('users/').child(username).child('courses').once('value',snapshot=>{
      temp = snapshot.val();
    }).then(()=>{
        s = Object.values(temp);
        console.log(s);
    });
    return s;
  }

  async fetchCourseTitle(code:string){
    const database = this.firedata.database;
    var temp;
    await database.ref("courses").child(code).child(code.substring(8)).once('value',function(snapshot){
      temp = snapshot.val().title;
    });
    return temp;
  }

  async getCourseDetails(code:string){
    const database = this.firedata.database;
    var temp = {
      title:"",
      instructor:""
    };
    await database.ref("courses").child(code).child(code.substring(8)).once('value',function(snapshot){
      temp.title = snapshot.val().title;
      temp.instructor = snapshot.val().instructor;
    });
    return temp;
  }

  setCourse(c:string){
    this.course = c;
  }

  getCourse(){
    return this.course;
  }

}
