import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MaterialComponentService {

  constructor(private _snackBar: MatSnackBar) { }

  openSnackBar(message,duration) {
    this._snackBar.open(message,'',{
      verticalPosition: "bottom",
      duration: duration,
      panelClass: ['bg-light', 'text-dark']
    });
  }
}
