document.addEventListener('DOMContentLoaded', () => {
    const generateSeatsButton = document.getElementById('generate-seats');
    const saveImageButton = document.getElementById('save-image');
    const group1Div = document.getElementById('group-1');
    const group2Div = document.getElementById('group-2');
    const group3Div = document.getElementById('group-3');

    // 카드 DOM을 생성하고 애니메이션을 실행하는 헬퍼 함수
    function createSeatCardDOM(pair) {
        const container = document.createElement('div');
        container.className = 'seat-container';
        const card = document.createElement('div');
        card.className = 'seat-card';
        const front = document.createElement('div');
        front.className = 'seat-front';
        front.textContent = 'SSAFY';
        const back = document.createElement('div');
        back.className = 'seat-back';
        back.textContent = `${pair[0]} - ${pair[1]}`;
        // 생성된 이름표를 직접 수정할 수 있도록 contenteditable 속성 추가
        back.setAttribute('contenteditable', 'true');

        card.appendChild(front);
        card.appendChild(back);
        container.appendChild(card);
        
        return { container, card };
    }

    // URL에서 좌석을 불러올 때 사용하는, 이미 뒤집힌 카드 DOM 생성 함수
    function createFlippedSeatCardDOM(content) {
        const container = document.createElement('div');
        container.className = 'seat-container';
        const card = document.createElement('div');
        card.className = 'seat-card flipped'; // 처음부터 뒤집힌 상태
        const front = document.createElement('div');
        front.className = 'seat-front';
        front.textContent = 'SSAFY';
        const back = document.createElement('div');
        back.className = 'seat-back';
        back.textContent = content;
        back.setAttribute('contenteditable', 'true');

        card.appendChild(front);
        card.appendChild(back);
        container.appendChild(card);
        
        return container;
    }

    // 현재 좌석 배치를 URL 파라미터로 업데이트하는 함수
    function updateURLWithSeats() {
        const g1 = Array.from(group1Div.querySelectorAll('.seat-back')).map(el => el.textContent).join(';');
        const g2 = Array.from(group2Div.querySelectorAll('.seat-back')).map(el => el.textContent).join(';');
        const g3 = Array.from(group3Div.querySelectorAll('.seat-back')).map(el => el.textContent).join(';');

        const params = new URLSearchParams();
        if (g1) params.set('g1', g1);
        if (g2) params.set('g2', g2);
        if (g3) params.set('g3', g3);

        const queryString = params.toString();
        // 페이지를 새로고침하지 않고 URL만 변경 (replaceState로 히스토리 중복 방지)
        if (queryString) {
            history.replaceState(null, '', `?${queryString}`);
        } else {
            history.replaceState(null, '', window.location.pathname);
        }
    }

    // URL 파라미터를 읽어 좌석을 복원하는 함수
    function loadSeatsFromURL() {
        const params = new URLSearchParams(window.location.search);
        const g1 = params.get('g1');
        const g2 = params.get('g2');
        const g3 = params.get('g3');

        if (!g1 && !g2 && !g3) {
            return; // URL에 좌석 정보가 없으면 종료
        }

        group1Div.innerHTML = '';
        group2Div.innerHTML = '';
        group3Div.innerHTML = '';

        if (g1) {
            g1.split(';').filter(c => c).forEach(content => {
                group1Div.appendChild(createFlippedSeatCardDOM(content));
            });
        }
        if (g2) {
            g2.split(';').filter(c => c).forEach(content => {
                group2Div.appendChild(createFlippedSeatCardDOM(content));
            });
        }
        if (g3) {
            g3.split(';').filter(c => c).forEach(content => {
                group3Div.appendChild(createFlippedSeatCardDOM(content));
            });
        }
    }

    // --- 페이지 로드 및 이벤트 리스너 설정 ---

    // 1. 페이지가 로드되면 URL에서 좌석 정보를 불러와 복원 시도
    loadSeatsFromURL();

    // 2. 사용자가 수동으로 좌석 이름을 수정하면 URL을 업데이트하도록 리스너 추가
    document.getElementById('seating-chart').addEventListener('blur', (event) => {
        if (event.target.matches('.seat-back[contenteditable="true"]')) {
            updateURLWithSeats();
        }
    }, true);

    // 자리 생성 기능
    generateSeatsButton.addEventListener('click', () => {
        const students = getStudents();
        if (students.length === 0) return;
 
        const shuffledStudents = shuffle([...students]);

        const allCards = [];

        // Clear previous results
        group1Div.innerHTML = '';
        group2Div.innerHTML = '';
        group3Div.innerHTML = '';

        // 홀수 인원일 경우, 한 명을 무작위로 선택하여 따로 보관
        let singleStudentPair = null;
        if (shuffledStudents.length % 2 !== 0) {
            const randomIndex = Math.floor(Math.random() * shuffledStudents.length);
            const singleStudent = shuffledStudents.splice(randomIndex, 1)[0];
            singleStudentPair = [singleStudent, '짝꿍 없음'];
        }

        const pairs = [];
        for (let i = 0; i < shuffledStudents.length; i += 2) {
            pairs.push([shuffledStudents[i], shuffledStudents[i + 1]]);
        }

        // 짝이 있는 학생들 먼저 배치
        let groupIndex = 1;
        pairs.forEach((pair) => {
            const { container, card } = createSeatCardDOM(pair);
            allCards.push(card);

            if (groupIndex === 1) {
                group1Div.appendChild(container);
            } else if (groupIndex === 2) {
                group2Div.appendChild(container);
            } else {
                group3Div.appendChild(container);
            }
            groupIndex = groupIndex === 3 ? 1 : groupIndex + 1;
        });

        // 짝이 없는 학생이 있다면, 1분단 맨 뒤에 고정 배치
        if (singleStudentPair) {
            const { container, card } = createSeatCardDOM(singleStudentPair);
            allCards.push(card);
            group1Div.appendChild(container);
        }

        // 3. 좌석 생성 후 즉시 URL 업데이트
        updateURLWithSeats();

        // 모든 카드를 DOM에 추가한 후, 순차적으로 애니메이션 실행
        allCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('flipped');
            }, 100 + (index * 75)); // 0.075초 간격으로 더 빠르게 공개하여 '촤르르' 뒤집히는 효과를 연출
        });
    });

    // 이미지 저장 기능
    saveImageButton.addEventListener('click', () => {
        // 자리 배치 결과 영역만 선택
        const captureArea = document.querySelector('#seating-chart');

        // 캡처 전, 렌더링을 위한 임시 클래스 추가
        document.body.classList.add('html2canvas-rendering');

        html2canvas(captureArea, { 
            backgroundColor: "#ffffff",
            scale: 2 // 해상도를 2배로 높여 이미지 품질 개선
        }).then(canvas => {
            // 캡처가 끝나면 임시 클래스를 즉시 제거하여 원래대로 복구
            document.body.classList.remove('html2canvas-rendering');

            const link = document.createElement('a');
            
            // 파일 이름에 오늘 날짜 추가 (예: SSAFY_자리배치_2023-10-27.png)
            const today = new Date();
            const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            link.download = `SSAFY_자리배치_${dateString}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
});
