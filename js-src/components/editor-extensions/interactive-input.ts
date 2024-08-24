import {Annotation, Range} from "@codemirror/state";
import {WidgetType, EditorView, Decoration, DecorationSet, ViewUpdate, ViewPlugin} from "@codemirror/view";
import {syntaxTree } from "@codemirror/language"
import { SyntaxNodeRef } from "@lezer/common";

const checkboxRegex = /^#.*<-CHECK\s*$/;
const sliderRegex = /^#.*<-SLIDE\s*(\(\s*(-?\d+(\.\d*)?)\s*to\s*(-?\d+(\.\d+)?)\s*(by\s+(\d+(\.\d*)?))?\s*\))?\s*$/;
const selectRegex = /^#.*<-SELECT\s*\((\s*[^\)]+\s*)\)\s*$/;

export const interactiveInputAnnotation = Annotation.define<string>();

function inputs(view: EditorView, priorDecorations: DecorationSet = Decoration.none) {
    const widgets: Range<Decoration>[] = [];

    for (const {from, to} of view.visibleRanges) {
        let prevNodeFromTo: {name: SyntaxNodeRef["name"],from: SyntaxNodeRef["from"], to: SyntaxNodeRef["to"]} | null = null;
        syntaxTree(view.state).iterate({
            from, to,
            enter: (node) => {
                if (node.name == "Comment") {
                    const commentStr = view.state.doc.sliceString(node.from, node.to);

                    const checkboxMatches = commentStr.match(checkboxRegex);
                    const sliderMatches = commentStr.match(sliderRegex);
                    const selectMatches = commentStr.match(selectRegex);

                    if(checkboxMatches && checkboxMatches.length > 0 && prevNodeFromTo !== null) {
                        if(prevNodeFromTo.name === "Boolean") {
                            const isTrue = view.state.doc.sliceString(prevNodeFromTo.from, prevNodeFromTo.to) === "True";
                            const deco = Decoration.widget({
                                widget: new CheckboxWidget(isTrue, {from: prevNodeFromTo.from, to: prevNodeFromTo.to}),
                                side: 1
                            });
                            widgets.push(deco.range(node.from));
                        }
                    } else if(sliderMatches && sliderMatches.length > 0 && prevNodeFromTo !== null) {
                        if(prevNodeFromTo.name === "Number") {
                            const lowValue = parseFloat(sliderMatches[2])  ?? 0;
                            const highValue = parseFloat(sliderMatches[4]) ?? 100;
                            let value: number = parseFloat(view.state.doc.sliceString(prevNodeFromTo.from, prevNodeFromTo.to));
                            if(view.state.doc.sliceString(prevNodeFromTo.from-1, prevNodeFromTo.from) === "-") { // Negative sign gets counted as Arithmetic Op so isn't included in the range; add it
                                value *= -1;
                                prevNodeFromTo.from -= 1;
                            }

                            const step = parseFloat(sliderMatches[7] ??
                                                    ((highValue - lowValue) / 100).toFixed(Math.max(getNumDigitPlaces(lowValue), getNumDigitPlaces(highValue))+3));

                            const numberDisplaySpec = getDigitCounts(lowValue, highValue, step);
                            const totalSpace = getTotalSpaceRequired(numberDisplaySpec);
                            const spaceToAdd: number = totalSpace - (prevNodeFromTo.to - prevNodeFromTo.from);
                            if(spaceToAdd > 0) {
                                const spaceToCheck = view.state.doc.sliceString(prevNodeFromTo.from-spaceToAdd, prevNodeFromTo.from);
                                for(let i = spaceToCheck.length-1; i >= 0; i--) {
                                    if(spaceToCheck[i] === " ") {
                                        prevNodeFromTo.from -= 1;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            const deco = Decoration.widget({
                                widget: new SliderWidget(view, value, {from: prevNodeFromTo.from, to: prevNodeFromTo.to}, lowValue, highValue, step, numberDisplaySpec),
                                side: 1
                            });
                            widgets.push(deco.range(node.from));
                        }
                    } else if(selectMatches && selectMatches.length > 0 && prevNodeFromTo !== null) {
                        if(prevNodeFromTo.name === "String") {
                            const value = view.state.doc.sliceString(prevNodeFromTo.from, prevNodeFromTo.to);
                            const values = selectMatches[1].split(",").map((val) => val.trim());
                            const deco = Decoration.widget({
                                widget: new SelectWidget(view, value, values, {from: prevNodeFromTo.from, to: prevNodeFromTo.to}),
                                side: 1
                            });
                            widgets.push(deco.range(node.from));
                        }
                    }
                }
                prevNodeFromTo = {name: node.name, from: node.from, to: node.to};
            }
        })
    }
    return Decoration.set(widgets)
}


class CheckboxWidget extends WidgetType {
    public constructor(private readonly checked: boolean, private readonly targetRange: {from: number, to: number}) {
        super();
    }

    public eq(other: CheckboxWidget) {
        return other.checked == this.checked && other.targetRange.from == this.targetRange.from && other.targetRange.to == this.targetRange.to;
    }

    public toDOM() {
        const wrap = document.createElement("span");
        wrap.setAttribute("aria-hidden", "true");
        wrap.classList.add("cm-boolean-toggle");

        const box = wrap.appendChild(document.createElement("input"));
        box.setAttribute("type", "checkbox");
        box.setAttribute("data-from", this.targetRange.from.toString());
        box.setAttribute("data-to", this.targetRange.to.toString());
        box.checked = this.checked;

        return wrap;
    }

    public ignoreEvent() {
        return false;
    }
}
class SliderWidget extends WidgetType {
    public constructor(private readonly view: EditorView, private readonly value: number, public readonly targetRange: {from: number, to: number}, private readonly lowValue: number, private readonly highValue: number, private readonly step: number, private readonly numberDisplaySpec: NumberDisplaySpec) {
        super();
    }

    public eq(other: SliderWidget) {
        // return other && other.targetRange.from == this.targetRange.from && other.targetRange.to == this.targetRange.to;
        return other && other.targetRange.to == this.targetRange.to /*&& this.targetRange.from == other.targetRange.from*/ && this.lowValue == other.lowValue && this.highValue == other.highValue && this.step == other.step;
    }

    public toDOM() {
        const wrap = document.createElement("span");
        wrap.setAttribute("aria-hidden", "true");
        wrap.classList.add("cm-slider-widget");

        const { canBeNegative, digitPlaces, hasDecimal, decimalPlaces } = this.numberDisplaySpec;

        const slider = document.createElement("input");
        slider.setAttribute("type", "range");
        slider.setAttribute("min", this.lowValue.toString());
        slider.setAttribute("max", this.highValue.toString());
        slider.setAttribute("step", this.step.toString());
        slider.setAttribute("value", this.value.toString());

        slider.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            const value = parseFloat(target.value);
            changeValue(this.view, this.targetRange, pad(value, {canBeNegative, digitPlaces, hasDecimal, decimalPlaces}), "slider");
        });

        wrap.appendChild(slider);

        return wrap;
    }

    public updateDOM(dom: HTMLElement, view: EditorView): boolean {
        super.updateDOM(dom, view);
        const slider = dom.querySelector("input") as HTMLInputElement;
        slider.setAttribute("min", this.lowValue.toString());
        slider.setAttribute("max", this.highValue.toString());
        slider.setAttribute("step", this.step.toString());
        slider.setAttribute("value", this.value.toString());

        return false;
    }

    public destroy(dom: HTMLElement): void {
        super.destroy(dom);
    }

    public ignoreEvent(ev: Event) {
        if(ev.type === "input") {
            return false;
        } else {
            return true;
        }
    }
}

class SelectWidget extends WidgetType {
    public constructor(private readonly view: EditorView, private readonly startingValue: string, private readonly values: string[], private readonly targetRange: {from: number, to: number}) {
        super();
    }

    public eq(other: SelectWidget) {
        if(other.values.length !== this.values.length) {
            return false;
        } else {
            for(let i = 0; i < this.values.length; i++) {
                if(other.values[i] !== this.values[i]) {
                    return false;
                }
            }
            return this.targetRange.from === other.targetRange.from && this.targetRange.to === other.targetRange.to;
        }
    }

    public toDOM() {
        const wrap = document.createElement("span");
        wrap.setAttribute("aria-hidden", "true");
        wrap.classList.add("cm-select-widget");

        const select = wrap.appendChild(document.createElement("select"));
        for(const value of this.values) {
            const option = select.appendChild(document.createElement("option"));
            option.value = value;
            option.text = value;
            if(SelectWidget.standardizeQuotationMarks(value) === SelectWidget.standardizeQuotationMarks(this.startingValue)) {
                option.selected = true;
            }
        }

        select.addEventListener("change", (e) => {
            const target = e.target as HTMLSelectElement;
            const value = SelectWidget.standardizeQuotationMarks(target.value);
            const from = this.targetRange.from;
            const to   = this.targetRange.to;
            changeValue(this.view, {from, to}, value, "select");
        });

        return wrap;
    }

    public static standardizeQuotationMarks(value: string): string {
        if((value.startsWith('"') || value.startsWith('f"')) && value.endsWith('"')) {
            return value;
        } else if((value.startsWith("'") || value.startsWith("f'")) && value.endsWith("'")) {
            return value;
        } else {
            return `"${value}"`;
        }
    }
}

export const interactiveInputPlugin = ViewPlugin.fromClass(class {
        public decorations: DecorationSet;

        public constructor(view: EditorView) {
            this.decorations = inputs(view);
        }

        public update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged ||
                syntaxTree(update.startState) != syntaxTree(update.state)) {
                this.decorations = inputs(update.view, this.decorations)
            }
        }
    }, {
        decorations: v => v.decorations,
        eventHandlers: {
            mousedown: (e, view) => {
                const target = e.target as HTMLInputElement;
                if (target.nodeName == "INPUT" && target.parentElement!.classList.contains("cm-boolean-toggle")) {
                    const from = parseInt(target.getAttribute("data-from")!);
                    const to   = parseInt(target.getAttribute("data-to")!);
                    // return toggleBoolean(view, view.posAtDOM(target));
                    return toggleBoolean(view, {from, to}, target.checked);
                // } else if (target.nodeName == "INPUT" && target.parentElement!.classList.contains("cm-slider-widget")) {
                    // const from = parseInt(target.getAttribute("data-from")!);
                    // const to   = parseInt(target.getAttribute("data-to")!);
                    // return toggleBoolean(view, view.posAtDOM(target));
                    // return toggleBoolean(view, {from, to}, target.checked);
                    // console.log(target);
                    // e.preventDefault();
                    // return true;
                }
            },
            // input: (e, view) => {
            //     const target = e.target as HTMLInputElement;
            //     if (target.nodeName == "INPUT" && target.parentElement!.classList.contains("cm-slider-widget")) {
            //         const value = parseFloat(target.value);
            //         const from = parseInt(target.getAttribute("data-from")!);
            //         const to   = parseInt(target.getAttribute("data-to")!);
            //         const canBeNegative = target.getAttribute("data-can-be-negative") === "true";
            //         const digitPlaces = parseInt(target.getAttribute("data-digit-places")!);
            //         const hasDecimal = target.getAttribute("data-has-decimal") === "true";
            //         const decimalPlaces = parseInt(target.getAttribute("data-decimal-places")!);

            //         return changeValue(view, {from, to}, pad(value, {canBeNegative, digitPlaces, hasDecimal, decimalPlaces}));
            //     }
            // },
            mousemove: (e, view) => {
                const target = e.target as HTMLInputElement;
                if (target.nodeName == "INPUT" && target.parentElement!.classList.contains("cm-slider-widget")) {
                    return true;
                }
            }
        }
    });


