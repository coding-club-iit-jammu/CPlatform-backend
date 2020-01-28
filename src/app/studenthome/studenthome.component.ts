import { Component, OnInit } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseServicesService } from '../firebase-services.service';

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

  pastTests: Array<Test> = [];
  ongoingTests: Array<Test> = [];

  constructor(private fireauth: AngularFireAuth, private firedata: AngularFireDatabase,
              private firebaseService: FirebaseServicesService) { }


  async ngOnInit() {
    this.student.username = this.fireauth.auth.currentUser.email.split('@')[0];
    let temp = await this.firebaseService.fetchNameBranchStudent(this.student.username);
    this.student.name = temp["name"];
    this.student.branch = temp["branch"];
    console.log(this.student);
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