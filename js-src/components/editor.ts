/*spec-start {
    "name": "editor",
    "has_content": true,
    "required_arguments": 0,
    "optional_arguments": 1,
    "option_names": ["packages", "run_on_load", "height", "max_height", "hide_code"]
} spec-end*/

import { RegisterArgs, Registration } from "../index";
import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, crosshairCursor, dropCursor, rectangularSelection, ViewPlugin } from "@codemirror/view";
import { EditorState, Extension, Compartment } from "@codemirror/state";
import { LanguageSupport, bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { lintKeymap } from "@codemirror/lint";
import {completionKeymap, closeBracketsKeymap, closeBrackets, autocompletion} from "@codemirror/autocomplete"
import { oneDark } from './one-dark';
import { PyodideInterface, loadPyodide } from "pyodide";
import { asBool, pause } from "./utils";
import { interactiveInputPlugin, interactiveInputAnnotation } from "./editor-extensions/interactive-input";
// import html2canvas from "html2canvas";

type LangRegisterResult = {
    beforeCodeElements?: HTMLElement[],
    afterCodeElements?: HTMLElement[],
    languageExtensions?: Extension[],
    runParams?: any
}

type LangSupport = {
    onRegister: (element: HTMLElement, {args, options, content}: RegisterArgs) => LangRegisterResult | Promise<LangRegisterResult>
    onRun: (code: string, manualRun: boolean, runParams?: any) => Promise<any>
}

const languages: {[lang: string]: LangSupport} = {
    "python": {
        onRegister: async (element, {args, options, content}) => {
            const output = document.createElement("div");
            output.classList.add("code-output");

            const pyodidePromise = loadPyodide({
                // indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
                indexURL: "../_static/pyodide/",
                stdin: window.prompt,
                stdout: (text: string) => {
                    const textOutput = output.querySelector("pre.current-output");
                    const el = document.createElement("div");
                    el.innerText = text;
                    textOutput.append(el);
                },
                stderr: (text: string) => {
                    const textOutput = output.querySelector("pre.current-output");
                    const el = document.createElement("div");
                    el.classList.add("error");
                    el.innerText = text;
                    textOutput.append(el);
                },
                packages: options.hasOwnProperty("packages") ? options["packages"].split(",").map((pkg: string) => pkg.trim()) : []
            }).catch((e) => {
                console.error(e);
                output.innerHTML = "Failed to load Pyodide: " + e.toString();
            });

            return {
                afterCodeElements: [output],
                languageExtensions: [python()],
                runParams: {
                    output,
                    pyodidePromise
                }
            };
        },
        onRun: async (code: string, manualRun: boolean, { output, pyodidePromise }: {output: HTMLDivElement, pyodidePromise: Promise<PyodideInterface> }) => {
            const pyodide = await pyodidePromise;
            const dict = pyodide.globals.get('dict');
            const globals = dict();
            const height = output.clientHeight;
            if(height > 0) {
                output.style.height = `${height}px`;
            }

            try {
                const oldOutputs = output.querySelectorAll("pre");
                oldOutputs.forEach((el) => el.classList.remove("current-output"));

                const newOutput = document.createElement("pre");

                newOutput.classList.add("current-output");

                output.append(newOutput);

                const matPlotLibOutput = document.createElement("div");
                matPlotLibOutput.classList.add("mpl-output");
                newOutput.append(matPlotLibOutput);
                (document as any).pyodideMplTarget  = matPlotLibOutput;

                if(manualRun) {
                    oldOutputs.forEach((el) => el.remove());
                } else {
                    newOutput.style.display = "none";
                }
                // await pause(5000);
                const result = await pyodide.runPythonAsync(code, { globals, locals: globals });

                if(result !== undefined) {
                    const textOutput = output.querySelector("pre.current-output");
                    const el = document.createElement("div");
                    el.classList.add("output");
                    el.innerText = result;
                    textOutput.append(el);
                }

                if(!manualRun) {
                    const oldOutputs = output.querySelectorAll("pre:not(.current-output)");
                    oldOutputs.forEach((el) => el.remove());
                    newOutput.style.display = "";
                }
            } catch (e) {
                const textOutput = output.querySelector("pre.current-output");
                const el = document.createElement("div");
                el.classList.add("error");
                el.innerText = e.toString();
                textOutput.append(el);
                console.log(e);
            }
            output.style.height = "";
            globals.destroy();
            dict.destroy();
        }
    },
    "javascript": {
        onRegister: async (element, {args, options, content}) => {
            return {
                languageExtensions: [javascript()],
            };
        },
        onRun: async (code: string, manualRun: boolean) => {
        }
    }
};


export default {
    name: "editor",
    register: async function (element: HTMLElement, {args, options, content, id}: RegisterArgs): Promise<void> {
        const loadingDiv = document.createElement("div");
        loadingDiv.textContent = "Loading editor...";
        loadingDiv.classList.add("loading");

        const edits: Changes = [];
        const language = args.length > 0 ? args[0].toLowerCase() : "plaintext";
        const hideCode = asBool(options["hide_code"], false);
        let initRunParams: any = null;

        if(hideCode) {
            if(languages.hasOwnProperty(language)) {
                const {onRegister, onRun} = languages[language];

                const {beforeCodeElements = [], afterCodeElements = [], languageExtensions = [], runParams = {} } = await onRegister(element, {args, options, content, id});
                initRunParams = runParams;
                element.append(...beforeCodeElements, ...afterCodeElements);
                run(content);
            }
        } else {
            const codePreview = document.createElement("pre");
            codePreview.classList.add("code-preview");
            codePreview.innerText = content;


            loadingDiv.append(codePreview);
            element.append(loadingDiv);


            // const mirror = document.createElement("pre");
            // let mirrorStr: string = "";
            // function updateMirror(s: string): void {
            //     mirrorStr = s;
            //     mirror.innerText = mirrorStr;
            // }
            // element.append(mirror);
            // const mirror2 = document.createElement("pre");
            // let mirrorStr2: string = "";
            // function updateMirror2(s: string): void {
            //     mirrorStr2 = s;
            //     mirror2.innerText = mirrorStr2;
            // }
            // element.append(mirror2);


            const editorContainer = document.createElement("div");

            const langExtensions: Extension[] = [];

            if(languages.hasOwnProperty(language)) {
                const runButton = document.createElement("button");
                runButton.textContent = "Run";

                const {onRegister, onRun} = languages[language];

                const {beforeCodeElements = [], afterCodeElements = [], languageExtensions = [], runParams = {} } = await onRegister(element, {args, options, content, id});
                initRunParams = runParams;
                element.append(...beforeCodeElements, runButton, editorContainer, ...afterCodeElements);

                langExtensions.push(...languageExtensions);

                runButton.addEventListener("click", async () => {
                    run(editor.state.doc.toString());
                });
            } else {
                element.append(editorContainer);
            }

            const basicSetup: Extension = (() => [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                history(),
                foldGutter(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentOnInput(),
                syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                rectangularSelection(),
                crosshairCursor(),
                highlightActiveLine(),
                highlightSelectionMatches(),
                EditorView.updateListener.of((update) => {
                    if(update.docChanged) {
                        let isInteractiveChange: boolean = false;
                        for(const transaction of update.transactions) {
                            if(transaction.annotation(interactiveInputAnnotation)) {
                                isInteractiveChange = true;
                                break;
                            }
                        }

                        if(isInteractiveChange) {
                            // console.log(update.state.doc.toString());
                            rateLimitedRun(false);
                        }
                        // updateMirror(update.state.doc.toString());
                        // updateMirror2(update.state.doc.toString());
                        // console.log(update.changes.toJSON());
                        const serializedChange = update.changes.toJSON() as SerializedChange;
                        edits.push({t: "e", d: serializedChange, s: Date.now(), ...(isInteractiveChange ? {x: 'int'} : {})});
                        // updateMirror2(getUpdatedDoc(mirrorStr2, serializedChange));

                        // if(mirrorStr !== mirrorStr2) {
                        //     console.error("Mirror mismatch");
                        // }
                        // console.log(edits);
                    // } else {
                    //     console.log(update);
                    }
                }),
                oneDark,
                interactiveInputPlugin,
                keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...searchKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
                ...lintKeymap
                ])
            ])();
            const state = EditorState.create({
                doc: content, extensions: [basicSetup, ...langExtensions]
            });
            const editor = new EditorView({ state, parent: editorContainer, });
            edits.push({t: "s", s: Date.now(), d: state.doc.toJSON() as string[]});


            if(asBool(options["run_on_load"], false)) {
                run(editor.state.doc.toString());
            }

            const rateLimitedRun = debounceWithTimeLimit(() => run(editor.state.doc.toString()), 100, 200);

            if(options.hasOwnProperty("height")) {
                editor.dom.style.height = options.height;
            }
            if(options.hasOwnProperty("max_height")) {
                editor.dom.style.maxHeight = options.max_height;
            }
        }
        loadingDiv.remove();

        function run(code: string, manualRun: boolean = true): void {
            if(languages.hasOwnProperty(language)) {
                const {onRun} = languages[language];
                onRun(code, manualRun, initRunParams);
            }
            edits.push({t: "r", s: Date.now(), ...(manualRun ? {} : {x: 'int'})});
        }
    }
} as Registration;

