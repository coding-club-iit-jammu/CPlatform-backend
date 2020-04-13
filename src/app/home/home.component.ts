import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreInfoService } from '../services/store-info.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  httpOptions: any;
  showSpinner: Boolean = false;

  addCourseForm: FormGroup;
  joinCourseForm: FormGroup;

  userData: any = {
    name : '',
    branch : '',
    email : '',
    courses: {
      teaching: [],
      teachingAssistant: [],
      studying : []
    }
  }
  constructor(private http: HttpClient,
              private storeInfo: StoreInfoService,
              private formBuilder: FormBuilder,
              private router: Router) { 
              }

  ngOnInit() {

    this.joinCourseForm = this.formBuilder.group({
      code : this.formBuilder.control(''),
      joiningCode: this.formBuilder.control('')
    });

    this.addCourseForm = this.formBuilder.group({
      code : this.formBuilder.control(''),
      title : this.formBuilder.control(''),
      instructorCode : this.formBuilder.control(''),
      teachingAssistantCode: this.formBuilder.control(''),
      studentCode: this.formBuilder.control('')
    });

    this.fetchUserData().then(()=>{
      console.log("Fetch Complete.");
    });

  }

  async addCourse(){
    this.showSpinner = true;
    const options = {
      headers : new HttpHeaders({
        'Authorization' : 'Bearer ' + sessionStorage.getItem('token')
      })
    }
    console.log(this.addCourseForm.value);
    this.http.post(this.storeInfo.serverUrl + '/course/add',this.addCourseForm.value,options)
    .subscribe((data)=>{
      console.log(data);
      this.showSpinner = false;
      alert(data['message']);
      this.resetAddCourseForm();

    },(error)=>{
      alert(error);
      this.showSpinner = false;
    })
  }

  async joinCourse(){
    this.showSpinner = true;
    const options = {
      headers : new HttpHeaders({
        'Authorization' : 'Bearer ' + sessionStorage.getItem('token')
      })
    }
    this.http.post(this.storeInfo.serverUrl + '/course/join',this.joinCourseForm.value,options)
    .subscribe((data)=>{
      console.log(data);
      this.showSpinner = false;
      alert(data['message']);
      this.resetJoinCourseForm();

    },(error)=>{
      alert(error);
      this.showSpinner = false;
    })
  }



  async fetchUserData(){
    this.showSpinner = true;
    const options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    this.http.get(this.storeInfo.serverUrl + '/user/get',options).subscribe((data)=>{
      console.log(data);
      this.userData = data;
      this.storeInfo.userData = data;
      this.showSpinner = false;
    }, error =>{
      console.log(error);
    });
  }

  resetAddCourseForm(){
    this.addCourseForm = this.formBuilder.group({
      code : this.formBuilder.control(''),
      title : this.formBuilder.control(''),
      instructorCode : this.formBuilder.control(''),
      teachingAssistantCode: this.formBuilder.control(''),
      studentCode: this.formBuilder.control('')
    });
  }

  resetJoinCourseForm(){
    this.joinCourseForm = this.formBuilder.group({
      code : this.formBuilder.control(''),
      joiningCode: this.formBuilder.control('')
    }); 
  }

  openCourse(code,role){
    this.storeInfo.role[code] = role;
    this.router.navigate(['/course',code]);
  }
}
