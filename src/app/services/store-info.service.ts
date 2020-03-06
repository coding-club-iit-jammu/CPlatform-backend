import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class StoreInfoService {

  userid:string;
  name:string;
  branch:string;
  coursesData:any = {};
  userData:any;
  userType:string;
  selectedCourse:string;
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

  getAssignments(course:string){

  }

  async fetchCourseAssignments(code: string){
    var temp = this.coursesData[code].assignments;
    var tempUser = Object.values(this.userData["courses"][code].assignments);
    for(var i=0; i < tempUser.length; i++){
        var j = tempUser[i]["number"]
        if(tempUser[i] != undefined && tempUser[i] != null){
          temp[j]["securedmarks"]=tempUser[i]["marks"];
          temp[j]["time"]=tempUser[i]["time"];
          temp[j]["link"]=tempUser[i]["link"];

          if(temp[j]['time']!=undefined || temp[j]["time"]!=null){
            
          }
        }
    }
    temp.shift();
    console.log(temp)
    return temp;
  }

  updateCourseAssignments(code,result){
    console.log()
    this.userData["courses"][code].assignments[result.number].number = result.number;
    this.userData["courses"][code].assignments[result.number].link = result.link;
    this.userData["courses"][code].assignments[result.number].time = result.time;
    return this.fetchCourseAssignments(code);
  }

  getCourseList(){  
    var courses = []
    var t = Object.keys(this.coursesData);
    for(let c of t){
        let temp = {
          code:c,
          title:this.coursesData[c].title
        };
        courses.push(temp);
    }
    return courses;
  }

  getCourseDetails(course){
    return this.coursesData[course]
  }
}
