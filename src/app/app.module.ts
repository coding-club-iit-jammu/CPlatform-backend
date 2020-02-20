import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AdminpageComponent } from './adminpage/adminpage.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { InstructorhomeComponent } from './instructorhome/instructorhome.component';
import { FirebaseServicesService } from './firebase-services.service';
import { CoursehomeComponent } from './coursehome/coursehome.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminpageComponent,
    StudenthomeComponent,
    InstructorhomeComponent,
    CoursehomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [
    FirebaseServicesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
