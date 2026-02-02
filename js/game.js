// إعداد Supabase (نفس المفاتيح)
const supabaseUrl = 'https://zfxpofffcwicetwdpdsj.supabase.co';
const supabaseAnonKey = 'sb_publishable_YXxA282IVH82P9XH5ugxlQ_s5nfRVb-';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// متغيرات اللعبة
let myPlayer = null;
let players = {};
let canvas, ctx;
let moveX = 0, moveY = 0;

// تهيئة اللعبة
async function initGame() {
    // 1. التحقق من المصادقة
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // 2. إعداد Canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 3. جلب بيانات اللاعب
    await loadMyPlayer(user.id);
    
    // 4. جلب اللاعبين الآخرين
    await loadOtherPlayers();
    
    // 5. الاشتراك في التحديثات الفورية
    subscribeToPlayers();
    
    // 6. إعداد التحكم
    setupControls();
    
    // 7. بدء حلقة اللعبة
    gameLoop();
}

async function loadMyPlayer(userId) {
    const { data, error } = await supabase
        .from('Player')
        .select('*')
        .eq('User_id', userId)
        .single();
    
    if (data) {
        myPlayer = {
            id: data.User_id,
            x: data.Position_x || 300,
            y: data.Position_y || 300,
            size: 40,
            speed: 5,
            hp: data.Health || 100,
            name: data.name || 'لاعب',
            color: data.color || '#FF6B6B'
        };
        
        updateHUD();
    }
}

async function loadOtherPlayers() {
    const { data, error } = await supabase
        .from('Player')
        .select('*')
        .neq('User_id', myPlayer?.id);
    
    if (data) {
        players = {};
        data.forEach(p => {
            players[p.User_id] = {
                id: p.User_id,
                x: p.Position_x || 0,
                y: p.Position_y || 0,
                size: 40,
                hp: p.Health || 100,
                name: p.name || 'لاعب',
                color: p.color || '#4ECDC4'
            };
        });
        updatePlayersCount();
    }
}

// باقي الكود الخاص بالحركة والرسم والتحكم...