import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoreInfoService {

  userid:string;
  name:string;
  branch:string;
  courses:any;
  userData:any;
  
  constructor() { }

  setUserDetails(userid: string,name: string,branch: string){
    this.branch = branch;
    this.name = name;
    this.userid = userid;
  }

  getName(){
    return this.userData.name;
  }

  getBranch(){
    return this.userData.branch;
  }

  getCourseData(course:string){

  }

  getCourseList(){
    var list = [];
    
  }

  getAssignments(course:string){

  }
}
