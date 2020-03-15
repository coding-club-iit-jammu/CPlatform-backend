import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {

  remainTime:any = "30:00:00";
  showSpinner:boolean = false;
  view:boolean = true; //False for First View and True for Second View.
  questions = [0,1,2,3,4,5,6,7]
  currentQuestion = 0;
  quiz:any = {
    title: "Quiz 1",
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
                marks:1
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
                marks:1
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
                marks:1
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
                marks:1
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
                marks:1
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
                marks:1
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
                marks:1
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
                marks:1
              }
            ]
  }
  constructor() { }

  ngOnInit() {
  }

  changeQuestion(q:number){
    this.currentQuestion = q;
  }

  endTest(){
    console.log("Test Ended")
  }

  markSubmit(q){
    this.quiz.questions[this.currentQuestion].selectedOption = q
  }
  

}
