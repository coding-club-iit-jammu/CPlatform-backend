import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.css']
})
export class PracticeComponent implements OnInit {

  constructor(private router: Router,private activatedRoute: ActivatedRoute) { }
  
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
