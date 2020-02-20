import { Component, OnInit } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseServicesService } from '../firebase-services.service';
import { Router } from '@angular/router';

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

  constructor(private fireauth: AngularFireAuth, private firedata: AngularFireDatabase,
              private firebaseService: FirebaseServicesService,
              private router: Router) { }


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
    this.student.username = this.fireauth.auth.currentUser.email.split('@')[0];
    let temp = await this.firebaseService.fetchNameBranchStudent(this.student.username);
    this.student.name = temp["name"];
    this.student.branch = temp["branch"];
    let s = await this.firebaseService.fetchCourses(this.student.username);
    await this.fillCourses(s);
    console.log(this.courses);
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