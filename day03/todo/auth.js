// 인증 관련 함수들

// 회원가입
async function signUp(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/confirm.html`
            }
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('회원가입 실패:', error);
        return { success: false, error: error.message };
    }
}

// 로그인
async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('로그인 실패:', error);
        return { success: false, error: error.message };
    }
}

// 로그아웃
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('로그아웃 실패:', error);
        return { success: false, error: error.message };
    }
}

// 현재 세션 가져오기
async function getCurrentSession() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        return { success: true, session };
    } catch (error) {
        console.error('세션 조회 실패:', error);
        return { success: false, error: error.message };
    }
}

// 현재 사용자 가져오기
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (error) throw error;

        return { success: true, user };
    } catch (error) {
        console.error('사용자 조회 실패:', error);
        return { success: false, error: error.message };
    }
}

// 인증 상태 변경 감지
function onAuthStateChange(callback) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// Google 로그인
async function signInWithGoogle() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/callback.html`
            }
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Google 로그인 실패:', error);
        return { success: false, error: error.message };
    }
}

// GitHub 로그인
async function signInWithGithub() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/callback.html`
            }
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('GitHub 로그인 실패:', error);
        return { success: false, error: error.message };
    }
}
