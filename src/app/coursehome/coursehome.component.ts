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
  course:any;
  async ngOnInit() {
    this.code = this.firebaseService.getCourse();
    this.course = await this.firebaseService.getCourseDetails(this.code);  
    console.log(this.course)
  }

  

}

interface Course{
  code: string;
  title:string;
  instructor:string;
  ta:Array<string>;
}