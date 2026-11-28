"use strict";

// 기존 실제 앱 링크를 유지합니다.
const SITE_CONFIG = {
  appUrl: "https://class-group-maker-njerybg9q-wnsghks959765-jpg.vercel.app/"
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
  $("#app-link-status").textContent = "실제 앱은 새 탭에서 열리며 교사 계정으로 로그인해 사용할 수 있습니다.";
}

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

// 발표 사이트 코드 영역: 실제 GitHub 코드 및 보안 정책 캡처를 탭으로 전환합니다.
const evidenceTabs = $$("[data-evidence]");
function showEvidence(selectedTab, moveFocus = false) {
  evidenceTabs.forEach(tab => {
    const active = tab === selectedTab;
    tab.classList.toggle("is-current", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (panel) panel.hidden = !active;
  });
  if (moveFocus) selectedTab.focus();
}
evidenceTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => showEvidence(tab));
  tab.addEventListener("keydown", event => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % evidenceTabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + evidenceTabs.length) % evidenceTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = evidenceTabs.length - 1;
    showEvidence(evidenceTabs[next], true);
  });
});
if (evidenceTabs.length) showEvidence(evidenceTabs[0]);
