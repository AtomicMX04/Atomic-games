const audio = document.getElementById('bg-audio');
const toggleBtn = document.getElementById('music-toggle');
const statusSpan = document.getElementById('music-status');
const canvas = document.getElementById('audio-canvas');
const ctx = canvas.getContext('2d');

audio.volume = 0.25;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.4;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let audioCtx, analyser, source, dataArray, bufferLength;
let isInitialized = false;

function initAudioVisualizer() {
    if (isInitialized) return;
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
    if (document.hidden || audio.paused) return;

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

if (localStorage.getItem('musicPlaying') === 'true') {
    initAudioVisualizer();
    audio.play().then(() => {
        if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        statusSpan.textContent = 'Reproduciendo';
    }).catch(() => { statusSpan.textContent = 'Pulsar para reproducir'; });
}

function startAudioOnFirstInteraction() {
    initAudioVisualizer();
    if (audio.paused) {
        audio.play().then(() => {
            if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            statusSpan.textContent = 'Reproduciendo';
            localStorage.setItem('musicPlaying', 'true');
        }).catch(e => {});
    }
    window.removeEventListener('click', startAudioOnFirstInteraction);
}

if (localStorage.getItem('musicPlaying') !== 'true') {
    window.addEventListener('click', startAudioOnFirstInteraction);
}

toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudioVisualizer();
    if (audio.paused) {
        audio.play();
        if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        statusSpan.textContent = 'Reproduciendo';
        localStorage.setItem('musicPlaying', 'true');
    } else {
        audio.pause();
        statusSpan.textContent = 'Pausada';
        localStorage.setItem('musicPlaying', 'false');
    }
});