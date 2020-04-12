import { Component, OnInit, ViewChild } from '@angular/core';
import { FormatdatePipe } from '../formatdate.pipe';
import { StoreInfoService } from '../services/store-info.service'
import { Router, ActivatedRoute, Params } from '@angular/router'

@Component({
  selector: 'app-coursehome',
  templateUrl: './coursehome.component.html',
  styleUrls: ['./coursehome.component.css']
})
export class CoursehomeComponent implements OnInit {

  constructor(
              private infoService: StoreInfoService,
              private router: Router,
              private activatedRoute: ActivatedRoute
              ) { }

  view:number = 1;
  code:string="";
  course:any={
    title:"",
    instructor:""
  };
  assignments:any = [];
  selectedAssignment:number;
  assignmentCounts:number = 0;
  submissionPossible=true;
  time: Date;
  file:any;
  fileName:string;
  userType:string;
  showSpinner:boolean = false;
  instructor:boolean = false;
  marksUpload:any;
  assignmentDoc:any = null;

  // async gettime(){
  //   await this.timeApi.getTime().then(data=>{
  //     this.time = new Date(data);
  //   })
  // }


  async ngOnInit() {
  
    this.showSpinner = true;
    console.log(this.activatedRoute.snapshot.paramMap.get('courseId'));
    // if(this.firebaseService.userid == undefined || this.firebaseService.userid == null){
    //   await this.firebaseService.getCurrentUser().then(async (user)=>{
    //       this.firebaseService.setUserID(user["email"].split('@')[0])
    //     }
    //   ).catch(()=>{
    //     this.router.navigateByUrl('');
    //   })
    // }
    // await this.firebaseService.getUserType();
    // if(this.infoService.selectedCourse == undefined || this.infoService.selectedCourse == null){
      
    //   this.router.navigateByUrl('/'+this.infoService.userType)
    //   return;
    // }
    // if (this.infoService.userType === 'instructor')
    //   this.instructor = true;
    // // this.userType = this.infoService.userType;
    // this.code = this.infoService.selectedCourse;
  
    // await this.timeApi.getTime().then(data=>{
    //   this.time = new Date(data);
    // });
  
    // this.course = await this.infoService.getCourseDetails(this.code);
    // this.assignments = this.infoService.getAssignments(this.code);
    // if(this.assignments != null && this.assignments != undefined)
    //   this.assignmentCounts = this.assignments.length;
    this.showSpinner = false;
  }

  setView(tabvalue){
    this.view = tabvalue;
  }

  
  // checkStatus(date: string){
  
  //   var dd = new Date(date);
  
  //   return dd.getTime() > this.time.getTime();
  
  // }

  public onFileChange(event) {
  
    const reader = new FileReader();
 
    if (event.target.files && event.target.files.length) {
      this.fileName = event.target.files[0].name;
      this.file = event.target.files[0];
    }
  
  }
  
  
  async uploadSubmission(assignmentNo:number){
  
    this.showSpinner = true;
    // var userId = this.firebaseService.getUserID();
    // var path = this.code + "/Assignment" + assignmentNo + "/" + userId + "/" + this.fileName;  
    // if(this.file != null){
    //     var result = await this.firebaseService.uploadFile(path, this.file);
    //     this.showSpinner = false;
    //     if(result != null){
    //       this.assignments[assignmentNo-1].link = result.link
    //       this.assignments[assignmentNo-1].time = result.time
    //     }
    // } else {
    //   alert("No file found.")
    //   this.showSpinner = false;
    // }
  }

  download(data){
    var downloadLink = document.createElement("a");
    var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
		downloadLink.href = url;
		downloadLink.download = "Submissions.json";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
  }
  
  async downloadSubmission(link,number) {
    this.showSpinner = true;
    // if(!this.instructor)
    //   this.firebaseService.downloadFile(link); 
    // else{
    //   var submissions = await this.firebaseService.fetchAllSubmissions(this.code,number);
    //   this.download(submissions);
    // }
    this.showSpinner = false;
  }

