// 🔑 إعداد اتصال Supabase بمفاتيح مشروعك
const supabaseUrl = 'https://zfxpofffcwicetwdpdsj.supabase.co';
const supabaseAnonKey = 'sb_publishable_YXxA282IVH82P9XH5ugxlQ_s5nfRVb-';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// 📝 دالة إنشاء حساب جديد
async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('auth-message');

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        messageEl.textContent = 'خطأ في إنشاء الحساب: ' + error.message;
    } else {
        messageEl.textContent = 'تم إنشاء الحساب! يمكنك تسجيل الدخول الآن.';
    }
}

// 🎮 دالة تسجيل الدخول + إدخال اللاعب في الجدول
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('auth-message');

    // 1. تسجيل الدخول بالمصادقة
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        messageEl.textContent = 'خطأ في الدخول: ' + authError.message;
        return;
    }

    messageEl.textContent = 'تم الدخول بنجاح! جاري إعداد بيانات اللاعب...';

    // 2. إدخال أو تحديث بيانات اللاعب في جدول Player (بـP كبيرة)
    const { error: upsertError } = await supabase
        .from('Player')  // ⚠️ التصحيح: 'Player' بدل 'players'
        .upsert({
            user_id: authData.user.id,
            health: 100,
            position_x: Math.floor(Math.random() * 500),
            position_y: Math.floor(Math.random() * 500),
            last_updated: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (upsertError) {
        console.error('خطأ في تحديث بيانات اللاعب:', upsertError);
        messageEl.textContent = 'حدث خطأ في إعداد بيانات اللاعب: ' + upsertError.message;
    } else {
        messageEl.textContent = 'تم تهيئة اللاعب! جاري الانتقال...';
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 2000);
    }
}