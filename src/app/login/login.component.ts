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

    this.fire.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.firebaseService.setUserID(user.email.split('@')[0])
        var type = await this.firebaseService.getUserType();
        this.zone.run( async () => this.router.navigateByUrl('/'+type));
      }
      this.showSpinner = false;
    });
  }

  async login(){
    
    const database = this.firedata.database;
    let type = ""
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
    // console.log(this.authService.SignIn(username, this.form.value.password))
    if(type!=""){
      this.firebaseService.setUserID(username);
      this.router.navigateByUrl('/'+type);
    }
  }

  reset(){
    this.form = this.formBuilder.group({
      username : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
  }
}
