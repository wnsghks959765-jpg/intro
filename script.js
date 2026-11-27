"use strict";

// ================================================================
// 발표 전에 여기만 수정하세요.
// appUrl: 실제 '우리 반 모둠 편성기' Vercel 배포 주소 (https://로 시작)
// beforeSeconds / afterSeconds: 동일 조건으로 직접 측정한 '반복 편성' 시간(초)
// 값을 모르면 null 그대로 두세요. 숫자를 임의로 만들지 않습니다.
// ================================================================
const SITE_CONFIG = {
  appUrl: "https://class-group-maker-njerybg9q-wnsghks959765-jpg.vercel.app/",
  beforeSeconds: null,
  afterSeconds: null
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// 실제 앱 링크를 입력하기 전에는 소개 페이지의 샘플 시연 위치로 이동합니다.
const validAppLink = /^https:\/\/[^\s/]+\.[^\s/]+/i.test(SITE_CONFIG.appUrl);
$$('[data-app-link]').forEach(link => {
  if (validAppLink) {
    link.href = SITE_CONFIG.appUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = '실제 앱 실행하기 <span aria-hidden="true">↗</span>';
  } else {
    link.href = "#demo";
    link.innerHTML = '가명 시연 보기 <span aria-hidden="true">↓</span>';
  }
});
if (validAppLink && $("#app-link-status")) {
  $("#app-link-status").textContent = "실제 앱은 별도 탭에서 열립니다. 테스트용 계정으로 미리 로그인해 두세요.";
}

// 개발 전/후 시간은 직접 측정값이 있을 때만 표시합니다.
const formatTime = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return "실측값 입력 전";
  const minutes = Math.floor(sec / 60);
  const seconds = Math.round(sec % 60);
  return minutes > 0 ? `${minutes}분 ${String(seconds).padStart(2, "0")}초` : `${seconds}초`;
};
$("#before-time").textContent = formatTime(SITE_CONFIG.beforeSeconds);
$("#after-time").textContent = formatTime(SITE_CONFIG.afterSeconds);

// 모바일 메뉴
const menuButton = $(".menu-toggle");
const nav = $("#main-navigation");
menuButton.addEventListener("click", () => {
  const opening = !nav.classList.contains("is-open");
  nav.classList.toggle("is-open", opening);
  menuButton.setAttribute("aria-expanded", String(opening));
  menuButton.setAttribute("aria-label", opening ? "메뉴 닫기" : "메뉴 열기");
});
$$("#main-navigation a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "메뉴 열기");
}));

// 소개 페이지 전용 '가명 데이터' 미리보기. 실제 웹앱 알고리즘과는 별개입니다.
const DEMO_STUDENTS = [
  { name: "김민수", group: 1 }, { name: "이하린", group: 1 },
  { name: "박지우", group: 1 }, { name: "정수아", group: 1 },
  { name: "김철수", group: 2 }, { name: "오유나", group: 2 },
  { name: "조현우", group: 2 }, { name: "전지민", group: 2 },
  { name: "서예린", group: null }, { name: "윤도현", group: null },
  { name: "한유진", group: null }, { name: "장민재", group: null }
];
const CAPACITIES = [4, 4, 4];
let currentMode = "balanced";
let drawIndex = 0;
let lastSignature = "";

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function assignRandom() {
  const students = shuffle(DEMO_STUDENTS);
  let offset = 0;
  return CAPACITIES.map(cap => {
    const team = students.slice(offset, offset + cap);
    offset += cap;
    return team;
  });
}
function assignBalanced() {
  const teams = CAPACITIES.map(() => []);
  const buckets = [1, 2, null].map(group => shuffle(DEMO_STUDENTS.filter(s => s.group === group)));
  for (const bucket of buckets) {
    for (const student of bucket) {
      const options = CAPACITIES.map((cap, index) => ({
        index, cap, size: teams[index].length,
        same: teams[index].filter(x => x.group === student.group).length,
        tie: Math.random()
      })).filter(t => t.size < t.cap);
      options.sort((a,b) => a.same - b.same || (a.size / a.cap) - (b.size / b.cap) || a.tie - b.tie);
      teams[options[0].index].push(student);
    }
  }
  return teams.map(shuffle);
}
function renderDemo() {
  let teams;
  let signature;
  for (let tries = 0; tries < 15; tries++) {
    teams = currentMode === "balanced" ? assignBalanced() : assignRandom();
    signature = teams.map(team => team.map(s => s.name).sort().join(",")).join("|");
    if (signature !== lastSignature) break;
  }
  lastSignature = signature;
  const root = $("#demo-groups");
  root.replaceChildren();
  teams.forEach((team, index) => {
    const card = document.createElement("article");
    card.className = "demo-group";
    const heading = document.createElement("div");
    heading.className = "demo-group-head";
    const title = document.createElement("strong");
    title.textContent = `${index + 1}모둠`;
    const count = document.createElement("span");
    count.textContent = `${team.length}명`;
    heading.append(title, count);
    const list = document.createElement("ul");
    team.forEach(s => {
      const item = document.createElement("li");
      item.textContent = s.name; // 이름을 HTML 코드가 아닌 글자로 표시
      list.append(item);
    });
    card.append(heading, list);
    root.append(card);
  });
  drawIndex++;
  $("#demo-status").textContent = `${currentMode === "balanced" ? "균형" : "무작위"} 배정 · ${drawIndex}번째 결과`;
}
$$(".mode-button").forEach(button => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    $$(".mode-button").forEach(btn => {
      const selected = btn === button;
      btn.classList.toggle("is-active", selected);
      btn.setAttribute("aria-pressed", String(selected));
    });
    renderDemo();
  });
});
$("#reshuffle").addEventListener("click", renderDemo);
renderDemo();

const snippets = {
  participants: {
    code: `// 참여한 학생만 배정 대상에 포함\nconst participants = students.filter(\n  student => student.isSelected\n);`,
    explanation: "결석·미참여 학생을 제외하고 실제 편성 대상만 선정하는 개념입니다."
  },
  balance: {
    code: `// 모둠 정원을 넘기지 않으면서\n// 같은 분류 학생이 몰리지 않게 배정\nchooseTeam({ capacity, groupCounts });`,
    explanation: "선택한 그룹 수와 각 모둠 정원을 고려해 학생을 나누는 원리를 의사코드로 나타냈습니다."
  },
  security: {
    code: `-- RLS 접근 허용 조건의 예\nUSING (auth.uid() = teacher_id)\nWITH CHECK (auth.uid() = teacher_id)`,
    explanation: "로그인한 교사와 기록의 소유자가 일치할 때만 접근을 허용하는 RLS 조건의 예입니다."
  }
};
function selectSnippet(key) {
  $$(".code-tab").forEach(btn => {
    const active = btn.dataset.snippet === key;
    btn.classList.toggle("is-current", active);
    btn.setAttribute("aria-selected", String(active));
    btn.tabIndex = active ? 0 : -1;
  });
  $("#code-content code").textContent = snippets[key].code;
  $("#code-explanation").textContent = snippets[key].explanation;
  $("#code-content").setAttribute("aria-labelledby", `tab-${key}`);
}
$$(".code-tab").forEach(btn => btn.addEventListener("click", () => selectSnippet(btn.dataset.snippet)));
selectSnippet("participants");
