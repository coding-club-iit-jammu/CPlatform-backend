import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MaterialComponentService } from '../services/material-component.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  view: Number = 0;
  code: String;
  showSpinner: Boolean = false; 
  addMCQQuestion: any = {
    question:'',
    options:[]
  }
  editTrueFalseQuestion: FormGroup;
  mcqQuestion: FormGroup;
  addOptionForm: FormGroup;
  editMcqQuestion: FormGroup;
  editMcqOptions: any = {
    options:[]
  }
  editOptionIndex: any;

  addTrueFalseQuestion: FormGroup;

  addCodingQuestion: FormGroup;

  mcqQuestions: Array<any> = [];
  trueFalseQuestions: Array<any> = [];

  constructor(private formBuilder: FormBuilder, 
              private matComp: MaterialComponentService,
              private activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private storeInfo: StoreInfoService,
              private router: Router) { }

  ngOnInit() {
    this.resetMCQQuestion();
    this.resetAddOptionForm();
    this.resetTrueFalseQuestion();
    this.resetAddCodingQuestion();
    this.resetEditTrueFalseQuestion();
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId').toString();
    this.getMCQ();
    this.getTrueFalse();
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
    this.addMCQQuestion['courseCode'] = this.code;
    await this.http.get(this.storeInfo.serverUrl+'/mcq/getMCQ',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.mcqQuestions = response['body']['questions']['mcq'];
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
    await this.http.get(this.storeInfo.serverUrl+'/truefalse/getTrueFalse',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.trueFalseQuestions = response['body']['questions']['trueFalse'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  addOption(){

    let l = (this.addMCQQuestion.options).length;

    let option = this.addOptionForm.get('option').value;
    let isCorrect = this.addOptionForm.get('isCorrect').value;
    if(isCorrect === '')
      isCorrect = false;
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

  async saveMCQQuestion(){
    this.showSpinner = true;
    this.addMCQQuestion.question = this.mcqQuestion.get('question').value;
    if(this.addMCQQuestion.question.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }

    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    this.addMCQQuestion['courseCode'] = this.code;
    await this.http.post(this.storeInfo.serverUrl+'/mcq/add',this.addMCQQuestion,options).toPromise().then(response=>{
      if(response['status']==201){
        this.mcqQuestions.push(this.addMCQQuestion);
        this.resetMCQQuestion();
        this.addMCQQuestion = {
          question:'',
          options:[]
        }
      }
      this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  saveEdittedMCQQuestion(){
    if(this.addMCQQuestion.question.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }
    this.resetEditMCQQuestion();
    this.editMcqOptions = {
      options:[]
    }

  }

  async saveTrueFalseQuestion(){
    if(this.addTrueFalseQuestion.get('question').value.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }

    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };

    let data = this.addTrueFalseQuestion.value;
    data['courseCode'] = this.code;

    await this.http.post(this.storeInfo.serverUrl+'/truefalse/add', data, options).toPromise().then(response=>{
      if(response['status']==201){
        this.trueFalseQuestions.push(this.addTrueFalseQuestion.value);
        this.resetTrueFalseQuestion();
      }
      this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
  }

  saveEdittedTrueFalseQuestion(){
    if(this.editTrueFalseQuestion.get('question').value.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }
    // this.trueFalseQuestions.push(this.addTrueFalseQuestion.value);
    this.resetEditTrueFalseQuestion();
    console.log(this.trueFalseQuestions);
    this.view = 0;
  }

  trueFalseQuestionEdit(i,_id){
    this.view = 5;
    this.editTrueFalseQuestion.get('question').patchValue(this.trueFalseQuestions[i].question);
    this.editTrueFalseQuestion.get('answer').patchValue(this.trueFalseQuestions[i].answer);
    this.editTrueFalseQuestion.get('_id').patchValue(_id);
  }

  resetMCQQuestion(){
    this.mcqQuestion = this.formBuilder.group({
      question:this.formBuilder.control('')
    })
  }

  resetEditMCQQuestion(){
    this.editMcqQuestion = this.formBuilder.group({
      question:this.formBuilder.control(''),
      _id: this.formBuilder.control('')
    })
  }

  resetTrueFalseQuestion(){
    this.addTrueFalseQuestion = this.formBuilder.group({
      question:this.formBuilder.control(''),
      answer:this.formBuilder.control('')
    })
  }

  resetEditTrueFalseQuestion(){
    this.editTrueFalseQuestion = this.formBuilder.group({
      question:this.formBuilder.control(''),
      answer:this.formBuilder.control(''),
      _id: this.formBuilder.control('')
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

  moveBack(){
    this.router.navigateByUrl('/home');
  }

  setView(view){
    this.router.navigateByUrl(`/course/${this.code}/${view}`);
  }

}
