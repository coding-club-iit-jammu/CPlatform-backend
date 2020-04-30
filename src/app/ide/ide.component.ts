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

import {
  DEFAULT_INIT_EDITOR_OPTIONS,
  DEFAULT_SUPPORTED_EDITOR_THEMES,
  DEFAULT_RUN_ERROR_MESSAGE
} from './consts/default-options';

// import webpack resolver to dynamically load modes and themes
import 'ace-builds/webpack-resolver';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
import { LanguageTable } from 'ide_backend/utils/languages-table';
const INIT_CONTENT = '';
const DEFAULT_THEME_MODE = 'github';
const DEFAULT_LANG_MODE = 'python3';

@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent implements OnInit {

  @ViewChild('codeEditor', {static: true}) private codeEditorElmRef: ElementRef;
  // language select element ref
  @ViewChild('languagesSelect', {static: false}) languagesSelect: ElementRef;
  // observable of the run request output
  public output$: Observable<string>;
  // current editor theme name
  public activatedTheme: string;

  private codeEditor: ace.Ace.Editor;
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
    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();

    this.codeEditor = ace.edit(element, editorOptions);
    this.setLanguageMode(this.initOptions.languageMode || DEFAULT_LANG_MODE);
    this.setEditorTheme(this.initOptions.theme || DEFAULT_THEME_MODE);
    this.setContent(this.initOptions.content || INIT_CONTENT);
    this.codeEditor.setShowFoldWidgets(true);
    this.editorBeautify = ace.require('ace/ext/beautify');

    this.languagesArray$ = this.pipeSupportedLanguages();
    this.activatedTheme = this.initEditorOptions.theme;
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
      minLines: 15,
      maxLines: 20,
      fontSize: 20,
      autoScrollEditorIntoView: true,
      vScrollBarAlwaysVisible: true
    }
    const extraEditorOptions = {
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
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
      const code = this.codeEditor.getValue();
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
    }
  }

  /**
   * @param content - set as the editor's content.
   */
  public setContent(content: string) : void {
    if (this.codeEditor) {
      this.codeEditor.setValue(content);
    }
  }

  /**
   * @event OnContentChange - a proxy event to Ace 'change' event - adding additional data.
   * @param callback - receive the current content and 'change' event's original parameter.
   */
  public OnContentChange(callback: (content: string, delta: ace.Ace.Delta) => void) : void {
    this.codeEditor.on('change', (delta) => {
      const content = this.codeEditor.getValue();
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
    console.log('onRunCode()');
    const code = this.getContent();
    console.log(code);
    console.log(this.languagesSelect);
    if (this.languagesSelect && code.length > 0) {
      console.log("here");
      const languagesSelectElement = this.languagesSelect.nativeElement as HTMLSelectElement;
      const index = languagesSelectElement.selectedIndex;
      const language = this.languagesArray[index];
      this.output$ = this.handler.postCodeToRun(code, {
        id: language.lang, version: language.version
      }).pipe(
        // returning the output content
        map((response: RunResult) => {
          console.log(response);
          return response.output;
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
  output: string;
  statusCode: number;
  memory: string;
  cpuTime: string;
}