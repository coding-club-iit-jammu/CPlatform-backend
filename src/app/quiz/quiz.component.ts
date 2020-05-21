import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  code:any;
  testId:any;
  groupId:any;

  remainTime:any = "30:00:00";
  time:String;
  showSpinner:boolean = false;
  view:boolean = true; //False for First View and True for Second View.
  questions = [[0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7]]
  current = {
    section: 0,
    question: 0
  }
  quiz:any = {
    id: "2019_02_EFC004U1M_Quiz1",
    title: "Quiz 1",
    startTime: "",
    endTime: "",
    sections:[{
      questions:[{
        question:"What is the captial of India?",
          options:{
            a:"New Delhi",
            b:"Mumbai",
            c:"Kolkata",
            d:"Chennai"
          },
          selectedOption:"",
          correctOption:'a',
          marks:1,
          visited:true
        },
        {
          question:"What is the captial of MP?",
          options:{
            a:"Indore",
            b:"Mandsaur",
            c:"Bhopal",
            d:"None of the Above"
          },
          selectedOption:"",
          correctOption:'c',
          marks:1,
          visited:false
        },
        {
          question:"What is the captial of Gujrat?",
          options:{
            a:"Varodara",
            b:"Ahmedabad",
            c:"Surat",
            d:"Gandhinagar"
          },
          selectedOption:"",
          correctOption:'d',
          marks:1,
          visited:false
        },
        {
          question:"What is the captial of Rajasthan?",
          options:{
            a:"Udaipur",
            b:"Jaipur",
            c:"Kolkata",
            d:"Chennai"
          },
          selectedOption:"",
          correctOption:'b',
          marks:1,
          visited:false
        },
        {
          question:"What is the captial of Haryana?",
          options:{
            a:"Chandigarh",
            b:"Mumbai",
            c:"Kolkata",
            d:"Chennai"
          },
          selectedOption:"",
          correctOption:'a',
          marks:1,
          visited:false
        },
        {
          question:"What is the captial of Punjab?",
          options:{
            a:"Chandigarh",
            b:"Mumbai",
            c:"Kolkata",
            d:"Chennai"
          },
          selectedOption:"",
          correctOption:'a',
          marks:1,
          visited:false
        },
        {
          question:"What is the captial of UP?",
          options:{
            a:"New Delhi",
            b:"Mumbai",
            c:"Lucknow",
            d:"Chennai"
          },
          selectedOption:"",
          correctOption:'b',
          marks:1,
          visited:false
        },
        {
          question:"What is the captial of West Bengal?",
          options:{
            a:"New Delhi",
            b:"Mumbai",
            c:"Kolkata",
            d:"Chennai"
          },
          selectedOption:"",
          correctOption:'c',
          marks:1,
          visited:false
        }],
      previousComplete:true
    },{
      questions:[{
      question:"What is the captial of India?",
      options:{
        a:"New Delhi",
        b:"Mumbai",
        c:"Kolkata",
        d:"Chennai"
      },
      selectedOption:"",
      correctOption:'a',
      marks:1,
      visited:true
    },
    {
      question:"What is the captial of MP?",
      options:{
        a:"Indore",
        b:"Mandsaur",
        c:"Bhopal",
        d:"None of the Above"
      },
      selectedOption:"",
      correctOption:'c',
      marks:1,
      visited:false
    },
    {
      question:"What is the captial of Gujrat?",
      options:{
        a:"Varodara",
        b:"Ahmedabad",
        c:"Surat",
        d:"Gandhinagar"
      },
      selectedOption:"",
      correctOption:'d',
      marks:1,
      visited:false
    },
    {
      question:"What is the captial of Rajasthan?",
      options:{
        a:"Udaipur",
        b:"Jaipur",
        c:"Kolkata",
        d:"Chennai"
      },
      selectedOption:"",
      correctOption:'b',
      marks:1,
      visited:false
    },
    {
      question:"What is the captial of Haryana?",
      options:{
        a:"Chandigarh",
        b:"Mumbai",
        c:"Kolkata",
        d:"Chennai"
      },
      selectedOption:"",
      correctOption:'a',
      marks:1,
      visited:false
    },
    {
      question:"What is the captial of Punjab?",
      options:{
        a:"Chandigarh",
        b:"Mumbai",
        c:"Kolkata",
        d:"Chennai"
      },
      selectedOption:"",
      correctOption:'a',
      marks:1,
      visited:false
    },
    {
      question:"What is the captial of UP?",
      options:{
        a:"New Delhi",
        b:"Mumbai",
        c:"Lucknow",
        d:"Chennai"
      },
      selectedOption:"",
      correctOption:'b',
      marks:1,
      visited:false
    },
    {
      question:"What is the captial of West Bengal?",
      options:{
        a:"New Delhi",
        b:"Mumbai",
        c:"Kolkata",
        d:"Chennai"
      },
      selectedOption:"",
      correctOption:'c',
      marks:1,
      visited:false
    }
      ],
      previousCompleted:false
    }
  ]
    
  }
  constructor(private http: HttpClient, private router: Router,
              private activatedRoute: ActivatedRoute) {
                let x = new Date();
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
    this.showSpinner = false;
  }

  changeQuestion(q:number){
    this.current.question = q;
    this.quiz.sections[this.current.section].questions[this.current.question].visited = true
  }

  endTest(){
    console.log("Test Ended")
  }

  markSubmit(q){
    this.quiz.sections[this.current.section].questions[this.current.question].selectedOption = q
  }
  
  nextQuestion(){
    this.changeQuestion(this.current.question+1)
  }

  previousQuestion(){
    this.changeQuestion(this.current.question-1)
  }

  nextSection(){
    this.current.section++;
  }

}
