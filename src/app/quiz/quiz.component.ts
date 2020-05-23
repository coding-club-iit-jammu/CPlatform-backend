import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { MaterialComponentService } from '../services/material-component.service';
import { StoreInfoService } from '../services/store-info.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ height: 0, opacity: 0 }),
            animate('1s ease-out', 
                    style({ height: 300, opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ height: 300, opacity: 1 }),
            animate('1s ease-in', 
                    style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class QuizComponent implements OnInit {

  code:any;
  testId:any;
  groupId:any;

  test_id:any;
  userTestRecordId:any;

  remainTime:any = "30:00:00";
  time:String;

  startTestForm:FormGroup;

  showSideNav:Boolean = true;
  showSpinner:boolean = false;
  view:boolean = false; //False for First View and True for Second View.
  questions:any;
  questionType:String;
  current = {
    section: 0,
    question: 0
  }

  opened: boolean;

  // quiz:any = {
  //   id: "2019_02_EFC004U1M_Quiz1",
  //   title: "Quiz 1",
  //   startTime: "",
  //   endTime: "",
  //   sections:[{
  //     questions:[{
  //       question:"What is the captial of India?",
  //         options:{
  //           a:"New Delhi",
  //           b:"Mumbai",
  //           c:"Kolkata",
  //           d:"Chennai"
  //         },
  //         selectedOption:"",
  //         correctOption:'a',
  //         marks:1,
  //         visited:true
  //       },
  //       {
  //         question:"What is the captial of MP?",
  //         options:{
  //           a:"Indore",
  //           b:"Mandsaur",
  //           c:"Bhopal",
  //           d:"None of the Above"
  //         },
  //         selectedOption:"",
  //         correctOption:'c',
  //         marks:1,
  //         visited:false
  //       },
  //       {
  //         question:"What is the captial of Gujrat?",
  //         options:{
  //           a:"Varodara",
  //           b:"Ahmedabad",
  //           c:"Surat",
  //           d:"Gandhinagar"
  //         },
  //         selectedOption:"",
  //         correctOption:'d',
  //         marks:1,
  //         visited:false
  //       },
  //       {
  //         question:"What is the captial of Rajasthan?",
  //         options:{
  //           a:"Udaipur",
  //           b:"Jaipur",
  //           c:"Kolkata",
  //           d:"Chennai"
  //         },
  //         selectedOption:"",
  //         correctOption:'b',
  //         marks:1,
  //         visited:false
  //       },
  //       {
  //         question:"What is the captial of Haryana?",
  //         options:{
  //           a:"Chandigarh",
  //           b:"Mumbai",
  //           c:"Kolkata",
  //           d:"Chennai"
  //         },
  //         selectedOption:"",
  //         correctOption:'a',
  //         marks:1,
  //         visited:false
  //       },
  //       {
  //         question:"What is the captial of Punjab?",
  //         options:{
  //           a:"Chandigarh",
  //           b:"Mumbai",
  //           c:"Kolkata",
  //           d:"Chennai"
  //         },
  //         selectedOption:"",
  //         correctOption:'a',
  //         marks:1,
  //         visited:false
  //       },
  //       {
  //         question:"What is the captial of UP?",
  //         options:{
  //           a:"New Delhi",
  //           b:"Mumbai",
  //           c:"Lucknow",
  //           d:"Chennai"
  //         },
  //         selectedOption:"",
  //         correctOption:'b',
  //         marks:1,
  //         visited:false
  //       },
  //       {
  //         question:"What is the captial of West Bengal?",
  //         options:{
  //           a:"New Delhi",
  //           b:"Mumbai",
  //           c:"Kolkata",
  //           d:"Chennai"
  //         },
  //         selectedOption:"",
  //         correctOption:'c',
  //         marks:1,
  //         visited:false
  //       }],
  //     previousComplete:true
  //   },{
  //     questions:[{
  //     question:"What is the captial of India?",
  //     options:{
  //       a:"New Delhi",
  //       b:"Mumbai",
  //       c:"Kolkata",
  //       d:"Chennai"
  //     },
  //     selectedOption:"",
  //     correctOption:'a',
  //     marks:1,
  //     visited:true
  //   },
  //   {
  //     question:"What is the captial of MP?",
  //     options:{
  //       a:"Indore",
  //       b:"Mandsaur",
  //       c:"Bhopal",
  //       d:"None of the Above"
  //     },
  //     selectedOption:"",
  //     correctOption:'c',
  //     marks:1,
  //     visited:false
  //   },
  //   {
  //     question:"What is the captial of Gujrat?",
  //     options:{
  //       a:"Varodara",
  //       b:"Ahmedabad",
  //       c:"Surat",
  //       d:"Gandhinagar"
  //     },
  //     selectedOption:"",
  //     correctOption:'d',
  //     marks:1,
  //     visited:false
  //   },
  //   {
  //     question:"What is the captial of Rajasthan?",
  //     options:{
  //       a:"Udaipur",
  //       b:"Jaipur",
  //       c:"Kolkata",
  //       d:"Chennai"
  //     },
  //     selectedOption:"",
  //     correctOption:'b',
  //     marks:1,
  //     visited:false
  //   },
  //   {
  //     question:"What is the captial of Haryana?",
  //     options:{
  //       a:"Chandigarh",
  //       b:"Mumbai",
  //       c:"Kolkata",
  //       d:"Chennai"
  //     },
  //     selectedOption:"",
  //     correctOption:'a',
  //     marks:1,
  //     visited:false
  //   },
  //   {
  //     question:"What is the captial of Punjab?",
  //     options:{
  //       a:"Chandigarh",
  //       b:"Mumbai",
  //       c:"Kolkata",
  //       d:"Chennai"
  //     },
  //     selectedOption:"",
  //     correctOption:'a',
  //     marks:1,
  //     visited:false
  //   },
  //   {
  //     question:"What is the captial of UP?",
  //     options:{
  //       a:"New Delhi",
  //       b:"Mumbai",
  //       c:"Lucknow",
  //       d:"Chennai"
  //     },
  //     selectedOption:"",
  //     correctOption:'b',
  //     marks:1,
  //     visited:false
  //   },
  //   {
  //     question:"What is the captial of West Bengal?",
  //     options:{
  //       a:"New Delhi",
  //       b:"Mumbai",
  //       c:"Kolkata",
  //       d:"Chennai"
  //     },
  //     selectedOption:"",
  //     correctOption:'c',
  //     marks:1,
  //     visited:false
  //   }
  //     ],
  //     previousCompleted:false
  //   }
  // ]
    
  // }
  constructor(private http: HttpClient, private router: Router,
              private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
              private storeInfo: StoreInfoService, private matComp: MaterialComponentService) {
                setInterval(() => {
                  this.time = new Date().toLocaleString('en-In');
                }, 500);
              }

  async ngOnInit() {
    this.showSpinner = true;
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.testId = this.activatedRoute.snapshot.paramMap.get('testId');
    this.groupId = this.activatedRoute.snapshot.paramMap.get('groupId');

    console.log(this.code,this.testId,this.groupId);
    this.resetStartTestForm();
    this.showSpinner = false;
  }

  resetStartTestForm(){
    this.startTestForm = this.formBuilder.group({
      groupId:this.formBuilder.control(this.groupId),
      password:this.formBuilder.control(''),
      testId:this.formBuilder.control(this.testId)
    })
  }

  async joinTest(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    let data = this.startTestForm.value;
    data['courseCode'] = this.code;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/joinTest', data, options).toPromise().then(async (response)=>{
      if(response['status']==200){
        this.matComp.openSnackBar(response['body']['message'],3000);
        if(response['body']['userTestRecord']){
          this.userTestRecordId = response['body']['userTestRecord'];
          this.test_id = response['body']['test_id'];
          await this.getQuestions();
          this.view = true;
        } else {
          this.matComp.openSnackBar(response['body']['message'],3000);
        }
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;    
  }

  changeQuestion(q:number){
    this.current.question = q;
  }

  async endTest(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    let data = {}
    data['courseCode'] = this.code;
    data['userTestRecordId'] = this.userTestRecordId;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/endTest', data, options).toPromise().then(async (response)=>{
      if(response['status'] == 200 ){
        this.matComp.openSnackBar(response['body']['message'],3000);
        this.router.navigateByUrl(`/course/${this.code}`);
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

  markSubmit(q){
    // this.quiz.sections[this.current.section].questions[this.current.question].selectedOption = q
  }
  
  nextQuestion(){
    this.changeQuestion(this.current.question+1)
  }

  previousQuestion(){
    this.changeQuestion(this.current.question-1)
  }

  async getQuestions(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params: new HttpParams().set('courseCode',this.code).set('userTestRecordId',this.userTestRecordId)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/test/getQuestions', options).toPromise().then(async (response)=>{
      if(response['status']==200 ){
        this.questions = response['body']['questions'];
        this.questionType = response['body']['questionType'];
        this.current.question = 0;
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

  async nextSection(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    let data = {}
    data['courseCode'] = this.code;
    data['userTestRecordId'] = this.userTestRecordId;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/submitSection', data, options).toPromise().then(async (response)=>{
      if(response['status']==200 ){
        this.matComp.openSnackBar(response['body']['message'],3000);
        if( response['body']['ended']==false){
          await this.getQuestions();
        } else {

        }
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

}
