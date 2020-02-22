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
  file:any;
  fileName:string;
  async gettime(){
    await this.timeApi.getTime().then(data=>{
      this.time = new Date(data);
    })
  }
  async ngOnInit() {
    this.code = this.firebaseService.getCourse();
    await this.timeApi.getTime().then(data=>{
      this.time = new Date(data);
    });
    this.course = await this.firebaseService.getCourseDetails(this.code);
    this.assignments = await this.firebaseService.fetchCourseAssignments(this.code);
  }

  checkStatus(date: string){
    var dd = new Date(date);
    return dd.getTime() > this.time.getTime();
  }

  public onFileChange(event) {
    const reader = new FileReader();
 
    if (event.target.files && event.target.files.length) {
      this.fileName = event.target.files[0].name;
      this.file = event.target.files[0];
    }
  }
  
  public uploadSubmission(assignmentNo:number): void {
    console.log(this.file);
    var userId = this.firebaseService.getUserID();
    var path = this.code + "/Assignment" + assignmentNo + "/" + userId + "/" + this.fileName;  
    this.firebaseService.uploadFile(path, this.file);
  }

  

}

interface Course{
  code: string;
  title:string;
  instructor:string;
  ta:Array<string>;
}