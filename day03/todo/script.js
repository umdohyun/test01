const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const prioritySelect = document.getElementById('prioritySelect');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Supabase 클라이언트 초기화
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let todos = [];
let currentUser = null;

// 페이지 로드 시 인증 체크
async function checkAuth() {
    const { session } = await getCurrentSession();

    if (!session) {
        // 로그인되지 않았으면 로그인 페이지로 리다이렉트
        window.location.href = 'login.html';
        return false;
    }

    // 현재 사용자 정보 가져오기
    const { user } = await getCurrentUser();
    currentUser = user;

    // 사용자 이메일 표시
    if (userEmail && user) {
        userEmail.textContent = user.email;
    }

    return true;
}

// 로그아웃 버튼 이벤트
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            const result = await signOut();
            if (result.success) {
                window.location.href = 'login.html';
            } else {
                alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
            }
        }
    });
}

// Supabase에서 할 일 목록 불러오기
async function loadTodos() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabaseClient
            .from('todos')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        todos = data || [];
        renderTodos();
    } catch (error) {
        console.error('할 일 목록을 불러오는데 실패했습니다:', error);
        alert('할 일 목록을 불러오는데 실패했습니다. 새로고침 해주세요.');
    }
}

// 화면에 할 일 목록 렌더링
function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-message">할 일이 없습니다. 새로운 할 일을 추가해보세요!</li>';
        return;
    }

    // 우선순위별 정렬
    const sortedTodos = [...todos].sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sortedTodos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;

        const priorityText = { high: '높음', medium: '중간', low: '낮음' };

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo('${todo.id}')">
            <span class="priority-badge priority-${todo.priority}">${priorityText[todo.priority]}</span>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">
                <span class="material-icons" style="font-size: 16px;">delete</span>
                삭제
            </button>
        `;

        todoList.appendChild(li);
    });
}

// 할 일 추가
async function addTodo() {
    if (!currentUser) return;

    const text = todoInput.value.trim();
    const priority = prioritySelect.value;

    if (text === '') {
        alert('할 일을 입력해주세요!');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('todos')
            .insert([
                {
                    text: text,
                    priority: priority,
                    completed: false,
                    user_id: currentUser.id
                }
            ])
            .select();

        if (error) throw error;

        // 입력창 초기화
        todoInput.value = '';
        prioritySelect.value = 'medium';

        // 목록 새로고침
        await loadTodos();
    } catch (error) {
        console.error('할 일 추가 실패:', error);
        alert('할 일 추가에 실패했습니다. 다시 시도해주세요.');
    }
}

// 할 일 완료 토글
async function toggleTodo(id) {
    try {
        // 현재 할 일 찾기
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        // 완료 상태 반전
        const { error } = await supabaseClient
            .from('todos')
            .update({ completed: !todo.completed })
            .eq('id', id)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        // 목록 새로고침
        await loadTodos();
    } catch (error) {
        console.error('할 일 수정 실패:', error);
        alert('할 일 수정에 실패했습니다. 다시 시도해주세요.');
    }
}

// 할 일 삭제
async function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('todos')
            .delete()
            .eq('id', id)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        // 목록 새로고침
        await loadTodos();
    } catch (error) {
        console.error('할 일 삭제 실패:', error);
        alert('할 일 삭제에 실패했습니다. 다시 시도해주세요.');
    }
}

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 초기화: 인증 체크 후 할 일 로드
(async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        await loadTodos();
    }
})();
