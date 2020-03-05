import { Component, OnInit } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseServicesService } from '../firebase-services.service';
import { Router } from '@angular/router';
import { StoreInfoService } from '../services/store-info.service' 

@Component({
  selector: 'app-studenthome',
  templateUrl: './studenthome.component.html',
  styleUrls: ['./studenthome.component.css']
})
export class StudenthomeComponent implements OnInit {

  student: Student = {
    name : "",
    username : "",
    branch : ""
  };
  unsubscribe:any;
  courses:any=[];
  pastTests: Array<Test> = [];
  ongoingTests: Array<Test> = [];
  showSpinner:boolean = true;
  constructor(private fireauth: AngularFireAuth, private firedata: AngularFireDatabase,
              private firebaseService: FirebaseServicesService,
              private router: Router,
              private infoService: StoreInfoService) { }

  async fillData(){
    this.student.username = this.firebaseService.getUserID();
    await this.firebaseService.getUserData(this.student.username).then(async (data)=>{
      this.showSpinner = false;
    }).catch(()=>{
      alert("Something went wrong.....");
      this.showSpinner = false;
      this.router.navigateByUrl('/')
    })
    
    this.student.name = this.infoService.getName();
    this.student.branch = this.infoService.getBranch()
    this.infoService.userData.username = this.student.username;
    
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

}

interface Student{
    name: string;
    username: string;
    branch: string;
}

interface Test{
  id: string;
  course: Date;
  title: string;
}