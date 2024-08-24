import { SVG } from '@svgdotjs/svg.js';

export default function plotSpikes(parentElement: HTMLElement, spikes: IterableIterator<number>, T: number, width: number, height: number, padding: number): number[] {
    const allSpikes: number[] = [];
    const draw = SVG().addTo(parentElement).size(width, height);

    const spikeWidth = 2;
    const spikeHeight = height - 2*padding;
    const y = padding;
    for(const t of spikes) {
        const x = padding + width * t / T;
        draw.rect(spikeWidth, spikeHeight).attr("fill", "black").move(x, y);
        allSpikes.push(t);
    }
    return allSpikes;
    // spikes.forEach((t) => {
    //     const x = padding + width * t / T;
    //     draw.rect(spikeWidth, spikeHeight).attr("fill", "black").move(x, y);
    // });
}