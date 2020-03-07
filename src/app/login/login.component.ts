import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseServicesService } from '../firebase-services.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  showSpinner:boolean = false;
  showSpinner1:boolean = false;
  constructor(private formBuilder: FormBuilder, 
    private fire: AngularFireAuth,
    private router: Router,
    private firedata: AngularFireDatabase,
    private firebaseService: FirebaseServicesService,
    private zone: NgZone) { 
      
    }

  async ngOnInit() {
    this.showSpinner = true;
    this.form = this.formBuilder.group({
      username : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
    await this.firebaseService.getCurrentUser().then(async (user)=>{
      var userid = user["email"].split('@')[0].replace('.','');
      this.firebaseService.setUserID(userid)
      try{
        var type = await this.firebaseService.getUserType();
        if(type == undefined || type == null)
          this.router.navigateByUrl('/details')
        else
          this.router.navigateByUrl('/'+type)
      } catch(e){
        this.router.navigateByUrl('/details')
      }
    }).catch(()=>{

    }).finally(()=>{
      this.showSpinner = false;
    })
  }

  async login(){
    const database = this.firedata.database;
    let type = ""
    let username = this.form.value.username;
    this.showSpinner1 = true;
    await this.fire.auth.signInWithEmailAndPassword(this.form.value.username+"@iitjammu.ac.in", this.form.value.password)
      .then(async function(data){    
        await database.ref('users/').child(username).child('type').once('value',(snapshot)=>{
          type = snapshot.val();
        })
      })
    .catch(error => {
        alert('Unable to Login.');
        this.showSpinner1 = false;
        return;
    })
    console.log(type)
    this.showSpinner1 = false;
    this.router.navigateByUrl('/'+type);
  }

  async googleLogin(){
    await this.firebaseService.GoogleAuth();
    var userExists = await this.firebaseService.userExists(this.firebaseService.userid);
    if(userExists){
        var type = await this.firebaseService.getUserType();
        this.router.navigateByUrl('/'+type);
    } else {
      this.router.navigateByUrl('/details')
    }

  }


  reset(){
    this.form = this.formBuilder.group({
      username : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
  }
}
