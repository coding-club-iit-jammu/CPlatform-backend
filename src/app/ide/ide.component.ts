import { Component, Directive, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Input } from '@angular/core'
import { Output, EventEmitter } from '@angular/core';
import * as ace from 'ace-builds'; // ace-module

// language package, choose your own 
import 'ace-builds/src-noconflict/mode-javascript';
// ui-theme package
import 'ace-builds/src-noconflict/theme-github';

const THEME = 'ace/theme/github';
const LANG = 'ace/mode/javascript';

@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent implements OnInit {

  @ViewChild('codeEditor', {static: true}) codeEditorElmRef: ElementRef;
  private codeEditor: ace.Ace.Editor;
  constructor() { }

  ngOnInit() {
    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 10,
      maxLines: Infinity,
      fontSize: 32,
    };

    this.codeEditor = ace.edit(element, editorOptions);
    this.codeEditor.setTheme(THEME);
    this.codeEditor.getSession().setMode(LANG);
    this.codeEditor.setShowFoldWidgets(true);
  }

}
