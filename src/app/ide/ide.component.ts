import { Component, Directive, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Input } from '@angular/core'
import { Output, EventEmitter } from '@angular/core';
import * as ace from 'ace-builds'; // ace-module
import { languageModuleMap } from './consts/language-module-table';
import { Language } from 'src/models/languages/languages';
import { themeModuleMap } from './consts/theme-module-table';
import { ServerHandlerService } from '../services/http/server-handler.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Reference: https://github.com/judge0/ide/blob/master/js/ide.js
function encode(str) {
  return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
  var escaped = escape(atob(bytes || ""));
  try {
      return decodeURIComponent(escaped);
  } catch {
      return unescape(escaped);
  }
}

import {
  DEFAULT_INIT_EDITOR_OPTIONS,
  DEFAULT_SUPPORTED_EDITOR_THEMES,
  DEFAULT_RUN_ERROR_MESSAGE
} from './consts/default-options';

// import webpack resolver to dynamically load modes and themes
import 'ace-builds/webpack-resolver';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
import { LanguageTable } from './consts/language-table';
const INIT_HEADER = ''
const INIT_CONTENT = `
#include <iostream>
using namespace std;

int main () {
    
    
    return 0;
}`
const INIT_FOOTER = ''
const DEFAULT_THEME_MODE = 'solarized_dark';
const DEFAULT_LANG_MODE = 'cpp14';

