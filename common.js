const STUDENT_LIST_KEY = 'ssafy17_student_list';

// 초기 기본 명단 (저장된 내용이 없을 때 보여줄 예시 명단)
const DEFAULT_STUDENT_LIST = `곽도연
곽예경
김건우
김민준
김민지
김윤석
김해찬
도영훈
박윤진
박하민
서현식
손상범
손영주
신다현
신동운
유선경
이건모
이규원
이도연
이은솔
이온유
이정원
임대연
임효선
천창현`;

// localStorage에서 학생 명단을 불러와 textarea에 채우는 함수
function loadStudentList() {
    const studentListTextArea = document.getElementById('student-list');
    if (!studentListTextArea) return;

    const savedStudents = localStorage.getItem(STUDENT_LIST_KEY);
    // 저장된 명단이 있으면 불러오고, 없거나 비어있으면 기본 명단을 사용
    if (savedStudents && savedStudents.trim() !== '') {
        studentListTextArea.value = savedStudents;
    } else {
        studentListTextArea.value = DEFAULT_STUDENT_LIST;
    }
}

// textarea의 학생 명단을 localStorage에 저장하는 함수
function saveStudentList() {
    const studentListTextArea = document.getElementById('student-list');
    localStorage.setItem(STUDENT_LIST_KEY, studentListTextArea.value);
    alert('명단이 저장되었습니다.');
}

// 학생 명단을 배열로 가져오는 함수
function getStudents() {
    const studentListTextArea = document.getElementById('student-list');
    const students = studentListTextArea.value.split('\n').map(s => s.trim()).filter(s => s);
    if (students.length === 0) {
        alert('학생 명단을 입력하세요.');
        return [];
    }
    return students;
}

// 배열을 무작위로 섞는 함수 (Fisher-Yates shuffle)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // 일반 Math.random() 대신 암호학적으로 강력한 난수 생성기 사용 (지원 시)
        let j;
        if (window.crypto && window.crypto.getRandomValues) {
            const array32 = new Uint32Array(1);
            window.crypto.getRandomValues(array32);
            // 0 ~ 1 사이의 정밀한 난수값 생성
            const random = array32[0] / (0xffffffff + 1);
            j = Math.floor(random * (i + 1));
        } else {
            // 폴백 (구형 브라우저 등)
            j = Math.floor(Math.random() * (i + 1));
        }
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function applyTheme(theme) {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if(themeToggleButton) themeToggleButton.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        if(themeToggleButton) themeToggleButton.textContent = '🌙';
    }
}

function setupThemeToggle() {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (!themeToggleButton) return;

    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('ssafy_theme', newTheme);
        applyTheme(newTheme);
    });
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('ssafy_theme');
    // 사용자가 테마를 직접 설정한 기록이 없으면 'light' 테마를 기본으로 사용합니다.
    const defaultTheme = savedTheme || 'light';
    applyTheme(defaultTheme);
}

// 공통 이벤트 리스너 (명단 저장 버튼, 페이지 로드 시 명단 불러오기)
document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save-students');
    if (saveButton) {
        saveButton.addEventListener('click', saveStudentList);
    }
    loadStudentList();
    initializeTheme();
    setupThemeToggle();
});
