import { Component, OnInit, Input } from '@angular/core';
import { FirebaseServicesService } from '../firebase-services.service';

@Component({
  selector: 'app-coursehome',
  templateUrl: './coursehome.component.html',
  styleUrls: ['./coursehome.component.css']
})
export class CoursehomeComponent implements OnInit {

  constructor(private firebaseService: FirebaseServicesService) { }

  course: Course = {
    code:"",
    title:"",
    instructor:"",
    ta:[]
  };
  ngOnInit() {
    this.course.code = this.firebaseService.getCourse();
    console.log(this.course.code);
  }

  

}

interface Course{
  code: string;
  title:string;
  instructor:string;
  ta:Array<string>;
}