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
  userType:string;
  showSpinner:boolean = false;

  async gettime(){
    await this.timeApi.getTime().then(data=>{
      this.time = new Date(data);
    })
  }


  async ngOnInit() {
  
    this.showSpinner = true;
    
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

    // this.userType = this.infoService.userType;
    this.code = this.infoService.selectedCourse;
  
    await this.timeApi.getTime().then(data=>{
      this.time = new Date(data);
    });
  
    this.course = await this.infoService.getCourseDetails(this.code);
    this.assignments = await this.infoService.fetchCourseAssignments(this.code);
  
    this.showSpinner = false;
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
  
  
  async uploadSubmission(assignmentNo:number){
  
    this.showSpinner = true;
    var userId = this.firebaseService.getUserID();
    var path = this.code + "/Assignment" + assignmentNo + "/" + userId + "/" + this.fileName;  
  
    var result = await this.firebaseService.uploadFile(path, this.file);
    // this.assignments = this.infoService.updateCourseAssignments(this.code,result);
    this.showSpinner = false;
    console.log(this.assignments[assignmentNo-1])
    if(result != null){
      this.assignments[assignmentNo-1].link = result.link
      this.assignments[assignmentNo-1].time = result.time
        // this.assignments[assignmentNo].link = result.link
      // this.router.navigateByUrl('/'+this.infoService.userType)
    }
  }

  downloadSubmission(link):void {
    this.showSpinner = true;
    this.firebaseService.downloadFile(link); 
    this.showSpinner = false;
  }

}

interface Course{
  code: string;
  title:string;
  instructor:string;
  ta:Array<string>;
}