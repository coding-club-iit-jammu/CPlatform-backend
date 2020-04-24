import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MaterialComponentService } from '../services/material-component.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  view: Number = 0;
  code: String;

  addMCQQuestion: any = {
    question:'',
    options:[]
  }

  mcqQuestion: FormGroup;
  addOptionForm: FormGroup;

  editOptionIndex: any;

  addTrueFalseQuestion: FormGroup;

  addCodingQuestion: FormGroup;

  mcqQuestions: Array<any> = [];
  trueFalseQuestions: Array<any> = [];

  constructor(private formBuilder: FormBuilder, 
              private matComp: MaterialComponentService,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.resetMCQQuestion();
    this.resetAddOptionForm();
    this.resetTrueFalseQuestion();
    this.resetAddCodingQuestion();
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
  }


  addOption(){

    let l = (this.addMCQQuestion.options).length;

    let option = this.addOptionForm.get('option').value;
    let isCorrect = this.addOptionForm.get('isCorrect').value;

    (this.addMCQQuestion.options).push({code:l+1,option:option,isCorrect:isCorrect});

    this.resetAddOptionForm();
  }

  editOption(i){
    this.addOptionForm.get('option').patchValue(this.addMCQQuestion.options[i].option);
    this.addOptionForm.get('isCorrect').patchValue(this.addMCQQuestion.options[i].isCorrect);
    this.editOptionIndex = i;
  }

  setEdittedOption(){
    this.addMCQQuestion.options[this.editOptionIndex].option = this.addOptionForm.get('option').value;
    this.addMCQQuestion.options[this.editOptionIndex].isCorrect = this.addOptionForm.get('isCorrect').value;
    this.editOptionIndex = null;
  }

  saveMCQQuestion(){
    this.addMCQQuestion.question = this.mcqQuestion.get('question').value;
    if(this.addMCQQuestion.question.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }
    this.mcqQuestions.push(this.addMCQQuestion);
    this.resetMCQQuestion();
    this.addMCQQuestion = {
      question:'',
      options:[]
    }

  }

  saveTrueFalseQuestion(){
    if(this.addTrueFalseQuestion.get('question').value.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }
    this.trueFalseQuestions.push(this.addTrueFalseQuestion.value);
    this.resetTrueFalseQuestion();
    console.log(this.trueFalseQuestions);

  }

  resetMCQQuestion(){
    this.mcqQuestion = this.formBuilder.group({
      question:this.formBuilder.control('')
    })
  }

  resetTrueFalseQuestion(){
    this.addTrueFalseQuestion = this.formBuilder.group({
      question:this.formBuilder.control(''),
      answer:this.formBuilder.control('')
    })
  }

  resetAddCodingQuestion(){
    this.addCodingQuestion = this.formBuilder.group({
      title: this.formBuilder.control(''),
      question: this.formBuilder.control(''),
      sampleInput: this.formBuilder.control(''),
      sampleOutput: this.formBuilder.control('')
    })
  }
  resetAddOptionForm(){
    this.addOptionForm = this.formBuilder.group({
      option:this.formBuilder.control(''),
      isCorrect: this.formBuilder.control('')
    })
  }

}
