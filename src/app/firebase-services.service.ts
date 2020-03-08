import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { TimeAPIClientService } from './services/time-apiclient.service';
import { StoreInfoService } from './services/store-info.service'
import { auth } from 'firebase/app';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class FirebaseServicesService {

  course: string;
  userid: string;
  userType: string;

  constructor(private firedata: AngularFireDatabase,
              private firestore: AngularFireStorage,
              private timeApi: TimeAPIClientService,
              private infoService: StoreInfoService,
              private fireAuth: AngularFireAuth,
              private router: Router) { }

  async fetchUserType(username:string){
    const database = this.firedata.database;
    let type = "";
    await database.ref('users/').child(username).child('type').once('value',snapshot=>{
      type = snapshot.val();
    }).then(()=>{
      this.userType = type;
    });
    return type;
  }

  async fetchCourses(username:string){
    const database = this.firedata.database;
    let s = [];
    var temp;
    await database.ref('users/').child(username).child('courses').once('value',snapshot=>{
      temp = snapshot.val();
    }).then(()=>{
        s = Object.keys(temp);
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
    var temp:any;
    await database.ref("courses").child(code).child(code.substring(8)).once('value',function(snapshot){
      temp = snapshot.val()
    });
    return temp;
  }

  async getCoursesData(){
    var list = [];
    var courseCodes = Object.keys(this.infoService.userData.courses);
    var i = 0;
    for(var x of courseCodes){
      await this.getCourseData(x,0);
    }
  }
  async getCourseData(course, i){
    var temp = await this.getCourseDetails(course);
    this.infoService.coursesData[course] = temp;
  }

  async getUserData(userid:string){
    const database = this.firedata.database;
    var temp;
    await database.ref('users').child(userid).once('value',function(snapshot){
      temp = snapshot.val();
    }).then(async ()=>{
      this.infoService.userData = temp;
      await this.getCoursesData();
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
    var url;
    await fileRef.put(file).then(async (snapshot)=>{
      await snapshot.ref.getDownloadURL().then(function(downloadURL){
        url = downloadURL;
      })

      await database.ref('courses').child(temp[0]).child('course').child("assignments").child(temp[1].substring(10)).child(temp[2]).set({
        "time" : time.toString(),
        "link" : url 
      });

      await database.ref("users/").child(temp[2]).child('courses').child(temp[0]).child('assignments').child(temp[1].substring(10)).child("time").set(time.toString()).then(()=>{
      }).catch((error)=>{
        console.log(error);
      });
    
      await database.ref("users/").child(temp[2]).child('courses').child(temp[0]).child('assignments').child(temp[1].substring(10)).child("link").set(url).then(()=>{
      }).catch((error)=>{
          console.log(error);
      });
      
      await database.ref("users/").child(temp[2]).child('courses').child(temp[0]).child('assignments').child(temp[1].substring(10)).child("number").set(temp[1].substring(10));

    }).catch(()=>{
      alert("Upload Unsuccessful")
      return null;
    });
    
    alert("Upload Successful")

    var result = {
      time: time.toString(),
      link: url,
      number:temp[1].substring(10)
    }

    return result;
  }


  async fetchAllSubmissions(course,assignmentNo){
    const database =  this.firedata.database;
    var jsonObject;
    await database.ref('courses').child(course).child('course').child('assignments').child(assignmentNo).once('value',function(snapshot){
      jsonObject = snapshot.val()
    }).catch(()=>{
      alert("Unable to Download submissions.")
    })
    return jsonObject;
  }

  async downloadFile(path){
    window.open(path,"_blank");
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
    }).then(()=>{
      this.infoService.userType = type;
      this.userType = type;
    });
    return type;
  }

  getCurrentUser() {
    const auth = this.fireAuth.auth;
    return new Promise((resolve, reject) => {
       const unsubscribe = auth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
       }, reject);
    });
  }

  async AuthLogin(provider) {
    return await this.fireAuth.auth.signInWithPopup(provider)
    .then((res) => {
      this.userid = res.user.email.split('@')[0].replace('.','');
    }).catch((error) => {
      console.log(error)
    })
  } 

  async GoogleAuth() {
    return await this.AuthLogin(new auth.GoogleAuthProvider());
  }  

  async userExists(userid){
      const database = this.firedata.database;
      var name = null;
      try{
        await database.ref('users').child(userid).child("name").once('value',function(snapshot){
          name = snapshot.val()
        }).catch(()=>{

        });
      } catch(err){
        return false;
      }
      if(name == undefined || name == null)
        return false
      else 
        return true;
  }

  async createUser(value){
    const database = this.firedata.database;
    await database.ref("users").child(this.userid).child("name").set(value.fullName);
    await database.ref("users").child(this.userid).child("type").set(value.userType);
    await database.ref("users").child(this.userid).child("branch").set(value.branch);
  }

  async addStudentsInCourse(courseCode,students){
    const database = this.firedata.database;
    await database.ref('courses').child(courseCode).child('course/students').set(students).then(async ()=>{
      var entryNo = Object.keys(students);
      for(let x of entryNo){
        await database.ref("users").child(x).child("courses").child(courseCode).child("code").set(courseCode);
      }
    });
  }

  async uploadMarksForAssignment(courseCode, assignmentNo, marks){
    const database = this.firedata.database;
    var entryNo = Object.keys(marks);
    for(var i = 0; i < entryNo.length; i++){
      await database.ref("users").child(entryNo[i]).child("courses").child(courseCode).child("assignments").child(assignmentNo).child("marks").set(marks[entryNo[i]]);
    }
  }

  signout(){
    this.fireAuth.auth.signOut().then(()=>{
      alert("Logged Out")
      this.router.navigateByUrl('')
    }).catch(()=>{
      alert("Try Again....");
    })
  }
}
