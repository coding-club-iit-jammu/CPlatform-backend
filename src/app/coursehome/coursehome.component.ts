import { Component, OnInit, ViewChild } from '@angular/core';
import { FormatdatePipe } from '../formatdate.pipe';
import { StoreInfoService } from '../services/store-info.service'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MaterialComponentService } from '../services/material-component.service';
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
              private formBuilder: FormBuilder,
              private matComp: MaterialComponentService
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
  submitAssignmentForm: FormGroup;
  shiftDeadlineForm: FormGroup;

  file:any;
  
  course : any ={
    title:"",
    instructors:[],
    teachingAssistants:[],
    posts:[],
    assignments:[],
    _id:'',
    role:''
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
    this.resetSubmitAssignmentForm();
    this.resetShiftDeadlineForm();

    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    
    if(!sessionStorage.getItem('token')){
      this.router.navigateByUrl('/');
      return;
    }
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getInfo', options).toPromise().then(data=>{
      if(data['status'] == 200){
        this.course = data['body'];
        this.course.posts = this.course.posts.reverse();
        if(this.course.role == 'instructor'){
          this.getJoiningCodes();
        }
      } else {
        this.matComp.openSnackBar(data['body']['message'],2000);
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
    } else {
      await this.getAssignments();
    }
  }
  
  
  getJoiningCodes(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('courseCode',this.code)
    };
    
    this.http.get(this.storeInfo.serverUrl+'/course/getJoiningCodes', options).subscribe(data=>{
      if(data['status'] == 200){
        this.joiningCodes = data['body']['joiningCode'];
      } else {
        this.matComp.openSnackBar(data['body']['message'],2000);
      }
    },error => {
      this.matComp.openSnackBar(error,2000);
    })
    
  }

  async createPost(data: Object){
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    data['courseCode'] = this.code;
    document.getElementById('postModalClose').click();
    this.showSpinner = true;
    await this.http.post(this.storeInfo.serverUrl+'/course/addPost', data, options).toPromise().then( async (resData) => {
      if(resData['status'] == 201){
        await this.getPosts();
        this.resetPostForm();
      } 
      this.matComp.openSnackBar(resData['body']['message'],2000);
    },error => {
      this.matComp.openSnackBar(error,2000);
    })
    this.showSpinner = false;
  }

  resetPostForm(){
    this.postForm = this.formBuilder.group({
      title: this.formBuilder.control(''),
      description: this.formBuilder.control('')
    })
  }

  resetSubmitAssignmentForm(){
    this.submitAssignmentForm = this.formBuilder.group({
      file: this.formBuilder.control(null,Validators.required),
      assignmentId: this.formBuilder.control('',Validators.required),
      title: this.formBuilder.control('',Validators.required)
    });
  }

  async createAssignment(){
    this.showSpinner = true;
    
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    
    let formData: any = new FormData();
    formData.append("title", this.assignmentForm.get('title').value);
    formData.append("file", this.assignmentForm.get('doc').value);
    formData.append("description", this.assignmentForm.get('description').value);
    formData.append("deadline", this.assignmentForm.get('deadline').value);
    formData.append("marks", this.assignmentForm.get('marks').value);
    formData.append("courseCode", this.code);
    formData.append("requiresSubmission",this.assignmentForm.get('requiresSubmission').value);
    
    await this.http.post(this.storeInfo.serverUrl+'/course/addAssignment', formData, options).toPromise().then(async resData => {
      this.matComp.openSnackBar(resData['body']['message'],2000);  
      if(resData['status'] == 201){
        await this.getAssignments();
        this.resetAssignmentForm();
      }
    },error => {
      this.matComp.openSnackBar(error,2000);
    })

    this.showSpinner = false;
  }

  resetAssignmentForm(){
    this.assignmentForm = this.formBuilder.group({
      title : this.formBuilder.control('',Validators.required),
      description : this.formBuilder.control('',Validators.required),
      marks: this.formBuilder.control('',Validators.required),
      deadline: this.formBuilder.control('',Validators.required),
      requiresSubmission: this.formBuilder.control(true),
      doc: this.formBuilder.control(null)
    });
  }

  resetShiftDeadlineForm(){
    this.shiftDeadlineForm = this.formBuilder.group({
      newDeadline: this.formBuilder.control('',Validators.required),
      assignmentId: this.formBuilder.control('',Validators.required),
      title: this.formBuilder.control('', Validators.required),
      courseCode: this.formBuilder.control('',Validators.required)
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
    let options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params : new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getPosts', options).toPromise().then( resData => {
      if(resData['status'] == 200){
        this.course.posts = resData['body']['posts'].reverse();
      } else {
        this.matComp.openSnackBar(resData['body']['message'],3000);
      }
    },error => {
      this.matComp.openSnackBar(error,2000);
    })
    this.showSpinner = false;
  }

  async getAssignments(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params : new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getAssignments', options).toPromise().then( resData => {
      if(resData['status'] == 200){
        this.course.assignments = resData['body']['assignments'].reverse();
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);
      }
      console.log(resData);
    },error => {
      this.matComp.openSnackBar(error,2000);
    })
    this.showSpinner = false;
  }

  async getAssignmentDoc(assignmentId){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params : new HttpParams().set('courseCode',this.code).set('assignmentId',assignmentId)
    };
    
    this.http.get(this.storeInfo.serverUrl+'/course/getAssignmentDoc', options).subscribe( (resData : Blob) => {
      if(resData['status'] == 200){
        let dataType = resData['body'].type;
        let binaryData = [];
        console.log(dataType);
        binaryData.push(resData['body']);
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData,{type : dataType}));
        downloadLink.target = "_blank";
        document.body.appendChild(downloadLink);
        downloadLink.click();
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);  
      }
    },error => {
      this.matComp.openSnackBar(error,2000);
    })
    this.showSpinner = false;
  }

  getTests(){
    console.log("Getting Tests")
  }

  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.assignmentForm.patchValue({
      doc : file
    });
    this.assignmentForm.get('doc').updateValueAndValidity()
  }

  uploadSubmissionFile(event){
    const file = (event.target as HTMLInputElement).files[0];
    this.submitAssignmentForm.patchValue({
      file : file,
    });
    this.submitAssignmentForm.get('file').updateValueAndValidity()
  }

  setSubmissionAssignment(id,title){
    this.submitAssignmentForm.controls['title'].setValue(title);
    this.submitAssignmentForm.controls['assignmentId'].setValue(id);
  }

  async submitAssignment(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };

    let formData: any = new FormData();
    formData.append("assignmentId", this.submitAssignmentForm.get('assignmentId').value);
    formData.append("file", this.submitAssignmentForm.get('file').value);
    formData.append("courseCode", this.code);
    
    await this.http.post(this.storeInfo.serverUrl+'/course/submitAssignment', formData, options).toPromise().then((resData)=>{
      console.log(resData);
    }, (error) => {
      console.log(error)
    })

    this.showSpinner = false;
  }

  signOut(){
    this.storeInfo.signOut();
    this.router.navigateByUrl('/');
  }

  // onFileChange(event) {
  //   if (event.target.files && event.target.files.length) {
  //     this.fileName = event.target.files[0].name;
  //     this.file = event.target.files[0];
  //   }
  // }
  checkStatus(date: string){
  
    let dd = new Date(date);
    return dd.getTime() > new Date().getTime();
  
  }

  
  
  // async uploadSubmission(assignmentNo:number){
  
    // this.showSpinner = true;
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
  // }

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
  
  async downloadSubmission(assignmentId) {
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params : new HttpParams().set('courseCode',this.code).set('assignmentId',assignmentId)
    };
    this.http.get(this.storeInfo.serverUrl+'/course/getAssignmentSubmission', options).subscribe( (resData : Blob) => {
      if(resData['status'] == 200){
        let dataType = resData['body'].type;
        let binaryData = [];
        console.log(dataType);
        binaryData.push(resData['body']);
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData,{type : dataType}));
        downloadLink.target = "_blank";
        document.body.appendChild(downloadLink);
        downloadLink.click();
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);  
      }
    },error => {
      this.matComp.openSnackBar(error,2000);
    })
    this.showSpinner = false;
  }

  setShiftDeadline(assignmentId,title){
    this.shiftDeadlineForm.controls['title'].setValue(title);
    this.shiftDeadlineForm.controls['assignmentId'].setValue(assignmentId);   
    this.shiftDeadlineForm.controls['courseCode'].setValue(this.code); 
  }

  async shiftDeadline(data){
    this.showSpinner = true;

    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };

    await this.http.post(this.storeInfo.serverUrl+'/assignment/shiftDeadline',data,options).toPromise().then((response)=>{
      if(response['status']==202){
        this.resetShiftDeadlineForm();
        this.getAssignments();
      }
      this.matComp.openSnackBar(response['body']['message'],2000);
    },(error) =>{
      this.matComp.openSnackBar(error,2000);
    })
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