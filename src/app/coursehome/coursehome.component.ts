import { Component, OnInit, ViewChild } from '@angular/core';
import { FormatdatePipe } from '../formatdate.pipe';
import { StoreInfoService } from '../services/store-info.service'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-coursehome',
  templateUrl: './coursehome.component.html',
  styleUrls: ['./coursehome.component.css']
})
export class CoursehomeComponent implements OnInit {

  constructor(
              private storeInfo: StoreInfoService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private formBuilder: FormBuilder
              ) { }

  view:number = 1;

  instructors:Array<String> =[];
  teachingAssistants:Array<String> =[];
  joiningCode = {};
  showSpinner:boolean = false;
  code:string="";
  role:string;
  joiningCodes: Object = {
    instructor: '',
    teachingAssistant: '',
    student: ''
  }

  posts:Array<Object> = [];
  assignments:Array<Object> = [];
  tests:Array<Object> = [];

  postForm: FormGroup;
  assignmentForm: FormGroup;
  testForm: FormGroup;
  file:any;
  
  course:any={
    title:"",
    instructors:[],
    teachingAssistants:[]
  };
  // assignments:any = [];
  selectedAssignment:number;
  assignmentCounts:number = 0;
  submissionPossible=true;
  time: Date;
  fileName:string;
  userType:string;
  instructor:boolean = false;
  marksUpload:any;
  assignmentDoc:any = null;

  async ngOnInit() {
  
    this.showSpinner = true;

    this.resetPostForm();
    this.resetAssignmentForm();

    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.role = this.storeInfo.role[this.code];
    console.log(this.role);
    if(!this.role){
      this.router.navigateByUrl('/home');
      return;
    }
    
    const options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('role',this.role).set('code',this.code)
    };
    
    // Retrieving Title Instructors and TA info from 
    await this.http.get(this.storeInfo.serverUrl+'/course/getInfo', options).toPromise().then(data=>{
      
      this.course = data;
      this.posts = data['posts'];

      if(this.role == 'instructor'){
        this.getJoiningCodes();
      }
      this.showSpinner = false;
    },error => {
      alert(error.message)
      this.showSpinner = false;
    })
    

    
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
  }
  
  async setView(tabvalue){
    this.view = tabvalue;
    if(tabvalue == 1){
      await this.getPosts();
    }
  }
  
  
  getJoiningCodes(){
    this.showSpinner = true;
    const options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('courseId',this.course._id)
    };
    
    this.http.get(this.storeInfo.serverUrl+'/course/getJoiningCodes', options).subscribe(data=>{
      this.joiningCodes = data['joiningCode'];
    },error => {
    })
    
  }

  async createPost(data: Object){
    const options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    data['courseId'] = this.course._id;
    document.getElementById('postModalClose').click();
    this.showSpinner = true;
    await this.http.post(this.storeInfo.serverUrl+'/course/addPost', data, options).toPromise().then( async (resData) => {
      await this.getPosts();
      console.log(resData);
      this.resetPostForm();
    },error => {
    })
    this.showSpinner = false;
  }

  resetPostForm(){
    this.postForm = this.formBuilder.group({
      title: this.formBuilder.control(''),
      description: this.formBuilder.control('')
    })
  }

  createAssignment(data: Object){
    const options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    if(this.file)
      data['file'] = this.file;
    let tempData = new FormData();
    
    for(let x in data){
      tempData.append(x,data[x]);
    }
    console.log(tempData);
    this.http.post(this.storeInfo.serverUrl+'/course/addAssignment', tempData, options).subscribe( resData => {
      console.log(resData);
    },error => {
    })
  }

  resetAssignmentForm(){
    this.assignmentForm = this.formBuilder.group({
      title : this.formBuilder.control('',Validators.required),
      description : this.formBuilder.control('',Validators.required),
      marks: this.formBuilder.control('',Validators.required),
      deadline: this.formBuilder.control('',Validators.required),
      file: this.formBuilder.control('')
    });
  }

  createTest(data: Object){
    const options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    
    this.http.post(this.storeInfo.serverUrl+'/course/addTest', data, options).subscribe( resData => {
      console.log(resData);
    },error => {
    })
  }

  resetTestForm(){

  }

  async getPosts(){
    this.showSpinner = true;
    const options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params : new HttpParams().set('courseId',this.course._id)
    };
    
    this.http.get(this.storeInfo.serverUrl+'/course/getPosts', options).subscribe( resData => {
      this.posts = resData['posts'];
      this.showSpinner = false;
    },error => {
    })
  }

  getAssignments(){
    console.log("Getting Assignments")
  }

  getTests(){
    console.log("Getting Tests")
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      this.fileName = event.target.files[0].name;
      this.file = event.target.files[0];
    }
  }
  // checkStatus(date: string){
  
  //   var dd = new Date(date);
  
  //   return dd.getTime() > this.time.getTime();
  
  // }

  
  
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