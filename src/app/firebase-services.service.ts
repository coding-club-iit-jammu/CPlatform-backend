import { Injectable } from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseServicesService {

  course: string;
  userid: string;
  constructor(private firedata: AngularFireDatabase,
              private firestore: AngularFireStorage) { }

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
        s = Object.keys(temp);
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

  async fetchCourseAssignments(code: string){
    const database = this.firedata.database;
    var temp;
    await database.ref("courses").child(code).child(code.substring(8)).child("assignments").once('value',function(snapshot){
      temp = snapshot.val();
    });
    var tempUser;
    let userid = this.userid;
    await database.ref("users").child(userid).child("courses").child(code).child("assignment").once('value',function(snapshot){
      tempUser = snapshot.val();
    }).then(()=>{
      console.log(tempUser);
      for(var i=0; i<tempUser.length;i++){
        if(tempUser[i]!=undefined && tempUser[i]!=null){
          temp[i]["securedmarks"]=tempUser[i].marks;
          temp[i]["submission_time"]=tempUser[i]["submission_time"];
          temp[i]["link"]=tempUser[i].link;
        }
      }
    });
    temp.shift();
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

  async uploadFile(path:string,file:any){
    const store = this.firestore.storage;
    store.ref(path).put(file).then(()=>{
      console.log("Upload Successful")
    }).catch(()=>{
      console.log("Upload Unsuccessful")
    });
  }

  setCourse(c:string){
    this.course = c;
  }

  getCourse(){
    return this.course;
  }

  setUserID(c:string){
    this.userid = c;
  }

  getUserID(){
    return this.userid;
  }

}
