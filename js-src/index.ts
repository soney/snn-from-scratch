import staticBucket from "./components/buckets/static-bucket";
import leakyBucket from "./components/buckets/leaky-bucket";
import test from "./components/test";
import htmlElement from "./components/element";
import editor from "./components/editor";
import spikesByFrequency from "./components/spikes/spikes-by-frequency";
import scaledSpikesByFrequency from "./components/spikes/scaled-spikes-by-frequency";
import poissonSpikes from './components/spikes/poisson-spikes';
import imageSpikes from './components/spikes/image-spikes';

export type RegisterArgs = { args: string[], options: {[k: string]: string}, content: string, id: string};
export type RegisterFunction = (element: HTMLElement, data: RegisterArgs) => void|Promise<void>;
export type Registration = { name: string, register: RegisterFunction };

const loadPromise = new Promise<void>((resolve) => {
    if(document.readyState === "complete") {
        resolve();
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            resolve();
        });
    }
});

async function register({name, register: factory}: Registration): Promise<void> {
    await loadPromise;
    const elements = document.querySelectorAll(`.custom---${name}`);

    for (const element of Array.from(elements)) {
        const args    = JSON.parse(element.getAttribute("data-arguments"));
        const options = JSON.parse(element.getAttribute("data-options"));
        const content = JSON.parse(element.getAttribute("data-content"));
        const id      = element.getAttribute("id");

        factory(element as HTMLElement, {args, options, content, id});
    }
}

register(staticBucket);
register(leakyBucket);
register(test);
register(htmlElement);
register(editor);
register(spikesByFrequency);
register(scaledSpikesByFrequency);
register(poissonSpikes);
register(imageSpikes);