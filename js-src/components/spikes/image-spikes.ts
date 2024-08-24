/*spec-start {
    "name": "image-spikes",
    "has_content": true,
    "required_arguments": 0,
    "optional_arguments": 0,
    "option_names": ["width", "height"]
} spec-end*/

import { RegisterArgs, Registration } from "../../index";
import plotSpikes from "./plot-spikes";
import NumericInput from "./num-input";
import { simpleFrequencySpikes } from "./spikes-by-frequency";
import { SVG } from '@svgdotjs/svg.js';
import chroma from "chroma-js";

const padding = 5;
const height = 30;
const width = 800;


export default {
    name: "image-spikes",
    register: function (element: HTMLElement, {args, options, content}: RegisterArgs): void {
        const digitWidth = parseInt(options.width);
        const digitHeight = parseInt(options.height);
        const data = content.split(",").map((x) => parseFloat(x));
        const min_rate = new NumericInput("Minimum Rate (noise)", 0, 0.8, 0.003, 0.0001);
        console.log(data);

        const DATA_MIN_VAL = 0;
        const DATA_MAX_VAL = 255;
        const MAX_FIRING_RATE = 1;
        const tau = 0.8;
        const delta_t = 0.001;


        const PIXEL_SIZE = 12;
        const svg = SVG().size(PIXEL_SIZE * digitWidth, PIXEL_SIZE * digitHeight).addTo(element);
        const colorScale = chroma.scale(["white", "black", "red"]).domain([0, 0.1/delta_t, 1/delta_t]);
        const v = data.map(() => 0);

        const rectangles = data.map((intensity, idx) => {
            const [x, y] = idx2Coordinates(idx, digitWidth, digitHeight);
            return svg.rect(PIXEL_SIZE, PIXEL_SIZE)
                        .move(x * PIXEL_SIZE, y * PIXEL_SIZE)
                        .fill('none');
        });
        function idx2Coordinates(idx: number, rows: number, cols: number) {
            const col = idx % cols;
            const row = Math.floor(idx / rows);
            return [col, row];
        }

        function update(dt: number): void {
            data.forEach((intensity, i) => {
                const firingProbability = dt * (min_rate.getValue() + (MAX_FIRING_RATE - min_rate.getValue()) * (intensity - DATA_MIN_VAL) / (DATA_MAX_VAL - DATA_MIN_VAL));

                const fires = Math.random() < firingProbability;
                v[i] = v[i] * (1 - dt / tau);
                if (fires) {
                    v[i] += 1 / dt;
                }
                rectangles[i].fill(colorScale(v[i]).hex());
            });

            const lastRun = Date.now();
            setTimeout(() => {
                update((Date.now() - lastRun) / 1000);
            }, delta_t * 1000);
        }

        update(0);


        // v.onChange(updatePaths);

        // const outputEstimate = document.createElement("div");
        // const svgParent = document.createElement("div");
        // svgParent.style.backgroundColor = "#FFF";

        // function updatePaths(freq: number) {
        //     svgParent.innerHTML = "";
        //     const T = 10;
        //     const spikes = scaledPoissonSpikes(freq, T, v_min.getValue(), v_max.getValue(), f_min.getValue(), f_max.getValue());
        //     const allSpikes = plotSpikes(svgParent, spikes, T, svgParent.getBoundingClientRect().width, height, padding);
        //     const estimatedValue = allSpikes.length / T * (v_max.getValue() - v_min.getValue()) / (f_max.getValue() - f_min.getValue()) + v_min.getValue();
        //     // estimated_value = len(spikes) / T * (v_max - v_min) / (f_max - f_min) + v_min
        //     outputEstimate.innerHTML = `Spikes: ${allSpikes.length} over ${T} seconds. Estimated Value: <strong>${estimatedValue.toFixed(2)}</strong> (Actual: ${v.getValue()}; Error: ${Math.abs(estimatedValue - v.getValue()).toFixed(2)})`;
        // };


        // element.prepend(f_min.getElement(), f_max.getElement(), v_min.getElement(), v_max.getElement(), v.getElement(), svgParent, outputEstimate);

        // updatePaths(v.getValue());
        element.prepend(min_rate.getElement());
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

