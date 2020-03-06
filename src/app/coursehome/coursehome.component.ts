import { Component, OnInit, Input } from '@angular/core';
import { FirebaseServicesService } from '../firebase-services.service';
import { FormatdatePipe } from '../formatdate.pipe';
import { TimeAPIClientService } from '../services/time-apiclient.service';
import { StoreInfoService } from '../services/store-info.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-coursehome',
  templateUrl: './coursehome.component.html',
  styleUrls: ['./coursehome.component.css']
})
export class CoursehomeComponent implements OnInit {

  constructor(private firebaseService: FirebaseServicesService,
    private timeApi: TimeAPIClientService,
    private infoService: StoreInfoService,
    private router: Router) { }

  code:string="";
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
  
    if(this.firebaseService.userid == undefined || this.firebaseService.userid == null){
      await this.firebaseService.getCurrentUser().then(async (user)=>{
          this.firebaseService.setUserID(user["email"].split('@')[0])
        }
      ).catch(()=>{
        this.router.navigateByUrl('');
      })
    }
  
    if(this.infoService.selectedCourse == undefined || this.infoService.selectedCourse == null){
      await this.firebaseService.getUserType();
      this.router.navigateByUrl('/'+this.infoService.userType)
      return;
    }
  
    this.code = this.infoService.selectedCourse;
  
    await this.timeApi.getTime().then(data=>{
      this.time = new Date(data);
    });
  
    this.course = await this.infoService.getCourseDetails(this.code);
    this.assignments = await this.infoService.fetchCourseAssignments(this.code);
  
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
  
    var userId = this.firebaseService.getUserID();
    var path = this.code + "/Assignment" + assignmentNo + "/" + userId + "/" + this.fileName;  
  
    this.firebaseService.uploadFile(path, this.file);
  
  }

  downloadSubmission(link):void {
    this.firebaseService.downloadFile(link); 
  }

}

interface Course{
  code: string;
  title:string;
  instructor:string;
  ta:Array<string>;
}