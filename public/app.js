const urlInput = document.getElementById("videoUrl");
const clipCount = document.getElementById("clipCount");
const analyzeButton = document.getElementById("analyzeButton");

const resultsContainer = document.getElementById("results");
const status = document.getElementById("status");
const videoPlayer = document.getElementById("videoPlayer");

let currentVideoId = null;

// Comprobaciones defensivas para evitar errores si se carga una página
// que no contiene todos los elementos (p. ej. el index.html de la raíz).
if (!urlInput || !analyzeButton || !resultsContainer || !status) {
    console.error("Faltan elementos DOM necesarios:", { urlInput, clipCount, analyzeButton, resultsContainer, status, videoPlayer });
}

analyzeButton.addEventListener("click", analyze);

async function analyze() {

    const url = urlInput?.value.trim() ?? "";
    const amount = Number(clipCount?.value ?? 5);

    if (!url) {
        status.textContent = "Pega un enlace de YouTube.";
        return;
    }

    const videoId = getYoutubeVideoId(url);

    if (!videoId) {
        status.textContent = "El enlace de YouTube no es válido.";
        return;
    }

    // Mostrar video (si existe el contenedor)
    if (videoPlayer) showVideo(videoId);

    analyzeButton.disabled = true;
    resultsContainer.innerHTML = "";

    status.textContent = "Analizando video...";

    try {

        const response = await fetch("/api/analyze", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                url,
                amount
            })
        });

        // Detectar si la respuesta no es JSON (por ejemplo HTML de una 404/redirect)
        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Respuesta inesperada del servidor: ${contentType} - ${text.slice(0,200)}`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }

        renderClips(data.clips);

        status.textContent =
            `Se encontraron ${data.clips.length} clips.`;

    } catch (error) {

        status.textContent = error.message;

    } finally {

        analyzeButton.disabled = false;
    }
}

function showVideo(videoId) {

    currentVideoId = videoId;

    if (!videoPlayer) return;

    videoPlayer.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoId}"
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write;
                   encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;
}
function getYoutubeVideoId(url) {

    try {

        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {

            return parsedUrl.pathname.substring(1);
        }

        if (parsedUrl.hostname.includes("youtube.com")) {

            return parsedUrl.searchParams.get("v");
        }

        return null;

    } catch {

        return null;
    }
}

// Renderizador simple de clips para mostrar resultados en la UI.
function renderClips(clips) {
    if (!resultsContainer) return;

    if (!clips || clips.length === 0) {
        resultsContainer.innerHTML = '<p>No se encontraron clips.</p>';
        return;
    }

    resultsContainer.innerHTML = clips.map((c, i) => `
        <div class="clip" data-start="${c.start}" data-index="${i}">
            <img class="thumb" src="https://img.youtube.com/vi/${currentVideoId || '0'}/0.jpg" alt="thumb">
            <div class="meta">
                <div class="times">${c.start} — ${c.end}</div>
                <div class="score">Score: ${c.score}</div>
                <div class="reason">${c.reason}</div>
            </div>
        </div>
    `).join("");

    // Añadir manejadores de click para reproducir el clip en el reproductor
    const clipEls = resultsContainer.querySelectorAll('.clip');
    clipEls.forEach(el => {
        el.addEventListener('click', () => {
            const startStr = el.dataset.start;
            const seconds = parseTimeToSeconds(startStr);
            if (!currentVideoId) {
                console.warn('currentVideoId no definido; no se puede reproducir clip');
                return;
            }
            playClipAt(seconds);
        });
    });
}

function playClipAt(seconds) {
    if (!videoPlayer || !currentVideoId) return;

    // Construir URL de embed con start y autoplay
    const src = `https://www.youtube.com/embed/${currentVideoId}?start=${seconds}&autoplay=1`;

    videoPlayer.innerHTML = `
        <iframe
            src="${src}"
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write;
                   encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;
}

function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p, 10));
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return parseInt(timeStr, 10) || 0;
}