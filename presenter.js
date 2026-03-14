document.addEventListener('DOMContentLoaded', () => {
    // 설정값
    const EXCLUDED_LIST_KEY = 'ssafy_presenter_excluded_list';
    const REVEAL_DELAY_MS = 2000; // 결과 발표까지의 딜레이 (밀리초)

    const pickButton = document.getElementById('pick-presenter');
    const displayDiv = document.getElementById('presenter-display');
    const countInput = document.getElementById('presenter-count');
    const excludedListTextArea = document.getElementById('excluded-student-list');
    const saveExcludedListButton = document.getElementById('save-excluded-list');

    // --- 제외 명단 관리 함수 ---
    function loadExcludedList() {
        const savedExcluded = localStorage.getItem(EXCLUDED_LIST_KEY);
        if (savedExcluded) {
            excludedListTextArea.value = savedExcluded;
        }
    }

    function saveExcludedList() {
        localStorage.setItem(EXCLUDED_LIST_KEY, excludedListTextArea.value);
        alert('제외 명단이 저장되었습니다.');
    }

    function getExcludedStudents() {
        return excludedListTextArea.value.split('\n').map(s => s.trim()).filter(s => s);
    }

    // 페이지 로드 시 제외 명단 불러오기 및 저장 버튼 이벤트 연결
    loadExcludedList();
    saveExcludedListButton.addEventListener('click', saveExcludedList);

    // 발표자 뽑기 기능
    pickButton.addEventListener('click', () => {
        const allStudents = getStudents();
        if (allStudents.length === 0) return;

        const eligibleStudents = allStudents.filter(student => !getExcludedStudents().includes(student.trim()));

        let count = parseInt(countInput.value, 10);
        if (isNaN(count) || count < 1) {
            alert('1명 이상의 발표자를 선택해야 합니다.');
            return;
        }
        if (count > eligibleStudents.length) {
            alert(`뽑으려는 발표자 수(${count})가 유효한 전체 학생 수(${eligibleStudents.length})보다 많습니다.`);
            return;
        }

        // 버튼 비활성화 및 텍스트 변경
        pickButton.disabled = true;
        pickButton.textContent = "두구두구...";

        // 최종 결과는 미리 공정하게 섞어둡니다.
        const shuffledStudents = shuffle([...eligibleStudents]);

        // "뽑는 중..." 애니메이션: 매 순간 유효한 명단에서 무작위로 한 명을 보여줍니다.
        const animationInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * eligibleStudents.length);
            displayDiv.textContent = `뽑는 중... ${eligibleStudents[randomIndex]}`;
        }, 100);

        setTimeout(() => {
            clearInterval(animationInterval);
            
            const presenters = shuffledStudents.slice(0, count);
            
            // 최종 발표자 표시
            const container = document.createElement('div');
            container.className = 'd-flex flex-wrap justify-content-center gap-3';
            
            presenters.forEach(name => {
                const nameDisplay = document.createElement('span');
                // CSS 클래스를 사용하여 스타일을 적용합니다. (style.css에 .presenter-name { color: #2141c2; } 추가 필요)
                nameDisplay.className = 'presenter-name p-3 fs-1 fw-bold animate__animated animate__bounceIn';
                nameDisplay.textContent = name;
                container.appendChild(nameDisplay);
            });
            // 기존 내용을 지우고 새로운 발표자 목록으로 교체합니다.
            displayDiv.replaceChildren(container);

            // Fire confetti!
            fireConfetti();

            // 버튼 상태 복구
            pickButton.disabled = false;
            pickButton.textContent = "다시 뽑기";
        }, REVEAL_DELAY_MS);
    });

    function fireConfetti() {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100, colors: ['#2141c2', '#3396F4', '#FF6B6B', '#FFD93D', '#6BCB77'] };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }
});
