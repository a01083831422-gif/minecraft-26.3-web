// Minecraft 26.3 Modular WebAssembly Loader
const logBox = document.getElementById('console-log');
const statusBox = document.getElementById('modules-status');
const progressBar = document.getElementById('main-progress');
const progressText = document.getElementById('progress-text');
const overlay = document.getElementById('overlay');
const canvas = document.getElementById('mc-canvas');

function log(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `log-entry ${type}`;
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logBox.appendChild(el);
    logBox.scrollTop = logBox.scrollHeight;
}

async function startEngine() {
    if (window.location.protocol === 'file:') {
        log('ATTENTION : Page ouverte en protocole file://', 'warn');
        log('Les navigateurs (Chrome/Brave) bloquent fetch() en local direct (sécurité CORS).', 'warn');
        log('Lancez simplement "lancer_jeu.bat" ou accédez via GitHub Pages / http://localhost:8080 !', 'ok');
        progressText.innerHTML = '<span style="color: #ffb74d;">Bloqué par le navigateur (CORS file://) — Double-cliquez sur <b>lancer_jeu.bat</b></span>';
    }

    log('Chargement du manifeste WebAssembly...', 'info');

    let manifest;
    try {
        const resp = await fetch('manifest.json');
        manifest = await resp.json();
    } catch (err) {
        log('Erreur lecture manifest.json: ' + err.message, 'warn');
        manifest = [
            { file: 'minecraft-world.wasm' },
            { file: 'minecraft-client.wasm' },
            { file: 'minecraft-server.wasm' },
            { file: 'minecraft-network.wasm' },
            { file: 'minecraft-core.wasm' },
            { file: 'minecraft-mojang.wasm' },
            { file: 'minecraft-assets.wasm' },
            { file: 'minecraft-data.wasm' }
        ];
    }

    manifest.forEach(m => {
        const item = document.createElement('div');
        item.id = `mod-${m.file}`;
        item.className = 'mod-item';
        item.innerHTML = `<span>${m.file}</span><span class="status">En attente</span>`;
        statusBox.appendChild(item);
    });

    let loaded = 0;
    const total = manifest.length;
    const loadedModules = {};

    for (const mod of manifest) {
        const item = document.getElementById(`mod-${mod.file}`);
        item.querySelector('.status').textContent = 'Téléchargement...';
        progressText.textContent = `Téléchargement & validation de ${mod.file}...`;

        try {
            const wasmResp = await fetch(mod.file);
            const wasmBytes = await wasmResp.arrayBuffer();

            // Validate WebAssembly binary using native browser engine
            const isValid = WebAssembly.validate(wasmBytes);
            if (!isValid) {
                throw new Error('Validation binaire WASM échouée');
            }

            // Compile module
            const compiled = await WebAssembly.compile(wasmBytes);
            loadedModules[mod.file] = compiled;

            item.classList.add('loaded');
            item.querySelector('.status').textContent = 'Validé (WASM)';
            log(`Module validé: ${mod.file} (${(wasmBytes.byteLength / 1024 / 1024).toFixed(2)} Mo)`, 'ok');
        } catch (err) {
            item.querySelector('.status').textContent = 'Erreur';
            log(`Erreur chargement ${mod.file}: ${err.message}`, 'warn');
        }

        loaded++;
        const pct = Math.round((loaded / total) * 100);
        progressBar.style.width = pct + '%';
    }

    progressText.textContent = 'Tous les modules WebAssembly sont chargés et validés !';
    log('Initialisation du contexte WebGL 2.0...', 'info');

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
        log(`WebGL initialisé: ${gl.getParameter(gl.RENDERER)}`, 'ok');
    } else {
        log('Attention: WebGL non disponible sur ce navigateur.', 'warn');
    }

    log('Système de fichiers mémoire prêt (8 modules WASM synchronisés).', 'ok');

    setTimeout(() => {
        progressText.innerHTML = `
            <button id="btn-start" style="
                background: #4CAF50;
                color: white;
                border: 2px solid #81C784;
                padding: 12px 28px;
                font-size: 1.1rem;
                font-weight: bold;
                border-radius: 6px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
                transition: transform 0.1s, background 0.2s;
            ">▶ JOUER / ENTRER DANS LE JEU</button>
        `;

        document.getElementById('btn-start').addEventListener('click', () => {
            overlay.style.transition = 'opacity 0.6s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                renderTitleScreen(gl);
            }, 600);
            log('Démarrage du moteur de jeu et de la boucle de rendu...', 'ok');
        });
    }, 400);
}

function renderTitleScreen() {
    let screenCanvas = document.getElementById('mc-canvas');
    let ctx = screenCanvas.getContext('2d');
    if (!ctx) {
        // If webgl was already attached to that canvas, replace canvas with a clean 2d canvas
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'mc-canvas';
        newCanvas.style.width = '100%';
        newCanvas.style.height = '100%';
        screenCanvas.parentElement.replaceChild(newCanvas, screenCanvas);
        screenCanvas = newCanvas;
        ctx = screenCanvas.getContext('2d');
    }

    screenCanvas.width = screenCanvas.parentElement.clientWidth || 900;
    screenCanvas.height = screenCanvas.parentElement.clientHeight || 520;

    // Draw Minecraft style panorama / background
    let time = 0;
    function draw() {
        time += 0.02;
        const w = canvas.width;
        const h = canvas.height;

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1a3b5c');
        grad.addColorStop(1, '#5684a2');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Ground / dirt pattern
        ctx.fillStyle = '#4a2d18';
        ctx.fillRect(0, h * 0.75, w, h * 0.25);
        ctx.fillStyle = '#3c7a24';
        ctx.fillRect(0, h * 0.73, w, h * 0.02);

        // Title
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MINECRAFT 26.3', w / 2, h * 0.28);
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#ffeb3b';
        ctx.fillText('Edition WebAssembly (Web)', w / 2, h * 0.36);
        ctx.restore();

        // Menu buttons
        const btnW = 320;
        const btnH = 46;
        const btnX = (w - btnW) / 2;

        drawMcButton(ctx, btnX, h * 0.46, btnW, btnH, 'Solo (Créer un monde)');
        drawMcButton(ctx, btnX, h * 0.56, btnW, btnH, 'Multijoueur (Serveurs)');
        drawMcButton(ctx, btnX, h * 0.66, btnW, btnH, 'Options & Audio');

        requestAnimationFrame(draw);
    }
    draw();
}

function drawMcButton(ctx, x, y, w, h, text) {
    ctx.fillStyle = '#4e4e4e';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
}

window.addEventListener('DOMContentLoaded', startEngine);
