const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const cheerio = require('cheerio');
const http = require('http');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const { time } = require('console');

const PORT = 3000;

const BASE_PATH = path.join(__dirname, '_build', 'html');
const WATCH_PATH = BASE_PATH;

const app = express();
const server = http.createServer(app);

const url = `http://localhost:${PORT}/`;
let startMessage = `Server is running on ${url}`;

if(hasArgument('--auto-reload')) {
    const injectionCode = /*javascript*/`
        const ws = new WebSocket('ws://'+window.location.host);
        ws.addEventListener('message', (message) => {
            if(message.data === 'reload') {
                window.location.reload();
            }
        });
    `;

    app.get('/*', async function(req, res, next) {
        const file = req.params[0] || 'index.html';
        if(path.extname(file) !== '.html') {
            return next();
        }

        const filename = path.join(BASE_PATH, file);
        try {
            const stat = await fs.stat(filename);
            if (!stat.isFile()) {
                return next();
            }
            const htmlContent = await fs.readFile(filename, 'utf8');
            const $ = cheerio.load(htmlContent);
            const scriptNode = `<script>${injectionCode}</script>`;
            $('body').append(scriptNode);
            res.send($.html());
        } catch (err) {
            return next();
        }
    });

    const wss = new WebSocket.Server({ server });

    chokidar.watch(WATCH_PATH).on('change', debounce(() => {
        console.info(`...sending reload message to all clients`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('reload');
            }
        });
    }, 1000, (changedFilePath, stats) => {
        const relPath = path.relative(WATCH_PATH, changedFilePath)
        console.info(`File ${relPath} changed...debouncing`);
    }));
    startMessage += `\nWatching for changes in ${WATCH_PATH}`;
}



app.use(express.static(path.join(__dirname, '_build', 'html')));


server.listen(PORT, async () => {
    console.info(startMessage);
    const open = (await import('open')).default;
    await open(url);
});

function debounce(func, wait, firstCallFunc) {
    let timeout = null;
    return function (...args) {
        if(timeout === null && firstCallFunc) {
            firstCallFunc.apply(this, args);
        }
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args)
            timeout = null;
        }, wait);
    };
}

function hasArgument(arg) {
    const args = process.argv.slice(2);
    return args.includes(arg);
}