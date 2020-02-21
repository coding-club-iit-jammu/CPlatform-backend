import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatdate'
})
export class FormatdatePipe implements PipeTransform {

  transform(value: string): any {
    var d  = new Date(value);
    var str = d.toDateString() + " " + d.toLocaleTimeString();
    return str;
  }

}
