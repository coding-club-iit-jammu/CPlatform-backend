import { Component, OnInit, Input } from '@angular/core';
import { FirebaseServicesService } from '../firebase-services.service';
import { FormatdatePipe } from '../formatdate.pipe';
import { TimeAPIClientService } from '../services/time-apiclient.service';
@Component({
  selector: 'app-coursehome',
  templateUrl: './coursehome.component.html',
  styleUrls: ['./coursehome.component.css']
})
export class CoursehomeComponent implements OnInit {

  constructor(private firebaseService: FirebaseServicesService,
    private timeApi: TimeAPIClientService) { }

  code:string;
  course:any={
    title:"",
    instructor:""
  };
  assignments:any;
  submissionPossible=true;
  time: Date;

  async getTime(){
    await this.timeApi.getTime().then(data=>{
      this.time = data;
    })
  }
  async ngOnInit() {
    this.code = this.firebaseService.getCourse();
    await this.timeApi.getTime().then(data=>{
      this.time = data;
    });
    this.course = await this.firebaseService.getCourseDetails(this.code);
    this.assignments = await this.firebaseService.fetchCourseAssignments(this.code);
  }

  async checkStatus(date: string){
    var dd = new Date(date);
    return dd.getTime() > this.time.getTime();
  }

  

}

interface Course{
  code: string;
  title:string;
  instructor:string;
  ta:Array<string>;
}