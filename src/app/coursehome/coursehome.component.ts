import { Component, OnInit, Input } from '@angular/core';
import { FirebaseServicesService } from '../firebase-services.service';

@Component({
  selector: 'app-coursehome',
  templateUrl: './coursehome.component.html',
  styleUrls: ['./coursehome.component.css']
})
export class CoursehomeComponent implements OnInit {

  constructor(private firebaseService: FirebaseServicesService) { }

  code:string;
  course:any={
    title:"",
    instructor:""
  };
  assignments:any;
  async ngOnInit() {
    this.code = this.firebaseService.getCourse();
    this.course = await this.firebaseService.getCourseDetails(this.code);
    this.assignments = await this.firebaseService.fetchCourseAssignments(this.code);
    console.log(this.assignments);
  }

  

}

interface Course{
  code: string;
  title:string;
  instructor:string;
  ta:Array<string>;
}