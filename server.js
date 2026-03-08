// =============================================
//  Backend Server - Video + Wish Storage (Cloud Mode)
//  Saves reaction videos to Cloudinary & wishes to MongoDB
// =============================================

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ========== DATABASE CONFIG (MongoDB) ==========
const isDBConfigured = !!process.env.MONGODB_URI;
if (isDBConfigured) {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, unifiedTopology: true })
        .then(() => console.log('🗄️  MongoDB Connected!'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
    console.warn('⚠️  WARNING: MONGODB_URI not set in .env. Database features will fail.');
}

const videoSchema = new mongoose.Schema({
    filename: String,
    url: String,
    size: Number,
    type: String, // 'reaction' or 'reply'
    date: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', videoSchema);

const wishSchema = new mongoose.Schema({
    wish: String,
    date: { type: Date, default: Date.now }
});
const Wish = mongoose.model('Wish', wishSchema);

// ========== STORAGE CONFIG (Cloudinary) ==========
const isCloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    console.warn('⚠️  WARNING: Cloudinary credentials not set in .env. Video uploads will fail.');
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'shikhu-birthday',
        resource_type: 'video',
        allowed_formats: ['mp4', 'webm', 'mov']
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 500 * 1024 * 1024 } });

// ========== VIDEO UPLOAD ==========

app.post('/api/upload-chunk', upload.single('chunk'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    console.log(`📹 Cloud Chunk Saved: ${req.file.path}`);
    res.json({ success: true, url: req.file.path });
});

app.post('/api/upload-video', upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const type = req.body.type || 'reaction';

    console.log(`\n🎬 ========================================`);
    console.log(`🎬 VIDEO UPLOADED TO CLOUDINARY! (${type})`);
    console.log(`🎬 URL: ${req.file.path}`);
    console.log(`🎬 ========================================\n`);

    if (isDBConfigured) {
        try {
            const newVideo = new Video({
                filename: req.file.filename,
                url: req.file.path,
                size: req.file.size || 0,
                type: type
            });
            await newVideo.save();
        } catch (err) {
            console.error('❌ Failed to save video to MongoDB:', err);
        }
    }

    res.json({ success: true, url: req.file.path });
});

// ========== WISH STORAGE ==========

app.post('/api/wish', async (req, res) => {
    const { wish } = req.body;
    if (!wish) return res.status(400).json({ error: 'No wish provided' });

    console.log(`\n⭐ ========================================`);
    console.log(`⭐ WISH RECEIVED FROM SHIKHU!`);
    console.log(`⭐ "${wish}"`);
    console.log(`⭐ ========================================\n`);

    if (isDBConfigured) {
        try {
            const newWish = new Wish({ wish });
            await newWish.save();
            return res.json({ success: true, message: 'Wish saved to MongoDB!' });
        } catch (err) {
            console.error('❌ Failed to save wish to MongoDB:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
    } else {
        return res.json({ success: true, message: 'Wish discarded (No DB configured)' });
    }
});

app.get('/api/wishes', async (req, res) => {
    if (!isDBConfigured) return res.json({ wishes: [], count: 0, error: 'DB not configured' });
    try {
        const wishes = await Wish.find().sort({ date: -1 });
        const mappedWishes = wishes.map(w => ({
            wish: w.wish,
            date: w.date.toLocaleString()
        }));
        res.json({ wishes: mappedWishes, count: mappedWishes.length });
    } catch (err) {
        res.status(500).json({ error: 'Database Error' });
    }
});

// ========== RECORDINGS LIST ==========

app.get('/api/recordings', async (req, res) => {
    if (!isDBConfigured) return res.json({ recordings: [], count: 0, error: 'DB not configured' });
    try {
        const videos = await Video.find().sort({ date: -1 });
        const mappedVideos = videos.map(v => ({
            name: v.filename || 'Cloudinary Video',
            url: v.url,
            sizeMB: (v.size / 1024 / 1024).toFixed(2) + ' MB',
            date: v.date
        }));
        res.json({ recordings: mappedVideos, count: mappedVideos.length });
    } catch (err) {
        res.status(500).json({ error: 'Database Error' });
    }
});

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
        .cloud-badge{display:inline-block;background:rgba(30,144,255,0.2);color:#00d4ff;padding:4px 10px;border-radius:20px;font-size:0.8rem;margin:0 auto 2rem;border:1px solid rgba(0,212,255,0.3);text-align:center}
        .text-center{text-align:center}
        .tabs{display:flex;justify-content:center;gap:1rem;margin:1.5rem 0}
        .tab{padding:10px 25px;border-radius:30px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);cursor:pointer;font-size:.9rem;transition:all .3s}
        .tab.active{background:linear-gradient(135deg,#1e90ff,#00d4ff);color:white;border-color:transparent}
        .panel{display:none}.panel.active{display:block}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem}
        .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1.5rem}
        .card video{width:100%;border-radius:10px;margin-bottom:1rem;background:#000}
        .card h3{font-size:.85rem;color:#00d4ff;margin-bottom:.5rem;word-break:break-all}
        .card p{font-size:.8rem;color:rgba(255,255,255,.5)}
        .card a{display:inline-block;margin-top:.8rem;padding:8px 20px;background:linear-gradient(135deg,#1e90ff,#00d4ff);color:white;border-radius:30px;text-decoration:none;font-size:.8rem}
        .empty{text-align:center;color:rgba(255,255,255,.3);font-size:1.1rem;margin-top:3rem}
        .refresh{display:block;margin:0 auto 1.5rem;padding:8px 25px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);border-radius:30px;cursor:pointer;font-size:.85rem}
        .wish-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:1.5rem;margin-bottom:1rem}
        .wish-card .wish-text{font-size:1.1rem;color:#00d4ff;font-style:italic}
        .wish-card .wish-date{font-size:.75rem;color:rgba(255,255,255,.4);margin-top:.5rem}
        .error-msg{background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.3);color:#ff4444;padding:1rem;border-radius:10px;text-align:center;margin-bottom:1.5rem}
    </style>
</head>
<body>
    <h1>💙 Shikhu's Dashboard</h1>
    <div class="text-center"><div class="cloud-badge">☁️ Cloud Storage Active</div></div>
    
    <div class="tabs">
        <div class="tab active" data-tab="videos">📹 Reaction Videos</div>
        <div class="tab" data-tab="wishes">⭐ Her Wishes</div>
    </div>
    <button class="refresh" onclick="loadAll()">🔄 Refresh</button>
    <div id="error-container"></div>
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
            if(d.error) { document.getElementById('error-container').innerHTML = '<div class="error-msg">⚠️ Database is not configured. Add MONGODB_URI to .env</div>'; return; }
            if(d.count===0){g.innerHTML='<p class="empty">No recordings yet... 💙</p>';return}
            g.innerHTML=d.recordings.map(r=>'<div class="card"><video src="'+r.url+'" controls playsinline preload="metadata"></video><h3>'+r.name+'</h3><p>Cloud URL | '+new Date(r.date).toLocaleString()+'</p><a href="'+r.url+'" target="_blank" download>🔗 Open File</a></div>').join('');
        }
        async function loadWishes(){
            const r=await fetch('/api/wishes');const d=await r.json();const w=document.getElementById('wishList');
            if(d.error) return; 
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
    console.log(`☁️  Storage:    Cloudinary`);
    console.log(`🗄️  Database:   MongoDB`);
    console.log(`💙 ========================================\n`);
});
