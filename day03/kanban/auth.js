// Supabase Authentication Module

// Initialize Supabase client using IIFE to avoid redeclaration
var supabase = (function() {
    try {
        if (typeof SUPABASE_CONFIG === 'undefined') {
            throw new Error('config.js not loaded. Please create config.js from config.example.js');
        }

        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase library not loaded. Check CDN connection.');
        }

        const client = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );

        console.log('✅ Supabase initialized successfully');
        return client;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        alert('Supabase 초기화 실패: ' + error.message);
        return null;
    }
})();

/**
 * 회원가입
 * @param {string} email - 사용자 이메일
 * @param {string} password - 사용자 비밀번호
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function signup(email, password) {
    if (!supabase) {
        return {
            success: false,
            error: 'Supabase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.'
        };
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            return {
                success: false,
                error: getErrorMessage(error)
            };
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            error: '회원가입 중 오류가 발생했습니다.'
        };
    }
}

/**
 * 로그인
 * @param {string} email - 사용자 이메일
 * @param {string} password - 사용자 비밀번호
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
async function login(email, password) {
    if (!supabase) {
        return {
            success: false,
            error: 'Supabase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.'
        };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            return {
                success: false,
                error: getErrorMessage(error)
            };
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: '로그인 중 오류가 발생했습니다.'
        };
    }
}

/**
 * GitHub OAuth 로그인
 * @returns {Promise<void>}
 */
async function loginWithGithub() {
    if (!supabase) {
        alert('Supabase가 초기화되지 않았습니다. 페이지를 새로고침해주세요.');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) {
            console.error('GitHub login error:', error);
            alert('GitHub 로그인 중 오류가 발생했습니다: ' + getErrorMessage(error));
        }
    } catch (error) {
        console.error('GitHub login error:', error);
        alert('GitHub 로그인 중 오류가 발생했습니다.');
    }
}

/**
 * 로그아웃
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function logout() {
    if (!supabase) {
        return {
            success: false,
            error: 'Supabase가 초기화되지 않았습니다.'
        };
    }

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: getErrorMessage(error)
            };
        }

        return {
            success: true
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            success: false,
            error: '로그아웃 중 오류가 발생했습니다.'
        };
    }
}

/**
 * 현재 세션 확인
 * @returns {Promise<{session: any, user: any} | null>}
 */
async function getSession() {
    if (!supabase) {
        console.error('Supabase not initialized');
        return null;
    }

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Get session error:', error);
            return null;
        }

        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
}

/**
 * 현재 사용자 정보 가져오기
 * @returns {Promise<any | null>}
 */
async function getCurrentUser() {
    if (!supabase) {
        console.error('Supabase not initialized');
        return null;
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Get user error:', error);
            return null;
        }

        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

/**
 * 인증 상태 확인
 * @returns {Promise<boolean>}
 */
async function checkAuth() {
    const session = await getSession();
    return session !== null;
}

/**
 * 인증 상태 변경 리스너 등록
 * @param {Function} callback - 콜백 함수 (event, session) => void
 */
function onAuthStateChange(callback) {
    if (!supabase) {
        console.error('Supabase not initialized');
        return;
    }

    supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

/**
 * Supabase 에러를 한글 메시지로 변환
 * @param {Object} error - Supabase 에러 객체
 * @returns {string} 한글 에러 메시지
 */
function getErrorMessage(error) {
    const errorMessages = {
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'User already registered': '이미 가입된 이메일입니다.',
        'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
        'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
        'Invalid email': '유효하지 않은 이메일 형식입니다.',
        'Signup requires a valid password': '유효한 비밀번호를 입력해주세요.',
        'Database error saving new user': '사용자 정보 저장 중 오류가 발생했습니다.',
        'Email rate limit exceeded': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    };

    const message = error.message || error.error_description || '';

    for (const [key, value] of Object.entries(errorMessages)) {
        if (message.includes(key)) {
            return value;
        }
    }

    return error.message || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 사용자 정보 표시 형식 (이메일 또는 GitHub 사용자명)
 * @param {Object} user - 사용자 객체
 * @returns {string} 표시용 사용자 이름
 */
function getUserDisplayName(user) {
    if (!user) return '';

    // GitHub OAuth의 경우 user_metadata에 정보 있음
    if (user.user_metadata && user.user_metadata.user_name) {
        return user.user_metadata.user_name;
    }

    // 이메일의 경우 @ 앞부분만 표시
    if (user.email) {
        return user.email.split('@')[0];
    }

    return 'User';
}

/**
 * 사용자 프로필 이미지 URL
 * @param {Object} user - 사용자 객체
 * @returns {string | null} 프로필 이미지 URL
 */
function getUserAvatarUrl(user) {
    if (!user) return null;

    // GitHub OAuth의 경우
    if (user.user_metadata && user.user_metadata.avatar_url) {
        return user.user_metadata.avatar_url;
    }

    return null;
}
