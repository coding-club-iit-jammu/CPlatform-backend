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

  courses:any=[];
  pastTests: Array<Test> = [];
  ongoingTests: Array<Test> = [];
  showSpinner:boolean = true;
  constructor(private fireauth: AngularFireAuth, private firedata: AngularFireDatabase,
              private firebaseService: FirebaseServicesService,
              private router: Router,
              private infoService: StoreInfoService) { }


  async fillCourses(codes){
    this.courses=[]
    for(let c of codes){
        let ti = await this.firebaseService.fetchCourseTitle(c);
        let temp = {
          code:c,
          title:ti
        };
        this.courses.push(temp);
    }
  }

  async ngOnInit() {
    if(this.fireauth.auth.currentUser==undefined || this.fireauth.auth.currentUser==null){
      this.showSpinner = false;
      this.router.navigateByUrl('/');
    }
    this.student.username = this.fireauth.auth.currentUser.email.split('@')[0];
    await this.firebaseService.getUserData(this.student.username).then((data)=>{
      this.showSpinner = false;
      console.log(this.infoService.userData);
    }).catch(()=>{
      alert("Something went wrong.....");
      this.showSpinner = false;
      this.router.navigateByUrl('/')
    })
    if(this.infoService.name==undefined || this.infoService.name==null){
      let temp = await this.firebaseService.fetchNameBranchStudent(this.student.username);
      this.student.name = temp["name"];
      this.student.branch = temp["branch"];
      this.infoService.setUserDetails(this.student.username,this.student.name,this.student.branch);
    } else {
      this.student.name = this.infoService.name;
      this.student.branch = this.infoService.branch;
    }
    if(this.infoService.courses==undefined || this.infoService.courses==null){
      let s = await this.firebaseService.fetchCourses(this.student.username);
      await this.fillCourses(s);
      this.infoService.courses = this.courses;
    } else {
      this.courses = this.infoService.courses;
    }
    this.showSpinner = false;
  }

  navToCourse(courseCode:string){
    this.firebaseService.setCourse(courseCode);
    this.router.navigateByUrl('/course'); 
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