import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  constructor(private formBuilder: FormBuilder, 
    private fire: AngularFireAuth,
    private router: Router,
    private firedata: AngularFireDatabase) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
  }

  async login(){
    const database = this.firedata.database;
    let type = "";
    let username = this.form.value.username;
    await this.fire.auth.signInWithEmailAndPassword(this.form.value.username+"@iitjammu.ac.in", this.form.value.password)
      .then(async function(data){    
        await database.ref('users/').child(username).child('type').once('value',(snapshot)=>{
          type = snapshot.val();
        });
      })
      .catch(error => {
        console.log('got an error .', error);
      }) 
    if(type!="")
      this.router.navigateByUrl('/'+type);
  }

  reset(){
    this.form = this.formBuilder.group({
      username : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
  }
}
