/*spec-start {
    "name": "leaky-bucket",
    "has_content": false,
    "required_arguments": 0,
    "optional_arguments": 0,
    "option_names": ["fires", "tau_rc", "button_selector"]
} spec-end*/

import { SVG, Path, Text, Svg } from '@svgdotjs/svg.js';
import { RegisterArgs, Registration } from '../../index';
import { asBool, asFloat, asInt } from '../utils';

export default {
    name: "leaky-bucket",
    register: function (element: HTMLElement, {args, options, content}: RegisterArgs): void {
        console.log(options);
        const tau_rc = asInt(options.tau_rc, 2000);
        const leaks = asBool(options.leaks, true);
        const fires = asBool(options.fires, true);
        const startingPct = asFloat(options.startingPct, 0);
        const onFire = () => {};
        const onReadyToFire = () => {};
        const refractoryPeriod = asInt(options.refractoryPeriod, 3000);
        const showGraph = options.graph ?? true;
        const graphTimeFrame = asInt(options.graphTimeFrame, 30 * 1000);

        const padding = asInt(options.padding, 5);
        const bucketHeight = asInt(options.bucketHeight,  50);
        const bucketWidth = asInt(options.bucketWidth, 40);
        const graphWidth = asInt(options.graphWidth, 500);

        const minHoleWidth = leaks ? asInt(options.minHoleWidth, 1) : 0;
        const maxHoleWidth = leaks ? asInt(options.maxHoleWidth, bucketWidth / 2) : 0;
        const maxSinkingHeight = asFloat(options.maxSinkingHeight, bucketHeight / 4);
        const maxDrainHeight = asFloat(options.maxDrainHeight, 15);
        const maxDrainAngle = asFloat(options.maxDrainAngle, Math.PI / 4);
        const refractoryDelayStart = asFloat(options.refractoryDelayStart, 0.05);
        const refractoryDelayEnd = asFloat(options.refractoryDelayEnd, 0.2);
        const refractoryFlashAnimationLength = asFloat(options.refractoryFlashAnimationLength, 300);
        const waterColor = options.waterColor || '#ADD8E6';
        const bucketColor = options.bucketColor || '#777';
        const flashColor = options.flashColor || '#FFFF33';
        const flashingBucketColor = options.flashingBucketColor || '#AAAAAA';
        const inputDisplayColor = options.inputDisplayColor || '#999999';
        const firedText = options.firedText || 'Fired';
        const firedTextColor = options.firedTextColor || 'darkOrange';

        let pct = startingPct;
        let refractoryEnd: number | false = false;
        let fired = false;
        const data: [number, number][] = [];
        const inputs: [number, number][] = [];
        const firings: number[] = [];


        const getPaths = (padding: number, width: number, height: number, pct: number) => {
            const sag = pct * maxSinkingHeight;
            const holeWidth = Math.max(minHoleWidth, pct * maxHoleWidth);
            const x_skew = pct * pct * pct * maxDrainHeight * Math.sin(maxDrainAngle * pct);

            let topAnimationPct = 0;
            if (fired) {
                const animPct = fired && (1 - ((refractoryEnd as number - Date.now()) / refractoryPeriod));

                if (animPct <= refractoryDelayStart) {
                    topAnimationPct = easeInOutCubic(animPct / refractoryDelayStart);
                } else if (animPct >= (1 - refractoryDelayEnd)) {
                    topAnimationPct = easeInOutCubic(1 - (animPct - (1 - refractoryDelayEnd)) / refractoryDelayEnd);
                } else {
                    topAnimationPct = 1;
                }
            }

            return {
                drain: `M ${padding + (width - holeWidth) / 2} ${padding + height + sag} h ${holeWidth} l ${x_skew} ${2 + pct * maxDrainHeight} h -${2 * x_skew + holeWidth}`,
                bucket: `M ${padding} ${padding} v ${height} q 0 ${sag} ${(width - holeWidth) / 2} ${sag} m ${holeWidth} 0 q ${width / 2 - holeWidth / 2} 0 ${width / 2 - holeWidth / 2} ${-sag} v ${-height}` + (fired ? ` h ${-width * topAnimationPct}` : ''),
                water: `M ${padding} ${padding + height * (1 - pct)} v ${height * pct} q 0 ${sag} ${(width - holeWidth) / 2} ${sag} l ${holeWidth} 0 q ${width / 2 - holeWidth / 2} 0 ${width / 2 - holeWidth / 2} ${-sag} v ${-height * pct}`
            };
        };

        const draw: Svg = SVG().addTo(element).size(bucketWidth + 2 * padding + (showGraph ? 2 * padding + graphWidth : 0), bucketHeight + Math.max(0, maxSinkingHeight) + maxDrainHeight + 2 * padding);
        const drain: Path = draw.path().fill(waterColor);
        const fill: Path = draw.path().fill(waterColor);
        const path: Path = draw.path().stroke({ color: bucketColor, width: 2 }).fill('none');
        const firedTextDisp: Text = draw.text('').move(padding + bucketWidth / 2 - 15, padding + bucketHeight / 2).font({ size: 14, fill: firedTextColor });

        if (showGraph) {
            const as = 3; // arrow size

            const locationIndicator: Path = draw.path().stroke({ color: waterColor, width: 0.5 }).attr({ 'stroke-dasharray': '5, 5' }).fill('none');
            const firingIndicators: Path = draw.path().stroke({ color: flashColor, width: 5 }).fill('none');
            const refractoryIndicators: Path = draw.path().attr({ opacity: 0.1 }).fill(flashingBucketColor).stroke('none');
            const inputDisplays: Path = draw.path().attr({ opacity: 0.3 }).stroke({ color: inputDisplayColor, width: 1 }).fill('none')//.plot(data);
            const graph: Path = draw.path().stroke({ color: waterColor, width: 1.5 }).fill('none')//.plot(data);
            const axis: Path = draw.path().stroke({ color: '#BBB', width: 1 }).fill('none').plot(`M ${2 * padding + bucketWidth} ${padding + bucketHeight} h ${graphWidth} l ${-as} ${-as} m ${as} ${as} l ${-as} ${as}`);

            const updateGraph = () => {
                const currTime = Date.now();
                data.push([currTime, pct]);
                while ((data.length > 0) && (data[0][0] < currTime - graphTimeFrame)) { // first data point's time
                    data.shift();
                }
                while ((firings.length > 0) && (firings[0] < currTime - graphTimeFrame)) { // first firing point's time
                    firings.shift();
                }
                while ((inputs.length > 0) && (inputs[0][0] < currTime - graphTimeFrame)) { // first input point's time
                    inputs.shift();
                }

                const dataPoints  =   data.map(d => [padding + bucketWidth + padding + graphWidth - graphWidth * (currTime - d[0]) / graphTimeFrame, padding + bucketHeight * ((100 - d[1]) / 100)]);
                const inputPoints = inputs.map(d => [padding + bucketWidth + padding + graphWidth - graphWidth * (currTime - d[0]) / graphTimeFrame, padding + bucketHeight - bucketHeight * (d[1] / 5)]);
                graph.plot(`M ` +  (dataPoints.map(dp => dp.join(' ')).join('L ')));
                inputDisplays.plot(`M ` +  (inputPoints.map(ip => ip.join(' ')).join('L ')));

                const firingStrings = firings.map(ts => `M ${padding + bucketWidth + padding + graphWidth - graphWidth * (currTime - ts) / graphTimeFrame} ${padding} v ${bucketHeight}`);
                const refractoryIndicatorsStrings = firings.map(ts => `M ${padding + bucketWidth + padding + graphWidth - graphWidth * (currTime - ts) / graphTimeFrame} ${padding} h ${refractoryPeriod * graphWidth / graphTimeFrame} v ${bucketHeight} h ${-refractoryPeriod * graphWidth / graphTimeFrame} v ${-bucketHeight}`);

                locationIndicator.plot(`M ${padding + bucketWidth} ${padding + bucketHeight * (1 - pct / 100)} h ${padding + graphWidth}`);
                firingIndicators.plot(firingStrings.join(' '));
                refractoryIndicators.plot(refractoryIndicatorsStrings.join(' '));

                requestAnimationFrame(updateGraph);
            };
            requestAnimationFrame(updateGraph);
        }

        let inp = 0;

        let lastTime = Date.now();
        const render = () => {
            const paths = getPaths(padding, bucketWidth, bucketHeight, pct / 100);
            leaks && drain.plot(paths.drain);
            fill.plot(paths.water);
            path.plot(paths.bucket);

            const currTime = Date.now();
            const dt = currTime - lastTime;

            if (fired) {
                if (refractoryEnd && refractoryEnd <= currTime) {
                    refractoryEnd = false;
                    fired = false;
                    fill.animate(refractoryFlashAnimationLength).attr({ fill: waterColor });
                    drain.animate(refractoryFlashAnimationLength).attr({ fill: waterColor });
                    path.animate(refractoryFlashAnimationLength).attr({ stroke: bucketColor });
                    firedTextDisp.text('');
                    onReadyToFire();
                } else {
                    const animationPct = 1 - ((refractoryEnd as number - currTime) / refractoryPeriod);
                    if (animationPct <= refractoryDelayStart) {
                        pct = 100;
                    } else if (animationPct >= (1 - refractoryDelayEnd)) {
                        pct = 0;
                    } else {
                        const accountedForAnimationPct = (animationPct - refractoryDelayStart) / (1 - (refractoryDelayStart + refractoryDelayEnd));
                        pct = 100 * easeInOutCubic(1 - accountedForAnimationPct);
                    }
                }
            } else {
                // const inp = 0;
                // const inp = get_inputs_fn();
                if (showGraph) {
                    inputs.push([currTime, inp]);
                }
                if(inp === 0) {
                    pct -= (inp - pct) * Math.expm1(-dt / tau_rc);
                } else {
                    pct = pct + inp 
                }

                if (pct >= 100) {
                    pct = 100;
                    if (fires && !fired) {
                        fired = true;
                        refractoryEnd = currTime + refractoryPeriod;
                        fill.animate(refractoryFlashAnimationLength).attr({ fill: flashColor });
                        drain.animate(refractoryFlashAnimationLength).attr({ fill: flashColor });
                        path.animate(refractoryFlashAnimationLength).attr({ stroke: flashingBucketColor });
                        firedTextDisp.text(firedText);
                        if (showGraph) {
                            firings.push(currTime);
                            inputs.push([currTime, 0]);
                        }
                        onFire();
                    }
                }
            }

            lastTime = currTime;
            if (leaks) {
                requestAnimationFrame(render);
            }
        };
        requestAnimationFrame(render);

        const addWaterButton = options.button_selector ? document.querySelector(options.button_selector) as HTMLElement : document.createElement('button');

        if(!options.button_selector) {
            addWaterButton.innerText = 'Add Water';
            element.prepend(addWaterButton);
        }

        addWaterButton.addEventListener('mousedown', () => {
            inp = 1;
            const mdTime = Date.now();
            const onMouseUp = () => {
                if(Date.now() - mdTime < 200) {
                    inp = 25;
                    setTimeout(() => {
                        inp = 0;
                    }, 100);
                } else {
                    inp = 0;
                }
                window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mouseup', onMouseUp);
        });
    }
} as Registration;

function easeInOutCubic(t: number) {
    return (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
}