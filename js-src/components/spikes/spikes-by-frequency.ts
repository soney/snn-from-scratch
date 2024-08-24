/*spec-start {
    "name": "spikes-by-frequency",
    "has_content": false,
    "required_arguments": 0,
    "optional_arguments": 0,
    "option_names": []
} spec-end*/

import { RegisterArgs, Registration } from "../../index";
import plotSpikes from "./plot-spikes";
import NumericInput from "./num-input";

const padding = 5;
const height = 30;
const width = 810;

const strokeColor = "#777";

export default {
    name: "spikes-by-frequency",
    register: function (element: HTMLElement, {args, options, content}: RegisterArgs): void {
        const [min, max, value, step] = [0.01, 3.0, 1, 0.01];
        const numericInput = new NumericInput("Frequency", min, max, value, step);
        numericInput.onChange(updatePaths);

        const svgParent = document.createElement("div");
        svgParent.style.backgroundColor = "#FFF";

        function updatePaths(freq: number) {
            svgParent.innerHTML = "";
            const T = 10;
            const spikes = simpleFrequencySpikes(freq, T);
            plotSpikes(svgParent, spikes, T, svgParent.getBoundingClientRect().width, height, padding);
        };


        element.prepend(numericInput.getElement(), svgParent);

        updatePaths(numericInput.getValue());
    }
} as Registration;

export function* simpleFrequencySpikes(freq: number, T: number, dt:number=0.01): IterableIterator<number> {
    // const spikes: number[] = [];
    if(freq <= 0) {
        return;
        // return spikes;
    }
    const period = 1.0 / freq;
    const stepsPerSpike = Math.floor(period / dt);
    const numSteps = Math.floor(T / dt);
    for(let step = 0; step < numSteps; step++) {
        if(step % stepsPerSpike === 0) {
            const t = step * dt;
            yield t;
            // spikes.push(t);
        }
    }
    // return spikes;
}