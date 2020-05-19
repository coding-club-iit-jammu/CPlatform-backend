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

  selectedMCQ:any;
  selectedTrueFalse:any;
  selectedCodingQuestion:any;

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
      this.matComp.openSnackBar(error,3000);
    })
    this.showSpinner = false;
  }

  solveQuestion(question,questionType:String){
    if(questionType=='mcq'){
      this.selectedMCQ = question;
      this.view = 1;
    } else if(questionType == 'trueFalse'){
      this.selectedTrueFalse = question;
      this.view = 2;
    } else if(questionType == 'codingQuestion'){
      this.selectedCodingQuestion = question;
      this.view = 3;
    } else {
      this.view = 0;
      this.matComp.openSnackBar("Something is wrong, please try again.",2000);
    }
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
      if(response['status'] == 200){
        this.trueFalseQuestions = response['body'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error,3000);
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
      if(response['status'] == 200){
        this.trueFalseQuestions = response['body'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error,3000);
    })
    this.showSpinner = false;
  }

  async submitMCQ(selectedMCQ){
    this.showSpinner = true;
    let answer = [];
    for(let x of this.mcqQuestions[selectedMCQ]['options']){
      if(x['response']){
        answer.push(x['code']);
      }
    }
    let resAnswer = (answer.sort()).toString();
    
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    let data = {
      questionId : this.mcqQuestions[selectedMCQ]['_id'],
      questionType: 'mcq',
      answer: resAnswer,
      courseCode: this.code
    }
    await this.http.post(this.storeInfo.serverUrl+'/practice/submitMCQ',data,options).toPromise().then(response=>{
      this.matComp.openSnackBar(response['body']['message'],2000);
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error,3000);
    })
    this.showSpinner = false;
  }

  async submitTrueFalse(selectedTrueFalse){
    this.showSpinner = true;
    
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    // console.log(this.trueFalseQuestions[selectedTrueFalse]);
    let data = {
      questionId : this.trueFalseQuestions[selectedTrueFalse]['_id'],
      questionType: 'trueFalse',
      answer: this.trueFalseQuestions[selectedTrueFalse]['response'],
      courseCode: this.code
    }
    console.log(data);
    await this.http.post(this.storeInfo.serverUrl+'/practice/submitTrueFalse',data,options).toPromise().then(response=>{
      this.matComp.openSnackBar(response['body']['message'],2000);
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error,3000);
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

  signOut(){
    this.storeInfo.signOut();
    this.router.navigateByUrl('/');
  }

  moveBack(){
    this.router.navigateByUrl('/home');
  }
}
