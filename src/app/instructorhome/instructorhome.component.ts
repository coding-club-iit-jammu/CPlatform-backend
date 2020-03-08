import { Component, OnInit } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseServicesService } from '../firebase-services.service';
import { Router } from '@angular/router';
import { StoreInfoService } from '../services/store-info.service' 

@Component({
  selector: 'app-instructorhome',
  templateUrl: './instructorhome.component.html',
  styleUrls: ['./instructorhome.component.css']
})
export class InstructorhomeComponent implements OnInit {

  instructor = {
    name : "",
    username : "",
    branch : ""
  };
  courses:any=[];
  showSpinner:boolean = true;
  newCourse:any ={
    code:"",
    title:"",
    instructor:this.instructor.name
  }
  constructor(private fireauth: AngularFireAuth, private firedata: AngularFireDatabase,
              private firebaseService: FirebaseServicesService,
              private router: Router,
              private infoService: StoreInfoService) { }

  async fillData(){
    this.instructor.username = this.firebaseService.getUserID();
    await this.firebaseService.getUserData(this.instructor.username).then(async (data)=>{
      this.showSpinner = false;
    }).catch(()=>{
      alert("Something went wrong.....");
      this.showSpinner = false;
      this.router.navigateByUrl('/')
    })
    
    this.instructor.name = this.infoService.getName();
    this.instructor.branch = this.infoService.getBranch()
    this.infoService.userData.username = this.instructor.username;
    
    this.courses = this.infoService.getCourseList()
  }

  async ngOnInit() {
    if(this.firebaseService.userid == undefined || this.firebaseService.userid == null){
      await this.firebaseService.getCurrentUser().then((user)=>{
          this.firebaseService.setUserID(user["email"].split('@')[0])
        }
      ).catch(()=>{
        this.router.navigateByUrl('');
      })
    }
    await this.firebaseService.getUserType();
    if(this.firebaseService.userType!="instructor"){
      alert("Access Denied");
      this.router.navigateByUrl('');
    }
    await this.fillData();
    this.showSpinner = false;
  }

  navToCourse(courseCode:string){
    this.infoService.selectedCourse = courseCode;
    sessionStorage.setItem('selectedCourse',courseCode);
    this.router.navigateByUrl('/course'); 
  }

  signout(){
    this.fireauth.auth.signOut().then(()=>{
      alert("Logged Out")
      this.router.navigateByUrl('')
    }).catch(()=>{
      alert("Try Again....");
    })
  }

  async createCourse(newCourseCode,newCourseTitle){
    this.showSpinner = true;
    if(newCourseCode == "" || newCourseTitle == ""){
      alert("Please fill all the fields.")
    } else {
      this.newCourse.code = newCourseCode;
      this.newCourse.title = newCourseTitle;
      this.newCourse.instructor = this.instructor.name
      await this.firebaseService.createCourse(this.newCourse);
      (this.courses).push({code:newCourseCode,title:newCourseTitle});
    }
    this.showSpinner = false;
  }
}