function toggleBoolean(view: EditorView, pos: {from: number, to: number}, checked: boolean) {
    const before = view.state.doc.sliceString(pos.from, pos.to);

    let change;
    if (before === "False") {
        change = {from: pos.from, to: pos.to, insert: "True"};
    } else if (before.endsWith("True")) {
        change = {from: pos.from, to: pos.to, insert: "False"};
    } else {
        change = {from: pos.from, to: pos.to, insert: checked ? "True" : "False"};
    }
    view.dispatch({changes: change, annotations: interactiveInputAnnotation.of("interactive-input")});
    return true;
}

function changeValue(view: EditorView, pos: {from: number, to: number}, valueString: string, annotation: string) {
    // const newPos = { from: pos.from, to: pos.to };
    // while(spaceToAdd > 0) { // look backward for whitespace to consume
    //     if(view.state.doc.sliceString(newPos.from-1, newPos.from) === " ") {
    //         newPos.from -= 1;
    //         spaceToAdd -= 1;
    //     } else {
    //         break;
    //     }
    // }
    // while(spaceToAdd > 0) { // look forward for whitespace to consume
    //     if(view.state.doc.sliceString(newPos.to, newPos.to+1) === " ") {
    //         newPos.to += 1;
    //         spaceToAdd -= 1;
    //     } else {
    //         break;
    //     }
    // }

    const change = {from: pos.from, to: pos.to, insert: valueString};
    // const change = {from: pos.from, to: pos.to, insert: valueString.slice(0, pos.to - pos.from)};
    // const change = { from: pos.from, to: pos.to, insert: valueString };

    // console.log(view.state.doc.sliceString(pos.from-1, pos.from));
    // if(view.state.doc.sliceString(pos.from-1, pos.from) === "-") { // Negative sign gets counted as Arithmetic Op so isn't included in the range; add it
    //     change.from -= 1;
    // }

    view.dispatch({changes: change, annotations: interactiveInputAnnotation.of(annotation)});

    return true;
}

