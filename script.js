const audio = document.getElementById('bg-audio');
const toggleBtn = document.getElementById('music-toggle');
const statusSpan = document.getElementById('music-status');
const canvas = document.getElementById('audio-canvas');
const ctx = canvas.getContext('2d');

if (audio) {
    audio.volume = 0.25;
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.4;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let audioCtx, analyser, source, dataArray, bufferLength;
let isInitialized = false;

function initAudioVisualizer() {
    if (isInitialized || !audio) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 64;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        isInitialized = true;
        visualize();
    } catch (e) {
        console.log("Audio error: ", e);
    }
}

function visualize() {
    requestAnimationFrame(visualize);
    if (!canvas || document.hidden || audio.paused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);

    let barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let barHeight = (dataArray[i] / 255) * canvas.height;
        let red = 99 + Math.floor((i / bufferLength) * 50);
        let green = 102 + Math.floor(Math.sin(i * 0.2) * 60);
        let blue = 241 - Math.floor((i / bufferLength) * 80);

        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.65)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 4, barHeight);
        x += barWidth + 2;
    }
}

if (localStorage.getItem('musicPlaying') === 'true' && audio) {
    initAudioVisualizer();
    audio.play().then(() => {
        if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if(statusSpan) statusSpan.textContent = 'Reproduciendo';
    }).catch(() => { if(statusSpan) statusSpan.textContent = 'Pulsar para reproducir'; });
}

function startAudioOnFirstInteraction() {
    initAudioVisualizer();
    if (audio && audio.paused) {
        audio.play().then(() => {
            if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            if(statusSpan) statusSpan.textContent = 'Reproduciendo';
            localStorage.setItem('musicPlaying', 'true');
        }).catch(e => {});
    }
    window.removeEventListener('click', startAudioOnFirstInteraction);
}

if (localStorage.getItem('musicPlaying') !== 'true') {
    window.addEventListener('click', startAudioOnFirstInteraction);
}

if (toggleBtn && audio) {
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        initAudioVisualizer();
        if (audio.paused) {
            audio.play();
            if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            if(statusSpan) statusSpan.textContent = 'Reproduciendo';
            localStorage.setItem('musicPlaying', 'true');
        } else {
            audio.pause();
            if(statusSpan) statusSpan.textContent = 'Pausada';
            localStorage.setItem('musicPlaying', 'false');
        }
    });
}

// Lógica corregida y optimizada para los carruseles de las tarjetas
document.addEventListener("DOMContentLoaded", () => {
    const carousels = document.querySelectorAll(".carousel");

    carousels.forEach(carousel => {
        const folder = carousel.getAttribute("data-folder");
        const total = parseInt(carousel.getAttribute("data-total"), 10);

        // Si hay más de 1 imagen, creamos las etiquetas restantes de forma dinámica
        if (total > 1) {
            for (let i = 2; i <= total; i++) {
                const img = document.createElement("img");
                img.src = `${folder}/${i}.jpg`;
                img.className = "carousel-img";
                img.alt = "Preview";
                carousel.appendChild(img);
            }

            const images = carousel.querySelectorAll(".carousel-img");
            let currentIndex = 0;

            // Rotación automática cada 3 segundos aprovechando las clases CSS (.active)
            setInterval(() => {
                images[currentIndex].classList.remove("active");
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add("active");
            }, 3000);
        }
    });
});