  moveBack(){
    this.router.navigateByUrl('/home');
  }

  signout(){
    
  }


  public records: any = {};  
  fileToUpload:any;

  async uploadListener($event: any){  
    this.fileToUpload = $event;      
  }
  
  async uploadMarksListener($event: any){  
    this.marksUpload = $event;      
  }

  uploadMarks(){
    this.showSpinner = true;
    let files = this.marksUpload.srcElement.files;
    if (this.isValidCSVFile(files[0])) {  
  
      let input = this.marksUpload.target;  
      let reader = new FileReader();  
      reader.readAsText(input.files[0]);  
  
      reader.onload = async () => {  
        let csvData = reader.result;  
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);  
        await this.getDataRecordsArrayFromCSVFile(csvRecordsArray, 2, 1);  
      };  
      reader.onerror = function () {  
        console.log('error is occured while reading file!');  
      };  
  
    } else {  
      alert("Please import valid .csv file.");  
      this.fileReset();  
      this.showSpinner = false;
    }
  }

  async addStudents(){

    // document.getElementById("myModal").style.display = "hide";
    // this.showSpinner = true;
    // let files = this.fileToUpload.srcElement.files;
    // if (this.isValidCSVFile(files[0])) {  
  
    //   let input = this.fileToUpload.target;  
    //   let reader = new FileReader();  
    //   reader.readAsText(input.files[0]);  
  
    //   reader.onload = async () => {  
    //     let csvData = reader.result;  
    //     let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);  
    //     await this.getDataRecordsArrayFromCSVFile(csvRecordsArray, 2, 0);  
    //   };  
    //   reader.onerror = function () {  
    //     console.log('error is occured while reading file!');  
    //   };  
  
    // } else {  
    //   alert("Please import valid .csv file.");  
    //   this.fileReset();  
    //   this.showSpinner = false;
    // }
  }
  
  async getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any,flag:number) {  
    // let csvArr = {};  
  
    // for (let i = 0; i < csvRecordsArray.length; i++) {  
    //   let curruntRecord = (<string>csvRecordsArray[i]).split(',');  
    //   if (curruntRecord.length == headerLength) {  
    //     var entryNo = curruntRecord[0].trim()
    //     var name = curruntRecord[1].trim();
    //     csvArr[entryNo] = name;  
    //   }  
    // } 
    // if(flag==0){ 
    // await this.firebaseService.addStudentsInCourse(this.code,csvArr).then(()=>{
    //   alert("Students Enrolled.")
    // }).catch(()=>{
    //   alert("Operation Unsuccessful")
    // })
    
    // } else {
    //   await this.firebaseService.uploadMarksForAssignment(this.code,this.selectedAssignment,csvArr).then(()=>{
    //     alert("Marks Uploaded.")
    //   }).catch(()=>{
    //     alert("Operation Unsuccessful")
    //   })
    // }
    // this.showSpinner = false;
    // return csvArr;  
  }  
  
  isValidCSVFile(file: any) {  
    return file.name.endsWith(".csv");  
  }  
  
  fileReset() {  
    this.records = [];  
  }

  uploadAssignmentDocListener($event){
    this.assignmentDoc = $event.target.files[0];
  }

  async addAssignment(assignmentTitle,assignmentDesc,assignmentDeadline,assignmentMarks){
    
    this.showSpinner = true;
    // var temp = {
    //   title: assignmentTitle,
    //   description: assignmentDesc,
    //   deadline: new Date(assignmentDeadline).toString(),
    //   number: this.assignmentCounts+1,
    //   totalmarks: assignmentMarks,
    //   files: ""
    // }
    // var result = await this.firebaseService.addAssignment(this.code,temp,this.assignmentDoc); 
    // if(result != null){
    //   this.assignmentCounts += 1
    //   this.assignments.push(result)
    // }
    this.showSpinner = false;
  }

  navToHome(){
    this.router.navigateByUrl('/home')
  }

}