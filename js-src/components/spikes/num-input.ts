export default class NumericInput {
    private value: number;
    private minValue: number;
    private maxValue: number;
    private step: number;
    private readonly parentElement: HTMLElement;
    private readonly slider: HTMLInputElement;
    private readonly numInput: HTMLInputElement;
    private readonly changeListeners: ((value: number) => void)[] = [];

    public constructor(label: string, minValue: number, maxValue: number, value: number, step: number) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.value = value;
        this.step = step;

        this.parentElement = document.createElement("div");
        const labelElement = document.createElement("label");
        labelElement.innerText = label;
        this.slider = document.createElement("input");
        this.slider.setAttribute("type", "range");
        this.numInput = document.createElement("input");
        this.numInput.setAttribute("type", "number");
        this.numInput.setAttribute("id", `num-input-${Math.random().toString().slice(2)}`);
        labelElement.setAttribute("for", this.numInput.id);
        this.parentElement.append(labelElement, this.numInput, this.slider);

        this.numInput.addEventListener("input", () => {
            this.value = parseFloat(this.numInput.value);
            this.slider.value = this.value.toString();
            this.doOnChange();
        });
        this.slider.addEventListener("input", () => {
            this.value = parseFloat(this.slider.value);
            this.numInput.value = this.value.toString();
            this.doOnChange();
        });
        this.updateOptions();
    };

    public setOptions({minValue, maxValue, value, step}: {minValue?: number, maxValue?: number, value?: number, step?: number}): void {
        if(minValue !== undefined) { this.minValue = minValue; }
        if(maxValue !== undefined) { this.maxValue = maxValue; }
        if(value !== undefined) { this.numInput.value = this.slider.value = `${value}`; }
        if(step !== undefined) { this.step = step; }
        this.updateOptions();
    }

    private updateOptions(): void {
        this.numInput.setAttribute("min", `${this.minValue}`);
        this.numInput.setAttribute("max", `${this.maxValue}`);
        this.numInput.setAttribute("step", `${this.step}`);
        this.numInput.setAttribute("value", `${this.value}`);
        this.slider.setAttribute("min", `${this.minValue}`);
        this.slider.setAttribute("max", `${this.maxValue}`);
        this.slider.setAttribute("step", `${this.step}`);
        this.slider.setAttribute("value", `${this.value}`);
    }
    
    private doOnChange(): void {
        this.changeListeners.forEach(listener => listener(this.value));
    }
    public onChange(listener: (value: number) => void): void {
        this.changeListeners.push(listener);
    }
    public getValue(): number {
        return this.value;
    }

    public getElement(): HTMLElement {
        return this.parentElement;
    }
}
// export default function numericInput(min: number, max: number, value: number, step: number, onChange?: (value: number) => void): HTMLElement {
//     const parentElement = document.createElement("div");

//     const slider = document.createElement("input");

//     const numInput = document.createElement("input");
//     numInput.setAttribute("type", "number");
//     numInput.setAttribute("min", `${min}`);
//     numInput.setAttribute("max", `${max}`);
//     numInput.setAttribute("value", `${value}`);
//     numInput.setAttribute("step", `${step}`);

//     parentElement.append(numInput, slider);

//     numInput.addEventListener("input", () => {
//         slider.value = numInput.value;
//         onChange?.(parseFloat(numInput.value));
//     });
//     slider.addEventListener("input", () => {
//         numInput.value = slider.value;
//         onChange?.(parseFloat(numInput.value));
//     });

//     return parentElement;
// }