/*spec-start {
    "name": "poisson-spikes",
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
    name: "poisson-spikes",
    register: function (element: HTMLElement, {args, options, content}: RegisterArgs): void {
        const f_min = new NumericInput("Minimum Firing Frequency",   0, 0.9, 0,  0.01);
        const f_max = new NumericInput("Maximum Firing Frequency", 1.0, 3.0, 1,  0.01);
        const v_min = new NumericInput("Minimum Encoded Value",    -10,   0, -5, 0.01);
        const v_max = new NumericInput("Maximum Encoded Value",      0,  10,  5, 0.01);
        const v     = new NumericInput("Value",                     -5,   5,  1, 0.01);
        v_min.onChange((value) => {
            v.setOptions({minValue: value});
            v_max.setOptions({minValue: value});
        });
        v_max.onChange((value) => {
            v.setOptions({maxValue: value});
            v_min.setOptions({maxValue: value});
        });
        v.onChange(updatePaths);

        const outputEstimate = document.createElement("div");
        const svgParent = document.createElement("div");
        svgParent.style.backgroundColor = "#FFF";

        function updatePaths(freq: number) {
            svgParent.innerHTML = "";
            const T = 10;
            const spikes = scaledPoissonSpikes(freq, T, v_min.getValue(), v_max.getValue(), f_min.getValue(), f_max.getValue());
            const allSpikes = plotSpikes(svgParent, spikes, T, svgParent.getBoundingClientRect().width, height, padding);
            const estimatedValue = allSpikes.length / T * (v_max.getValue() - v_min.getValue()) / (f_max.getValue() - f_min.getValue()) + v_min.getValue();
            // estimated_value = len(spikes) / T * (v_max - v_min) / (f_max - f_min) + v_min
            outputEstimate.innerHTML = `Spikes: ${allSpikes.length} over ${T} seconds. Estimated Value: <strong>${estimatedValue.toFixed(2)}</strong> (Actual: ${v.getValue()}; Error: ${Math.abs(estimatedValue - v.getValue()).toFixed(2)})`;
        };


        element.prepend(f_min.getElement(), f_max.getElement(), v_min.getElement(), v_max.getElement(), v.getElement(), svgParent, outputEstimate);

        updatePaths(v.getValue());
    }
} as Registration;

function* poissonSpikes(freq: number, T: number, dt=0.01): IterableIterator<number> {
    const numSteps = Math.floor(T / dt);
    // const spikes: number[] = [];
    for(let step = 0; step < numSteps; step++) {
        const probFire = freq * dt;
        if(Math.random() < probFire) {
            const t = step * dt;
            // spikes.push(t);
            yield t;
        }
    }
    // return spikes;
}
function scaledPoissonSpikes(v: number, T: number, v_min: number, v_max: number, f_min: number, f_max: number, dt=0.01) {
  return poissonSpikes(f_min + (f_max - f_min)*(v - v_min)/(v_max - v_min), T, dt);
}