function getNumIntDigits(num: number): number {
    const result = Math.floor(Math.abs(num)).toString().length;
    if(isNegative(num)) {
        return result + 1;
    } else {
        return result;
    }
}
function isNegative(num: number): boolean {
    return num < 0;
}
function hasDecimalPlace(num: number): boolean {
    return !Number.isInteger(num);
}
function getNumDigitPlaces(num: number): number {
    const numString = Math.abs(num).toString();
    const dotIndex = numString.indexOf(".");
    if(dotIndex === -1) {
        return 0;
    } else {
        return numString.length - dotIndex - 1;
    }
}

function getDigitCounts(low: number, high: number, step: number): NumberDisplaySpec {
    const canBeNegative = isNegative(low) || isNegative(high);
    const digitPlaces = Math.max(getNumIntDigits(low), getNumIntDigits(high));
    const lowDecimalPlaces = getNumDigitPlaces(low);
    const highDecimalPlaces = getNumDigitPlaces(high);

    const hasDecimal = hasDecimalPlace(step) || hasDecimalPlace(low) || hasDecimalPlace(high);
    const decimalPlaces = hasDecimal ? Math.max(getNumDigitPlaces(step), lowDecimalPlaces, highDecimalPlaces) : 0;

    return {canBeNegative, digitPlaces, hasDecimal, decimalPlaces};
}
function getTotalSpaceRequired(spec: NumberDisplaySpec): number {
    return spec.digitPlaces + (spec.hasDecimal ? spec.decimalPlaces + 1 : 0);
}

function pad(val: number, {digitPlaces, hasDecimal, decimalPlaces}: NumberDisplaySpec): string {
    let result: string;
    if(hasDecimal) {
        const valString = val.toFixed(decimalPlaces);
        if(valString.indexOf(".") === -1) {
            result = valString.padStart(digitPlaces+decimalPlaces+1, " ");
        } else {
            const [intPart, decPart] = valString.split(".");
            result = intPart.padStart(digitPlaces, " ") + "." + decPart;
        }
    } else {
        result = Math.round(val).toString().padStart(digitPlaces, " ");
    }
    return result;
}

type NumberDisplaySpec = {
    canBeNegative: boolean,
    digitPlaces: number,
    hasDecimal: boolean,
    decimalPlaces: number
}
