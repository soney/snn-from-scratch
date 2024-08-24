const fs = require('fs');

const jsonPattern = /\*\s*spec-start([\s\S]*?)spec-end\s*\*/g;

const specs = [];
module.exports = function (source) {
    const options = this.getOptions();
    const outFile = options.dest || 'ext/component-spec.json';

    let match;
    while ((match = jsonPattern.exec(source)) !== null) {
        const jsonContent = match[1];
        try {
            const spec = JSON.parse(jsonContent);
            specs.push(spec);
        } catch (e) {
            console.error(e);
        }
    }

    fs.writeFileSync(outFile, JSON.stringify(specs, null, 2));

    return source;
}