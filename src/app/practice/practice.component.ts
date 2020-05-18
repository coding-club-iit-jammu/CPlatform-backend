import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MaterialComponentService } from '../services/material-component.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.css']
})
export class PracticeComponent implements OnInit {

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private storeInfo: StoreInfoService,
              private matComp: MaterialComponentService) { }
  
  showSpinner: Boolean = false;
  view:Number = 0;
  code:String;
  mcqQuestions=[];
  trueFalseQuestions=[];
  codingQuestions=[];

  mcqQuestion = {
    _id:"",
    question:"A",
    options:
          [{
            code: "A",
            option: "A"
           },
           {
            code: "B",
            option: "B"
           }
          ]

  };
  trueFalseQuestion = {
    _id:"",
    question:"A",
    response:true
  };
  codingQuestion = {

  };

  ngOnInit() {
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId').toString();
    this.getMCQ();
    this.getTrueFalse();
    this.getCodingQuestion();
  }

  async getMCQ(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    await this.http.get(this.storeInfo.serverUrl+'/practice/getMCQ',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.mcqQuestions = response['body'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  async getTrueFalse(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    await this.http.get(this.storeInfo.serverUrl+'/practice/getTrueFalse',options).toPromise().then(response=>{
      console.log(response);
      if(response['status'] == 200){
        this.trueFalseQuestions = response['body'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  async getCodingQuestion(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    await this.http.get(this.storeInfo.serverUrl+'/practice/getCodingQuestion',options).toPromise().then(response=>{
      console.log(response);
      if(response['status'] == 200){
        this.trueFalseQuestions = response['body'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  setView(view){
    this.router.navigateByUrl(`/course/${this.code}/${view}`);
  }

  goToPractice(){
    this.router.navigateByUrl(`/course/${this.code}/practice`);
  }
  goToQuestions(){
    this.router.navigateByUrl(`/course/${this.code}/questions`);
  }
}