function debounceWithTimeLimit(func: Function, wait: number, maxWait: number): Function {
    let timeout: number | null;
    let lastRun: number = 0;

    return function(this: any, ...args: any[]): void {
        const context = this;
        const later = function() {
            timeout = null;
            lastRun = Date.now();
            func.apply(context, args);
        };

        if(timeout !== null) {
            clearTimeout(timeout);
        }

        const timeSinceLastRun = Date.now() - lastRun;
        if(timeSinceLastRun > maxWait) {
            later();
        } else {
            timeout = setTimeout(later, Math.max(wait, maxWait - timeSinceLastRun)) as any as number;
        }
    };
}

type SerializedChange = (number | [number, ...string[]])[]

function getUpdatedDoc(doc: string, serializedChange: SerializedChange): string {
    let newDoc: string = "";
    let cursor: number = 0;
    for(const change of serializedChange) {
        if(typeof change === "number") {
            newDoc += doc.slice(cursor, change + cursor);
            cursor += change;
        } else {
            const [ numChars, ...text ] = change;
            cursor += numChars;
            newDoc += text.join("\n");
        }
    }
    return newDoc;
}

type StartChange = {
    t: "s",
    d: string[],
    s: number
}

type EditChange = {
    t: "e",
    d: SerializedChange,
    s: number,
    x?: any
}

type Run = {
    t: "r",
    s: number,
    x?: any
}

type Changes = (StartChange | EditChange | Run)[];