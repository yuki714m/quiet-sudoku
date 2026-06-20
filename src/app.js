(function () {
  const STORAGE_KEY = "quiet-sudoku-state-v1";
  const HISTORY_KEY = "quiet-sudoku-history-v1";
  const DAILY_KEY = "quiet-sudoku-daily-v1";

  const boardEl = document.getElementById("board");
  const difficultySelect = document.getElementById("difficultySelect");
  const timerText = document.getElementById("timerText");
  const mistakeCount = document.getElementById("mistakeCount");
  const hintCount = document.getElementById("hintCount");
  const pauseButton = document.getElementById("pauseButton");
  const resumeButton = document.getElementById("resumeButton");
  const pauseCover = document.getElementById("pauseCover");
  const completeButton = document.getElementById("completeButton");
  const eraseButton = document.getElementById("eraseButton");
  const hintButton = document.getElementById("hintButton");
  const noteMode = document.getElementById("noteMode");
  const toast = document.getElementById("toast");
  const historyText = document.getElementById("historyText");
  const dailyText = document.getElementById("dailyText");
  const newTodayButton = document.getElementById("newTodayButton");
  const sponsorBox = document.getElementById("sponsorBox");
  const sponsorImage = document.getElementById("sponsorImage");
  const sponsorName = document.getElementById("sponsorName");
  const sponsorDescription = document.getElementById("sponsorDescription");
  const clearDialog = document.getElementById("clearDialog");
  const clearTime = document.getElementById("clearTime");
  const clearMistakes = document.getElementById("clearMistakes");
  const clearHints = document.getElementById("clearHints");
  const clearDifficulty = document.getElementById("clearDifficulty");
  const clearBadges = document.getElementById("clearBadges");
  const anotherPuzzleButton = document.getElementById("anotherPuzzleButton");
  const viewHistoryButton = document.getElementById("viewHistoryButton");
  const closeClearButton = document.getElementById("closeClearButton");
  const hintCard = document.getElementById("hintCard");
  const hintStepTitle = document.getElementById("hintStepTitle");
  const hintStepText = document.getElementById("hintStepText");
  const hintPrevButton = document.getElementById("hintPrevButton");
  const hintNextButton = document.getElementById("hintNextButton");
  const hintApplyButton = document.getElementById("hintApplyButton");
  const hintCloseButton = document.getElementById("hintCloseButton");

  const state = {
    difficulty: "easy",
    board: [],
    givens: [],
    notes: [],
    selected: 0,
    mistakes: 0,
    hints: 0,
    elapsed: 0,
    paused: false,
    completed: false,
    source: "regular",
    dailyDate: "",
    undoStack: []
  };

  let lastTick = Date.now();
  let toastTimer = 0;
  let activeHint = null;
  let hintStepIndex = 0;

  function emptyNotes() {
    return Array.from({ length: 81 }, () => []);
  }

  function puzzleFor(difficulty) {
    return QUIET_SUDOKU_PUZZLES[difficulty] || QUIET_SUDOKU_PUZZLES.easy;
  }

  function difficultyKeys() {
    return Object.keys(QUIET_SUDOKU_PUZZLES);
  }

  function loadPuzzle(difficulty, options) {
    const settings = options || {};
    const puzzle = puzzleFor(difficulty);
    state.difficulty = difficulty;
    state.board = puzzle.puzzle.split("").map((value) => (value === "0" ? "" : value));
    state.givens = state.board.map(Boolean);
    state.notes = emptyNotes();
    state.selected = Math.max(0, state.board.findIndex((value) => !value));
    state.mistakes = 0;
    state.hints = 0;
    state.elapsed = settings.keepTimer ? state.elapsed : 0;
    state.paused = false;
    state.completed = false;
    state.source = settings.source || "regular";
    state.dailyDate = settings.dailyDate || "";
    state.undoStack = [];
    clearHint();
    difficultySelect.value = difficulty;
    saveState();
    render();
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function todayDifficulty(dateKey) {
    const choices = difficultyKeys();
    const compactDate = dateKey.replaceAll("-", "");
    return choices[Number(compactDate) % choices.length];
  }

  function todayPuzzleInfo() {
    const date = todayKey();
    const difficulty = todayDifficulty(date);
    const puzzle = puzzleFor(difficulty);
    return { date, difficulty, puzzleId: puzzle.id };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      loadPuzzle("easy");
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed.board || !parsed.givens || !parsed.notes) {
        throw new Error("Invalid saved state");
      }
      Object.assign(state, {
        hints: 0,
        source: "regular",
        dailyDate: "",
        undoStack: []
      }, parsed, { paused: false });
      difficultySelect.value = state.difficulty;
      render();
    } catch (error) {
      loadPuzzle("easy");
    }
  }

  function saveHistory(result) {
    const history = readHistory();
    history.unshift(result);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    renderHistory();
  }

  function readHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function readDaily() {
    try {
      return JSON.parse(localStorage.getItem(DAILY_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveDaily(entry) {
    localStorage.setItem(DAILY_KEY, JSON.stringify(entry));
  }

  function ensureTodayEntry() {
    const info = todayPuzzleInfo();
    const saved = readDaily();
    if (saved.date === info.date && saved.puzzleId === info.puzzleId) return saved;
    const entry = {
      date: info.date,
      difficulty: info.difficulty,
      puzzleId: info.puzzleId,
      completed: false,
      completedAt: "",
      elapsed: 0,
      mistakes: 0,
      hints: 0
    };
    saveDaily(entry);
    return entry;
  }

  function markDailyComplete(result) {
    const entry = ensureTodayEntry();
    if (entry.date !== result.dailyDate || entry.puzzleId !== result.puzzleId) return;
    saveDaily({
      ...entry,
      completed: true,
      completedAt: result.completedAt,
      elapsed: result.elapsed,
      mistakes: result.mistakes,
      hints: result.hints
    });
  }

  function renderHistory() {
    const history = readHistory();
    if (!history.length) {
      historyText.textContent = "まだクリア履歴はありません。";
      return;
    }
    const latest = history[0];
    historyText.textContent = `${labelFor(latest.difficulty)}を${formatTime(latest.elapsed)}でクリア。ミス${latest.mistakes}、ヒント${latest.hints}。`;
  }

  function renderDaily() {
    const entry = ensureTodayEntry();
    const status = entry.completed
      ? `クリア済み ${formatTime(entry.elapsed)} / ミス${entry.mistakes}`
      : "未クリア";
    dailyText.textContent = `今日(${entry.date})の一問: ${labelFor(entry.difficulty)} / ${status}`;
  }

  function labelFor(difficulty) {
    return puzzleFor(difficulty).name;
  }

  function renderSponsor() {
    const sponsor = QUIET_SUDOKU_SPONSOR;
    sponsorName.textContent = sponsor.name;
    sponsorDescription.textContent = sponsor.description;
    sponsorBox.classList.toggle("clickable", Boolean(sponsor.url));
    sponsorBox.tabIndex = sponsor.url ? 0 : -1;
    sponsorBox.setAttribute("aria-disabled", sponsor.url ? "false" : "true");
    if (sponsor.image) {
      sponsorImage.style.backgroundImage = `url("${sponsor.image}")`;
      sponsorImage.style.backgroundSize = "cover";
      sponsorImage.style.backgroundPosition = "center";
    }
  }

  function render() {
    renderBoard();
    renderNumberPad();
    timerText.textContent = formatTime(state.elapsed);
    mistakeCount.textContent = state.mistakes;
    hintCount.textContent = state.hints;
    pauseCover.hidden = !state.paused;
    pauseButton.textContent = state.paused ? "▶" : "⏸";
    pauseButton.setAttribute("aria-label", state.paused ? "再開" : "一時停止");
    completeButton.disabled = !canCompleteRest();
    eraseButton.disabled = state.completed || state.givens[state.selected];
    hintButton.disabled = state.completed || !state.board.some((value, index) => !value && !state.givens[index]);
    renderHintCard();
    renderHistory();
    renderDaily();
  }

  function renderBoard() {
    const selectedValue = state.board[state.selected];
    boardEl.innerHTML = "";
    state.board.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = classForCell(index, value, selectedValue);
      cell.setAttribute("aria-label", cellLabel(index, value));
      cell.dataset.index = String(index);

      if (value) {
        cell.textContent = value;
      } else {
        cell.appendChild(notesElement(state.notes[index]));
      }

      cell.addEventListener("click", () => {
        state.selected = index;
        render();
      });
      boardEl.appendChild(cell);
    });
  }

  function classForCell(index, value, selectedValue) {
    const classes = ["cell"];
    if (state.givens[index]) classes.push("given");
    if (value && !state.givens[index]) classes.push("filled");
    if (index === state.selected) classes.push("selected");
    classes.push(...hintClassesForCell(index));
    if (isSameBox(index, state.selected)) {
      classes.push("selected-box");
      classes.push(...boxEdgeClasses(index, state.selected));
    }
    if (isRelated(index, state.selected) && index !== state.selected) classes.push("related");
    if (value && selectedValue && value === selectedValue) classes.push("same");
    if (value && value !== puzzleFor(state.difficulty).solution[index]) classes.push("wrong");
    return classes.join(" ");
  }

  function renderNumberPad() {
    const counts = numberCounts();
    const selectedValue = state.board[state.selected];
    document.querySelectorAll("[data-number]").forEach((button) => {
      const number = button.dataset.number;
      const completed = counts[number] >= 9;
      button.classList.toggle("active-number", Boolean(selectedValue) && selectedValue === number && !completed);
      button.classList.toggle("completed", completed);
      button.disabled = state.completed || completed;
      button.setAttribute("aria-hidden", completed ? "true" : "false");
      button.tabIndex = completed ? -1 : 0;
    });
  }

  function numberCounts() {
    return state.board.reduce((counts, value) => {
      if (value) counts[value] = (counts[value] || 0) + 1;
      return counts;
    }, {});
  }

  function remainingBlankCount() {
    return state.board.filter((value) => !value).length;
  }

  function canCompleteRest() {
    const blanks = remainingBlankCount();
    return !state.paused && !state.completed && blanks > 0 && blanks <= 10;
  }

  function hintClassesForCell(index) {
    if (!activeHint) return [];
    const classes = [];
    const row = Math.floor(index / 9);
    const col = index % 9;
    if (activeHint.wrongCells && activeHint.wrongCells.some(([r, c]) => r === row && c === col)) {
      classes.push("hint-wrong");
    }
    const step = activeHint.steps && activeHint.steps[hintStepIndex];
    if (!step) return classes;
    const highlight = step.highlight || {};
    const area = highlight.area || highlight;
    if (isInHintArea(row, col, area)) classes.push("hint-area");
    if (isHintTarget(row, col, highlight)) classes.push("hint-target");
    return classes;
  }

  function isInHintArea(row, col, area) {
    if (!area) return false;
    if (area.type === "row") return row === area.row;
    if (area.type === "column") return col === area.col;
    if (area.type === "block") {
      return Math.floor(row / 3) === area.blockRow && Math.floor(col / 3) === area.blockCol;
    }
    return false;
  }

  function isHintTarget(row, col, highlight) {
    if (!highlight) return false;
    if (highlight.type === "cell") return row === highlight.row && col === highlight.col;
    if (highlight.type === "cells") return highlight.cells.some(([r, c]) => r === row && c === col);
    return false;
  }

  function isRelated(a, b) {
    const rowA = Math.floor(a / 9);
    const rowB = Math.floor(b / 9);
    const colA = a % 9;
    const colB = b % 9;
    const boxA = Math.floor(rowA / 3) * 3 + Math.floor(colA / 3);
    const boxB = Math.floor(rowB / 3) * 3 + Math.floor(colB / 3);
    return rowA === rowB || colA === colB || boxA === boxB;
  }

  function isSameBox(a, b) {
    const rowA = Math.floor(a / 9);
    const rowB = Math.floor(b / 9);
    const colA = a % 9;
    const colB = b % 9;
    return Math.floor(rowA / 3) === Math.floor(rowB / 3) && Math.floor(colA / 3) === Math.floor(colB / 3);
  }

  function boxEdgeClasses(index, selectedIndex) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const selectedRow = Math.floor(selectedIndex / 9);
    const selectedCol = selectedIndex % 9;
    const boxTop = Math.floor(selectedRow / 3) * 3;
    const boxLeft = Math.floor(selectedCol / 3) * 3;
    const classes = [];
    if (row === boxTop) classes.push("box-top");
    if (row === boxTop + 2) classes.push("box-bottom");
    if (col === boxLeft) classes.push("box-left");
    if (col === boxLeft + 2) classes.push("box-right");
    return classes;
  }

  function cellLabel(index, value) {
    const row = Math.floor(index / 9) + 1;
    const col = (index % 9) + 1;
    return `${row}行${col}列 ${value || "空"}`;
  }

  function notesElement(notes) {
    const wrapper = document.createElement("span");
    wrapper.className = "notes";
    for (let i = 1; i <= 9; i += 1) {
      const note = document.createElement("span");
      note.textContent = notes.includes(String(i)) ? String(i) : "";
      wrapper.appendChild(note);
    }
    return wrapper;
  }

  function pushUndo() {
    state.undoStack.push({
      board: [...state.board],
      notes: state.notes.map((notes) => [...notes]),
      mistakes: state.mistakes,
      hints: state.hints,
      completed: state.completed
    });
    state.undoStack = state.undoStack.slice(-80);
  }

  function inputNumber(number) {
    if (state.paused || state.completed) return;
    const index = state.selected;
    if (state.givens[index]) {
      showToast("最初から入っている数字は編集できません。");
      return;
    }

    pushUndo();
    clearHint();
    if (noteMode.checked) {
      toggleNote(index, number);
    } else {
      setValue(index, number);
    }
    saveState();
    render();
  }

  function toggleNote(index, number) {
    if (state.board[index]) state.board[index] = "";
    const notes = new Set(state.notes[index]);
    if (notes.has(number)) {
      notes.delete(number);
    } else {
      notes.add(number);
    }
    state.notes[index] = Array.from(notes).sort();
  }

  function setValue(index, number) {
    state.board[index] = number;
    state.notes[index] = [];
    if (number !== puzzleFor(state.difficulty).solution[index]) {
      state.mistakes += 1;
      showToast("正解と違う数字です。");
    }
    checkComplete();
  }

  function eraseSelected() {
    if (state.paused || state.completed || state.givens[state.selected]) return;
    pushUndo();
    clearHint();
    state.board[state.selected] = "";
    state.notes[state.selected] = [];
    saveState();
    render();
  }

  function undo() {
    const previous = state.undoStack.pop();
    if (!previous) return;
    state.board = previous.board;
    state.notes = previous.notes;
    state.mistakes = previous.mistakes;
    state.hints = previous.hints || 0;
    state.completed = previous.completed;
    clearHint();
    saveState();
    render();
  }

  function completeRest() {
    if (!canCompleteRest()) return;
    const solution = puzzleFor(state.difficulty).solution;
    pushUndo();
    clearHint();
    state.board = state.board.map((value, index) => value || solution[index]);
    state.notes = state.notes.map((notes, index) => (state.board[index] ? [] : notes));
    saveState();
    render();
    checkComplete();
  }

  function clearHint() {
    activeHint = null;
    hintStepIndex = 0;
  }

  function useHint() {
    if (state.paused || state.completed) return;
    activeHint = QUIET_SUDOKU_HINTS.getNextHint(state.board, puzzleFor(state.difficulty).solution);
    hintStepIndex = 0;
    if (typeof activeHint.row === "number" && typeof activeHint.col === "number") {
      state.selected = activeHint.row * 9 + activeHint.col;
    }
    render();
  }

  function renderHintCard() {
    if (!activeHint) {
      hintCard.hidden = true;
      return;
    }

    hintCard.hidden = false;
    const steps = activeHint.steps || [];
    const step = steps[hintStepIndex];
    hintStepTitle.textContent = step ? step.title : "ヒント";
    hintStepText.textContent = step ? step.text : activeHint.message;
    hintPrevButton.disabled = hintStepIndex <= 0 || !steps.length;
    hintNextButton.disabled = hintStepIndex >= steps.length - 1 || !steps.length;
    hintApplyButton.disabled = !canApplyHintAnswer();
  }

  function canApplyHintAnswer() {
    if (!activeHint || !activeHint.steps || !activeHint.steps.length) return false;
    if (hintStepIndex < activeHint.steps.length - 1) return false;
    const index = activeHint.row * 9 + activeHint.col;
    return !state.completed && !state.givens[index] && !state.board[index];
  }

  function showPreviousHintStep() {
    if (!activeHint || hintStepIndex <= 0) return;
    hintStepIndex -= 1;
    render();
  }

  function showNextHintStep() {
    if (!activeHint || !activeHint.steps || hintStepIndex >= activeHint.steps.length - 1) return;
    hintStepIndex += 1;
    render();
  }

  function closeHint() {
    clearHint();
    render();
  }

  function applyHintAnswer() {
    if (!canApplyHintAnswer()) return;
    const index = activeHint.row * 9 + activeHint.col;
    pushUndo();
    state.board = QUIET_SUDOKU_HINTS.applyHintAnswer(state.board, activeHint);
    state.notes[index] = [];
    state.selected = index;
    state.hints += 1;
    clearHint();
    saveState();
    render();
    checkComplete();
  }

  function buildResult() {
    const puzzle = puzzleFor(state.difficulty);
    return {
      puzzleId: puzzle.id,
      difficulty: state.difficulty,
      elapsed: state.elapsed,
      mistakes: state.mistakes,
      hints: state.hints,
      source: state.source,
      dailyDate: state.dailyDate,
      completedAt: new Date().toISOString()
    };
  }

  function checkComplete() {
    const solved = state.board.join("") === puzzleFor(state.difficulty).solution;
    if (!solved) return;
    state.completed = true;
    const result = buildResult();
    saveHistory(result);
    if (state.source === "daily") markDailyComplete(result);
    saveState();
    showClearResult(result);
  }

  function badgeLabels(result) {
    const badges = [];
    if (result.mistakes === 0) badges.push("ノーミス");
    if (result.hints === 0) badges.push("ヒントなし");
    if (result.source === "daily") badges.push("今日の一問クリア");
    badges.push(`${labelFor(result.difficulty)}クリア`);
    return badges;
  }

  function showClearResult(result) {
    clearTime.textContent = formatTime(result.elapsed);
    clearMistakes.textContent = String(result.mistakes);
    clearHints.textContent = String(result.hints);
    clearDifficulty.textContent = labelFor(result.difficulty);
    clearBadges.innerHTML = "";
    badgeLabels(result).forEach((label) => {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = label;
      clearBadges.appendChild(badge);
    });
    if (typeof clearDialog.showModal === "function") {
      clearDialog.showModal();
    } else {
      showToast("クリアしました。静かな集中、お見事です。");
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function tick() {
    const now = Date.now();
    if (!state.paused && !state.completed) {
      const delta = Math.floor((now - lastTick) / 1000);
      if (delta > 0) {
        state.elapsed += delta;
        lastTick = now;
        timerText.textContent = formatTime(state.elapsed);
        saveState();
      }
    } else {
      lastTick = now;
    }
    window.requestAnimationFrame(tick);
  }

  function loadTodayPuzzle() {
    const entry = ensureTodayEntry();
    loadPuzzle(entry.difficulty, { source: "daily", dailyDate: entry.date });
    showToast(entry.completed ? "今日の一問をもう一度開きました。" : "今日の一問を開きました。");
  }

  function loadNextPuzzle() {
    const choices = difficultyKeys();
    const index = choices.indexOf(state.difficulty);
    const next = choices[(index + 1) % choices.length] || "easy";
    if (clearDialog.open) clearDialog.close();
    loadPuzzle(next);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!["http:", "https:"].includes(window.location.protocol)) return;
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      showToast("オフライン準備を完了できませんでした。");
    });
  }

  difficultySelect.addEventListener("change", () => {
    clearHint();
    loadPuzzle(difficultySelect.value);
  });

  pauseButton.addEventListener("click", () => {
    state.paused = !state.paused;
    saveState();
    render();
  });

  resumeButton.addEventListener("click", () => {
    state.paused = false;
    saveState();
    render();
  });

  completeButton.addEventListener("click", completeRest);
  eraseButton.addEventListener("click", eraseSelected);
  hintButton.addEventListener("click", useHint);
  hintPrevButton.addEventListener("click", showPreviousHintStep);
  hintNextButton.addEventListener("click", showNextHintStep);
  hintApplyButton.addEventListener("click", applyHintAnswer);
  hintCloseButton.addEventListener("click", closeHint);

  document.querySelectorAll("[data-number]").forEach((button) => {
    button.addEventListener("click", () => inputNumber(button.dataset.number));
  });

  newTodayButton.addEventListener("click", loadTodayPuzzle);
  anotherPuzzleButton.addEventListener("click", loadNextPuzzle);
  closeClearButton.addEventListener("click", () => clearDialog.close());
  viewHistoryButton.addEventListener("click", () => {
    clearDialog.close();
    document.querySelector(".progress-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  sponsorBox.addEventListener("click", () => {
    const url = QUIET_SUDOKU_SPONSOR.url;
    if (url) window.open(url, "_blank", "noopener");
  });

  sponsorBox.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const url = QUIET_SUDOKU_SPONSOR.url;
    if (url) window.open(url, "_blank", "noopener");
  });

  window.addEventListener("keydown", (event) => {
    if (/^[1-9]$/.test(event.key)) inputNumber(event.key);
    if (event.key === "Backspace" || event.key === "Delete") eraseSelected();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") undo();
  });

  renderSponsor();
  ensureTodayEntry();
  loadState();
  registerServiceWorker();
  tick();
})();
