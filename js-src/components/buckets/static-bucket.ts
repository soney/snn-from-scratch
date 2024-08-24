/*spec-start {
    "name": "static-bucket",
    "has_content": false,
    "required_arguments": 0,
    "optional_arguments": 0,
    "option_names": []
} spec-end*/

import { RegisterArgs, Registration } from "../../index";
import { SVG } from '@svgdotjs/svg.js'

const padding = 5;
const bucketHeight = 50;
const bucketWidth = 40;
const minHoleWidth = 0;
const maxHoleWidth = 0;
const maxSinkingHeight = bucketHeight/4;
const maxDrainHeight = 0;
const maxDrainAngle = Math.PI/4;
const strokeColor = "#777";
const waterColor = "#ADD8E6";

export default {
    name: "static-bucket",
    register: function (element: HTMLElement, {args, options, content}: RegisterArgs): void {
        const slider = document.createElement("input");
        slider.setAttribute("type", "range");
        slider.setAttribute("min", "0");
        slider.setAttribute("max", "100");
        slider.setAttribute("value", "50");
        slider.setAttribute("step", "1");

        const updatePaths = () => {
            const fill_pct = parseInt(slider.value);
            const paths = getPaths(padding, bucketWidth, bucketHeight, fill_pct/100, maxSinkingHeight, minHoleWidth, maxHoleWidth, maxDrainHeight, maxDrainAngle);
            fill.attr("d", paths.water);
            path.attr("d", paths.bucket);
        };

        slider.addEventListener("input", updatePaths);

        const draw = SVG().addTo(element).size(bucketWidth + 2*padding, bucketHeight + Math.max(0, maxSinkingHeight) + maxDrainHeight + 2*padding);
        const fill = draw.path().attr("stroke", "none").attr("fill", waterColor);
        const path = draw.path().attr("stroke", strokeColor).attr("fill", "none").attr("stroke-width",2);

        element.prepend(slider);

        updatePaths();
    }
} as Registration;

function getPaths(padding: number, width: number, height: number, pct: number, maxSinkingHeight:number, minHoleWidth:number, maxHoleWidth:number, maxDrainHeight: number, maxDrainAngle: number): {drain: string, bucket: string, water: string} {
    const sag = pct * maxSinkingHeight;
    const holeWidth = Math.max(minHoleWidth, pct * maxHoleWidth);
    const x_skew = pct*pct*pct*maxDrainHeight*Math.sin(maxDrainAngle*pct);
    
    return {
        drain: `M ${padding+(width-holeWidth)/2} ${padding+height+sag} h ${holeWidth} l ${x_skew} ${2+pct * maxDrainHeight} h -${2*x_skew + holeWidth}`,
        bucket: `M ${padding} ${padding} v ${height} q 0 ${sag} ${(width - holeWidth)/2} ${sag} m ${holeWidth} 0 q ${width/2 - holeWidth/2} 0 ${width/2 - holeWidth/2} ${-sag} v ${-height}`,
        water: `M ${padding} ${padding+height*(1-pct)} v ${height*pct} q 0 ${sag} ${(width - holeWidth)/2} ${sag} l ${holeWidth} 0 q ${width/2 - holeWidth/2} 0 ${width/2 - holeWidth/2} ${-sag} v ${-height*pct}`
    };
};