@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent implements OnInit {

  @ViewChild('codeEditor', {static: true}) private codeEditorElmRef: ElementRef;
  @ViewChild('codeEditorHeader', {static: true}) private codeEditorHeadElmRef: ElementRef;
  @ViewChild('codeEditorFooter', {static: true}) private codeEditorFootElmRef: ElementRef;
  // language select element ref
  @ViewChild('languagesSelect', {static: false}) languagesSelect: ElementRef;
  // input
  @ViewChild('sampleInput', {static: true}) myInput: ElementRef;
  // observable of the run request output
  public output$: Observable<string>;
  // observable of the sample input
  public input$: Observable<string>;
  // current editor theme name
  public activatedTheme: string;

  private codeEditor: ace.Ace.Editor;
  private codeHeader: ace.Ace.Editor;
  private codeFooter: ace.Ace.Editor;
  private editorBeautify;
  // @Input() content: string;
  @Input() initOptions: {
    languageMode?: string, theme?: string, content?: string
  } = { };
  private currentConfig: {
    langMode?: string, editorTheme?: string
  } = { };

  public initEditorOptions = DEFAULT_INIT_EDITOR_OPTIONS;
  public supportedThemes = DEFAULT_SUPPORTED_EDITOR_THEMES;

  // indicate if the initial langauges API request failed or not
  public cantReachServer = false;
  // array of the supported languages
  private languagesArray: Language[] = [];
  // observable of the supported languages
  public languagesArray$: Observable<Language[]>;

  constructor(private handler: ServerHandlerService) { }

  async ngOnInit() {
    ace.require('ace/ext/language_tools');
    const editorMain = this.codeEditorElmRef.nativeElement;
    const header = this.codeEditorHeadElmRef.nativeElement;
    const footer = this.codeEditorFootElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();

    this.codeEditor = ace.edit(editorMain, editorOptions);
    this.codeHeader = ace.edit(header, editorOptions);
    this.codeFooter = ace.edit(footer, editorOptions);

    this.setLanguageMode(this.initOptions.languageMode || DEFAULT_LANG_MODE);
    this.setEditorTheme(this.initOptions.theme || DEFAULT_THEME_MODE);
    this.setContent(this.initOptions.content || INIT_CONTENT);

    // this.codeHeader.setShowFoldWidgets(true);
    // this.codeEditor.setShowFoldWidgets(true);
    // this.codeFooter.setShowFoldWidgets(true);
    this.editorBeautify = ace.require('ace/ext/beautify');

    this.languagesArray$ = this.pipeSupportedLanguages();
    this.activatedTheme = this.initEditorOptions.theme;

    // let Range = ace.require("ace/range").Range;
    // let r = new Range(0, 0, 5, 5);
    // let rangeId = this.codeEditor.getSession().addMarker(r, "readonly-highlight", "fullLine");
    this.codeHeader.setReadOnly(true);
    this.codeFooter.setReadOnly(true);
    this.codeEditor.clearSelection();

    this.codeHeader.setHighlightActiveLine(false);
    this.codeFooter.setHighlightActiveLine(false);

    // set line numbers appropriately
    let linesInHeader = INIT_HEADER.split(/\r\n|\r|\n/).length;
    this.codeEditor.setOption("firstLineNumber", linesInHeader + 1);
    let linesInContent = INIT_CONTENT.split(/\r\n|\r|\n/).length;
    let initialLinesFooter = linesInHeader + linesInContent + 1;
    this.codeFooter.setOption("firstLineNumber", initialLinesFooter);

    this.codeEditor.on("change", (delta) => {
      const content = this.codeEditor.getValue();
      linesInContent = content.split(/\r\n|\r|\n/).length;
      // console.log(linesInContent);
      this.codeFooter.setOption("firstLineNumber", linesInHeader + linesInContent + 1);
    });

  }

  private pipeSupportedLanguages() {
    return this.handler.getAllSupportedLangs()
    .pipe(
      // reduce the incoming table to languages array
      map((languages: LanguageTable) => {
        // console.log(languages);
        var res = Array<Language>();
        var languagesNew = <Array<any>>languages;
        for (var i = 0; i < languagesNew.length; ++i) {
          res.push(languagesNew[i][1][0]);
        }
        // var res = languages.reduce<Language[]>((langsArray, entry) => {
        //   return langsArray.concat(entry[1]);
        // }, []);
        // console.log(res);
        return res;
      }),
      // store the array in a member
      tap((languages: Language[]) => this.languagesArray = languages),
      // console log any error 
      catchError((err) => {
        console.log(err);
        this.cantReachServer = true;
        this.languagesArray = [];
        return of(this.languagesArray);
      })
    );
  }
  private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { enableBasicAutoCompletion?: boolean;} {
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 5,
      maxLines: 20,
      fontSize: 18,
      autoScrollEditorIntoView: true,
      vScrollBarAlwaysVisible: true
    }
    const extraEditorOptions = {
      enableBasicAutocompletion: true,
      // enableLiveAutocompletion: true,
    };
    const mergedOptions = Object.assign(basicEditorOptions, extraEditorOptions);
    return mergedOptions;
  }

  /**
   * 
   * @param langMode - set as the editor's language, currentConfig.langMode
   */
  
  public setLanguageMode(langMode: string): void {
    try {
      if (languageModuleMap.has(langMode)) {
        const languageModulePath = languageModuleMap.get(langMode);
        this.codeEditor.getSession().setMode(languageModulePath, () => {
          this.currentConfig.langMode = langMode;
        });
        this.codeHeader.getSession().setMode(languageModulePath, () => {
          this.currentConfig.langMode = langMode;
        });
        this.codeFooter.getSession().setMode(languageModulePath, () => {
          this.currentConfig.langMode = langMode;
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 
   * @param theme - set as the editor's theme, currentConfig.editorTheme
   */
  public setEditorTheme(theme: string): void {
    try {
      if (themeModuleMap.has(theme)) {
        const themePath = themeModuleMap.get(theme);
        this.codeEditor.setTheme(themePath, () => {
          this.currentConfig.editorTheme = theme;
        });
        this.codeHeader.setTheme(themePath, () => {
          this.currentConfig.editorTheme = theme;
        });
        this.codeFooter.setTheme(themePath, () => {
          this.currentConfig.editorTheme = theme;
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  public getCurrentConfig(): Readonly<{langMode?: string; editorTheme?: string;}> {
    return Object.freeze(this.currentConfig);
  }

  /**
   * @description
   * beautify the editor content, relies on Ace Beautify extension
   */
  private onBeautifyContent() {
    if (this.codeEditor && this.editorBeautify) {
      const session = this.codeEditor.getSession();
      this.editorBeautify.beautify(session);
    }
  }

  /**
   * @returns - the current editor's content.
   */
  public getContent() {
    if (this.codeEditor) {
      const code = this.codeHeader.getValue() + this.codeEditor.getValue() + this.codeFooter.getValue();
      // console.log(code);
      return code;
    }
  }

  /**
   * @description
   * clears the editor content.
   */
  public onClearContent() {
    if (this.codeEditor) {
      this.codeEditor.setValue(INIT_CONTENT);
      this.codeEditor.clearSelection();
    }
    // test input value
    let input = this.myInput.nativeElement.value;
    console.log(input);
  }

  /**
   * @param content - set as the editor's content.
   */
  public setContent(content: string) : void {
    if (this.codeEditor) {
      this.codeEditor.setValue(content);
    }
    if (this.codeHeader) {
      this.codeHeader.setValue(INIT_HEADER);
    }
    if (this.codeFooter) {
      this.codeFooter.setValue(INIT_FOOTER);
    }
  }

  /**
   * @event OnContentChange - a proxy event to Ace 'change' event - adding additional data.
   * @param callback - receive the current content and 'change' event's original parameter.
   */
  public onContentChange(callback: (content: string, delta: ace.Ace.Delta) => void) : void {
    this.codeEditor.on('change', (delta) => {
      const content = this.codeEditor.getValue();
      let linesInContent = content.split(/\r\n|\r|\n/).length;
      // console.log(linesInContent);
      this.codeFooter.setOption("firstLineNumber", linesInContent + 1);
      callback(content, delta);
    });
  }

  public onChangeTheme(theme: string) {
    if (this.supportedThemes.includes(theme)) {
      this.setEditorTheme(theme);
    }
  }

  public onChangeLanguageMode(event: any) {
    const selectedIndex = event.target.selectedIndex;
    const language = this.languagesArray[selectedIndex];
    const langMode = language.lang;
    this.setLanguageMode(langMode);
  }

  public onRunCode() {
    // console.log('onRunCode()');
    const code = encode(this.getContent());
    console.log(code);
    const input = encode(this.myInput.nativeElement.value);
    // console.log(this.languagesSelect);
    let fields = "stdout,time,memory,compile_output,stderr,token,message,status";
    if (this.languagesSelect && code.length > 0) {
      // console.log("here");
      const languagesSelectElement = this.languagesSelect.nativeElement as HTMLSelectElement;
      const index = languagesSelectElement.selectedIndex;
      const language = this.languagesArray[index];
      this.output$ = this.handler.postCodeToRun(code, {
        id: language.lang, version: language.version
      }, input, fields).pipe(
        // returning the output content
        map((response: RunResult) => {
          console.log(response);
          if (response.compile_output != null) {
            return decode(response.compile_output);
          }
          return decode(response.stdout);
        }),
        catchError((err) => {
          console.log(err);
          return of(DEFAULT_RUN_ERROR_MESSAGE);
        })
      );
    }
  }
}

interface RunResult {
  stdout: string;
  time: number;
  memory: number;
  compile_output: string;
  stderr: string;
  token: string;
  message: string;
  status: string;
}