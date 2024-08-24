/*spec-start {
    "name": "scaled-spikes-by-frequency",
    "has_content": false,
    "required_arguments": 0,
    "optional_arguments": 0,
    "option_names": []
} spec-end*/

import { RegisterArgs, Registration } from "../../index";
import plotSpikes from "./plot-spikes";
import NumericInput from "./num-input";
import { simpleFrequencySpikes } from "./spikes-by-frequency";

const padding = 5;
const height = 30;
const width = 800;


export default {
    name: "scaled-spikes-by-frequency",
    register: function (element: HTMLElement, {args, options, content}: RegisterArgs): void {
        const f_min = new NumericInput("Minimum Firing Frequency",   0, 0.9, 0,  0.01);
        const f_max = new NumericInput("Maximum Firing Frequency", 1.0, 3.0, 1,  0.01);
        const v_min = new NumericInput("Minimum Encoded Value",    -10,   0, -5, 0.01);
        const v_max = new NumericInput("Maximum Encoded Value",      0,  10,  5, 0.01);
        const v     = new NumericInput("Value",                     -5,   5,  1, 0.01);
        f_min.onChange(() => { updatePaths(v.getValue()); });
        f_max.onChange(() => { updatePaths(v.getValue()); });
        v_min.onChange((value) => {
            v.setOptions({minValue: value});
            v_max.setOptions({minValue: value});
            updatePaths(v.getValue());
        });
        v_max.onChange((value) => {
            v.setOptions({maxValue: value});
            v_min.setOptions({maxValue: value});
            updatePaths(v.getValue());
        });
        v.onChange(updatePaths);

        const svgParent = document.createElement("div");
        svgParent.style.backgroundColor = "#FFF";

        function updatePaths(freq: number) {
            svgParent.innerHTML = "";
            const T = 10;
            const spikes = scaledFrequencySpikes(freq, T, v_min.getValue(), v_max.getValue(), f_min.getValue(), f_max.getValue());
            plotSpikes(svgParent, spikes, T, svgParent.getBoundingClientRect().width, height, padding);
        };


        element.prepend(f_min.getElement(), f_max.getElement(), v_min.getElement(), v_max.getElement(), v.getElement(), svgParent);

        updatePaths(v.getValue());
    }
} as Registration;

function scaledFrequencySpikes(value: number, T: number, minValue: number, maxValue: number, minFreq: number, maxFreq: number, dt:number=0.01): IterableIterator<number> {
    return simpleFrequencySpikes((value - minValue) / (maxValue - minValue) * (maxFreq - minFreq) + minFreq, T, dt)
}
