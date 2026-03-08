// =============================================
//  Backend Server - Video + Wish Storage
//  Saves reaction videos (with audio) & wishes
// =============================================

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create folders
const recordingsDir = path.join(__dirname, 'recordings');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Wishes file
const wishesFile = path.join(dataDir, 'wishes.json');
if (!fs.existsSync(wishesFile)) fs.writeFileSync(wishesFile, '[]');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, recordingsDir),
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const type = req.body.type || 'reaction';
        const ext = file.mimetype.includes('mp4') ? '.mp4' : '.webm';
        cb(null, `shikhu-${type}-${timestamp}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// ========== VIDEO UPLOAD ==========

// ========== VIDEO UPLOAD ==========

app.post('/api/upload-chunk', upload.single('chunk'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    console.log(`📹 Chunk: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
    res.json({ success: true, filename: req.file.filename });
});

app.post('/api/upload-video', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const sizeMB = (req.file.size / 1024 / 1024).toFixed(2);
    const type = req.body.type || 'reaction';
    console.log(`\n🎬 ========================================`);
    console.log(`🎬 VIDEO RECEIVED! (${type})`);
    console.log(`🎬 File: ${req.file.filename}`);
    console.log(`🎬 Size: ${sizeMB} MB`);
    console.log(`🎬 ========================================\n`);
    res.json({ success: true, filename: req.file.filename, size: req.file.size });
});

// ========== WISH STORAGE ==========

// ========== WISH STORAGE ==========

app.post('/api/wish', (req, res) => {
    const { wish } = req.body;
    if (!wish) return res.status(400).json({ error: 'No wish provided' });

    const wishes = JSON.parse(fs.readFileSync(wishesFile, 'utf8'));
    const entry = {
        wish: wish,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString()
    };
    wishes.push(entry);
    fs.writeFileSync(wishesFile, JSON.stringify(wishes, null, 2));

    console.log(`\n⭐ ========================================`);
    console.log(`⭐ WISH RECEIVED FROM SHIKHU!`);
    console.log(`⭐ "${wish}"`);
    console.log(`⭐ ========================================\n`);

    res.json({ success: true, message: 'Wish saved!' });
});

app.get('/api/wishes', (req, res) => {
    const wishes = JSON.parse(fs.readFileSync(wishesFile, 'utf8'));
    res.json({ wishes, count: wishes.length });
});

// ========== RECORDINGS LIST ==========

app.get('/api/recordings', (req, res) => {
    const files = fs.readdirSync(recordingsDir).map(file => {
        const stat = fs.statSync(path.join(recordingsDir, file));
        return {
            name: file,
            size: stat.size,
            sizeMB: (stat.size / 1024 / 1024).toFixed(2) + ' MB',
            date: stat.mtime,
            url: `/recordings/${file}`
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ recordings: files, count: files.length });
});

app.use('/recordings', express.static(recordingsDir));

// ========== DASHBOARD ==========

app.get('/dashboard', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Shikhu's Reactions</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',sans-serif;background:#0a0e1a;color:white;padding:1.5rem;min-height:100vh}
        h1{text-align:center;margin-bottom:.5rem;background:linear-gradient(135deg,#1e90ff,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:2rem}
        .tabs{display:flex;justify-content:center;gap:1rem;margin:1.5rem 0}
        .tab{padding:10px 25px;border-radius:30px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);cursor:pointer;font-size:.9rem;transition:all .3s}
        .tab.active{background:linear-gradient(135deg,#1e90ff,#00d4ff);color:white;border-color:transparent}
        .panel{display:none}.panel.active{display:block}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem}
        .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1.5rem}
        .card video{width:100%;border-radius:10px;margin-bottom:1rem}
        .card h3{font-size:.85rem;color:#00d4ff;margin-bottom:.5rem;word-break:break-all}
        .card p{font-size:.8rem;color:rgba(255,255,255,.5)}
        .card a{display:inline-block;margin-top:.8rem;padding:8px 20px;background:linear-gradient(135deg,#1e90ff,#00d4ff);color:white;border-radius:30px;text-decoration:none;font-size:.8rem}
        .empty{text-align:center;color:rgba(255,255,255,.3);font-size:1.1rem;margin-top:3rem}
        .refresh{display:block;margin:0 auto 1.5rem;padding:8px 25px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);border-radius:30px;cursor:pointer;font-size:.85rem}
        .wish-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1.5rem;margin-bottom:1rem}
        .wish-card .wish-text{font-size:1.1rem;color:#00d4ff;font-style:italic}
        .wish-card .wish-date{font-size:.75rem;color:rgba(255,255,255,.4);margin-top:.5rem}
    </style>
</head>
<body>
    <h1>💙 Shikhu's Dashboard</h1>
    <div class="tabs">
        <div class="tab active" data-tab="videos">📹 Reaction Videos</div>
        <div class="tab" data-tab="wishes">⭐ Her Wishes</div>
    </div>
    <button class="refresh" onclick="loadAll()">🔄 Refresh</button>
    <div class="panel active" id="videos-panel"><div class="grid" id="grid"></div></div>
    <div class="panel" id="wishes-panel"><div id="wishList"></div></div>
    <script>
        document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
            document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
            t.classList.add('active');
            document.getElementById(t.dataset.tab+'-panel').classList.add('active');
        }));
        async function loadAll(){await loadVideos();await loadWishes()}
        async function loadVideos(){
            const r=await fetch('/api/recordings');const d=await r.json();const g=document.getElementById('grid');
            if(d.count===0){g.innerHTML='<p class="empty">No recordings yet... 💙</p>';return}
            g.innerHTML=d.recordings.map(r=>'<div class="card"><video src="'+r.url+'" controls playsinline></video><h3>'+r.name+'</h3><p>'+r.sizeMB+' | '+new Date(r.date).toLocaleString()+'</p><a href="'+r.url+'" download>📥 Download</a></div>').join('');
        }
        async function loadWishes(){
            const r=await fetch('/api/wishes');const d=await r.json();const w=document.getElementById('wishList');
            if(d.count===0){w.innerHTML='<p class="empty">No wishes yet... ⭐</p>';return}
            w.innerHTML=d.wishes.map(w=>'<div class="wish-card"><p class="wish-text">"'+w.wish+'"</p><p class="wish-date">'+w.date+'</p></div>').join('');
        }
        loadAll();
    </script>
</body>
</html>`);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n💙 ========================================`);
    console.log(`💙  Shikhu's Birthday Server Running!`);
    console.log(`💙 ========================================`);
    console.log(`🌐 Website:    http://localhost:${PORT}`);
    console.log(`📹 Dashboard:  http://localhost:${PORT}/dashboard`);
    console.log(`📁 Recordings: ${recordingsDir}`);
    console.log(`⭐ Wishes:     ${wishesFile}`);
    console.log(`💙 ========================================\n`);
});
