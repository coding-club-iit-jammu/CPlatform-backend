import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { TimeAPIClientService } from './services/time-apiclient.service';
import { StoreInfoService } from './services/store-info.service'
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseServicesService {

  course: string;
  userid: string;
  constructor(private firedata: AngularFireDatabase,
              private firestore: AngularFireStorage,
              private timeApi: TimeAPIClientService,
              private infoService: StoreInfoService,
              private fireAuth: AngularFireAuth) { }

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
    await database.ref("users").child(userid).child("courses").child(code).child("assignments").once('value',function(snapshot){
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
    var temp:any;
    await database.ref("courses").child(code).child(code.substring(8)).once('value',function(snapshot){
      temp = snapshot.val()
    });
    return temp;
  }

  async getCoursesData(){
    var list = [];
    var courseCodes = Object.keys(this.infoService.userData.courses);
    console.log(courseCodes);
    for(var x of courseCodes){
      await this.getCourseData(x);
    }
    console.log(this.infoService.userData);
  }
  async getCourseData(course:string){
    
    var temp = await this.getCourseDetails(course);
    this.infoService.userData.courses.course = ""
    this.infoService.userData.courses.course = Object.assign(this.infoService.userData.courses.course,temp);
  }

  async getUserData(userid:string){
    const database = this.firedata.database;
    var temp;
    await database.ref('users').child(userid).once('value',function(snapshot){
      temp = snapshot.val();
    }).then(()=>{
      this.infoService.userData = temp;
      this.getCoursesData();
      return true;
    }).catch(()=>{
      return false;
    })
  }

  async uploadFile(path:string,file:any){
    var temp = path.split("/")
    // const storage = this.firestore.storage;
    const database = this.firedata.database;
    var time;
    await this.timeApi.getTime().then((data)=>{
      time = new Date(data);
    });
    const fileRef = this.firestore.ref(path);
    const task = await this.firestore.upload(path, file);
    await database.ref("users/").child(temp[2]).child('courses').child(temp[0]).child('assignments').child(temp[1].substring(10)).child("time").set(time.toString()).then(()=>{
    }).catch((error)=>{
      console.log(error);
    });
    await database.ref("users/").child(temp[2]).child('courses').child(temp[0]).child('assignments').child(temp[1].substring(10)).child("number").set(temp[1].substring(10));
    alert("Upload Successful")
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

  async getUserType(){
    const database = this.firedata.database;
    var username = this.userid;
    var type:string;
    await database.ref('users/').child(username).child('type').once('value',(snapshot)=>{
      type = snapshot.val();
    });
    return type;
  }

  checkAuth(){
    let username = this.fireAuth.auth.currentUser
    console.log(username)
    if(username!=undefined && username!=null)
      return true;
    else  
      return false;
  }

}
