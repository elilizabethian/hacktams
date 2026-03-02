// ============================================================
//  🖼️  PASTE YOUR IMAGE URLs HERE
//  - idle:    ONE URL shown whenever the pet is doing nothing
//  - eating / playing / petting: frames played in order as an
//    animation, then the idle image is restored automatically.
//  Leave an action array empty [] to keep the current image.
// ============================================================
const petImages = {
  idle: "assets/idle.png",

  eating: [
    'assets/eat1.png',
    'assets/eat2.png',
    'assets/eat3.png',
    'assets/eat4.png',
    
    'assets/eat5.png',
    'assets/eat6.png',
    'assets/eat7.png'
  ],
  playing: [
    'assets/play1.png',
    'assets/play2.png',
    'assets/play3.png',
    'assets/play4.png',

    'assets/play6.png',
    'assets/play7.png',
    'assets/play8.png',
    'assets/play8.png',
  ],
  petting: [
    'assets/pet1.png',
    'assets/pet2.png',
    'assets/pet3.png',
    'assets/pet2.png',
    'assets/pet1.png'
  ],
  studying: [
    'assets/study1.png',
    'assets/study2.png',
    'assets/study3.png',
    'assets/study4.png',
    'assets/study5.png',
    'assets/study6.png',
    'assets/study7.png',
    'assets/study8.png',
    'assets/study9.png',
    'assets/study10.png'
  ],

};
// ============================================================

const state = {
  hunger: 60, happy: 75, focus: 50,
  xp: 45, xpMax: 100, level: 3,
  isBusy: false,
  tapCount: 0
};

// ── Image animation ───────────────────────────────────────────

const imageAnim = {
  frameInterval: null,
  frameIndex: 0,
  fps: 3, // frames per second — adjust to taste
};
const FEED_ICON_SRC = 'assets/feedIcon.png';
const PLAY_ICON_SRC = 'assets/playIcon.png';
const DEFAULT_ACTIONS_HTML = `
  <button class="action-btn btn-feed" onclick="doAction('feed')">🍪 Feed</button>
  <button class="action-btn btn-play" onclick="doAction('play')">🎾 Play</button>
  <button class="action-btn btn-study" onclick="doAction('study')">📖 Study</button>
`;
const POMODORO_DEFAULT_SECONDS = 25 * 60;
const pomodoroState = {
  remainingSeconds: POMODORO_DEFAULT_SECONDS,
  timerId: null,
  isRunning: false,
};

function getOverlayImg() {
  let img = document.getElementById('pet-img-overlay');
  if (!img) {
    img = document.createElement('img');
    img.id = 'pet-img-overlay';
    img.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
      z-index: 2;
    `;
    document.getElementById('scene').appendChild(img);
  }
  return img;
}

function initIdleImage() {
  if (!petImages.idle) return;
  const img = getOverlayImg();
  img.src = petImages.idle;
  img.style.display = 'block';
}

function setAnimation(action) {
  const urls = petImages[action];
  if (!urls || urls.length === 0) return;

  const img = getOverlayImg();
  img.style.display = 'block';
  clearInterval(imageAnim.frameInterval);
  imageAnim.frameIndex = 0;
  img.src = urls[0];

  // Play through frames once, then restore idle
  if (urls.length > 1) {
    imageAnim.frameInterval = setInterval(() => {
      imageAnim.frameIndex++;
      if (imageAnim.frameIndex >= urls.length) {
        clearInterval(imageAnim.frameInterval);
        imageAnim.frameInterval = null;
        hidePetImage();
        return;
      }
      img.src = urls[imageAnim.frameIndex];
    }, 1000 / imageAnim.fps);
  }
}

function setLoopAnimation(action) {
  const urls = petImages[action];
  if (!urls || urls.length === 0) return;

  const img = getOverlayImg();
  img.style.display = 'block';
  clearInterval(imageAnim.frameInterval);
  imageAnim.frameIndex = 0;
  img.src = urls[0];

  if (urls.length > 1) {
    imageAnim.frameInterval = setInterval(() => {
      imageAnim.frameIndex = (imageAnim.frameIndex + 1) % urls.length;
      img.src = urls[imageAnim.frameIndex];
    }, 1000 / imageAnim.fps);
  }
}

function startStudyAnimation() {
  const urls = petImages.studying;
  if (!urls || urls.length === 0) return;

  const img = getOverlayImg();
  img.style.display = 'block';
  clearInterval(imageAnim.frameInterval);
  imageAnim.frameIndex = 0;
  img.src = urls[0];

  if (urls.length === 1) return;

  // First pass: study1 -> study10 exactly once.
  // Then loop: study3 -> study10.
  imageAnim.frameInterval = setInterval(() => {
    if (imageAnim.frameIndex < urls.length - 1) {
      imageAnim.frameIndex++;
      img.src = urls[imageAnim.frameIndex];
      return;
    }

    if (urls.length > 2) {
      imageAnim.frameIndex = 2; // study3
    } else {
      imageAnim.frameIndex = 0;
    }
    img.src = urls[imageAnim.frameIndex];
  }, 1000 / imageAnim.fps);
}

function stopStudyAnimation() {
  hidePetImage();
}

function hidePetImage() {
  clearInterval(imageAnim.frameInterval);
  imageAnim.frameInterval = null;

  if (pomodoroState.isRunning) {
    startStudyAnimation();
    return;
  }

  if (petImages.idle) {
    const img = getOverlayImg();
    img.src = petImages.idle;
  } else {
    const img = document.getElementById('pet-img-overlay');
    if (img) img.style.display = 'none';
  }
}

// ── Helpers ───────────────────────────────────────────────────

function setStat(name, val) {
  val = Math.max(0, Math.min(100, val));
  state[name] = val;
  document.getElementById('bar-' + name).style.width = val + '%';
  document.getElementById('val-' + name).textContent = Math.round(val);
}

function spawnHeart() {
  const scene = document.getElementById('scene');
  const h = document.createElement('div');
  h.className = 'heart-particle';
  const img = document.createElement('img');
  img.src = 'assets/heart.png';
  img.alt = '';
  h.appendChild(img);
  const angle = Math.random() * 2 * Math.PI;
  const radius = 15 + Math.random() * 20;
  h.style.left = (50 + Math.cos(angle) * radius * 0.7) + '%';
  h.style.top  = (50 + Math.sin(angle) * radius) + '%';
  h.style.setProperty('--dx', (Math.cos(angle) * 50) + 'px');
  h.style.setProperty('--dy', (Math.sin(angle) * 50 - 50) + 'px');
  scene.appendChild(h);
  setTimeout(() => h.remove(), 900);
}

function showBubble(text, duration = 2200) {
  if (!text) return;
  const b = document.getElementById('bubble');
  b.textContent = text;
  b.classList.add('show');
  setTimeout(() => b.classList.remove('show'), duration);
}

function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function addXP(amount) {
  state.xp += amount;
  if (state.xp >= state.xpMax) {
    state.xp -= state.xpMax;
    state.level++;
    const levelBadge = document.getElementById('level-badge');
    if (levelBadge) {
      levelBadge.textContent = '✦ LVL ' + state.level;
    }
    state.xpMax = Math.round(state.xpMax * 1.3);
  }
  const xpFill = document.getElementById('xp-fill');
  const xpText = document.getElementById('xp-text');
  if (xpFill) {
    xpFill.style.width = (state.xp / state.xpMax * 100) + '%';
  }
  if (xpText) {
    xpText.textContent = state.xp + '/' + state.xpMax;
  }
}

function updateStatusTag(text) {
  const statusTag = document.getElementById('status-tag');
  if (statusTag) {
    statusTag.textContent = text;
  }
}

function formatPomodoroTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function updatePomodoroDisplay() {
  const timerEl = document.getElementById('pomodoro-time');
  const phaseEl = document.getElementById('pomodoro-phase');
  if (timerEl) {
    timerEl.textContent = formatPomodoroTime(pomodoroState.remainingSeconds);
  }
  if (phaseEl) {
    phaseEl.textContent = pomodoroState.isRunning ? 'Focus Session · Running' : 'Focus Session';
  }
}

function startPomodoro() {
  if (pomodoroState.isRunning) return;
  pomodoroState.isRunning = true;
  startStudyAnimation();
  updatePomodoroDisplay();
  pomodoroState.timerId = setInterval(() => {
    if (pomodoroState.remainingSeconds <= 0) {
      pausePomodoro();
      showBubble('Focus session complete! 🎉', 2200);
      updatePomodoroDisplay();
      return;
    }
    pomodoroState.remainingSeconds--;
    updatePomodoroDisplay();
  }, 1000);
}

function pausePomodoro() {
  pomodoroState.isRunning = false;
  if (pomodoroState.timerId) {
    clearInterval(pomodoroState.timerId);
    pomodoroState.timerId = null;
  }
  stopStudyAnimation();
  updatePomodoroDisplay();
}

function resetPomodoro() {
  pausePomodoro();
  pomodoroState.remainingSeconds = POMODORO_DEFAULT_SECONDS;
  updatePomodoroDisplay();
}

function enterStudyMode() {
  const panel = document.querySelector('.panel');
  if (!panel) return;
  renderDefaultActions();
  panel.classList.add('study-active');
  updatePomodoroDisplay();
}

function exitStudyMode() {
  const panel = document.querySelector('.panel');
  if (!panel) return;
  panel.classList.remove('study-active');
  updateStatusTag('● Idle · feeling good');
}

function setButtonsDisabled(val) {
  document.querySelectorAll('.action-btn').forEach(b => b.disabled = val);
}

function getActionsContainer() {
  return document.querySelector('.actions');
}

function renderDefaultActions() {
  const actions = getActionsContainer();
  if (!actions) return;
  actions.classList.remove('drag-mode');
  actions.classList.remove('feed-mode');
  actions.classList.remove('play-mode');
  actions.innerHTML = DEFAULT_ACTIONS_HTML;
}

function renderFeedIcons() {
  renderDragIcons('feed', FEED_ICON_SRC);
  updateStatusTag('Drag a snack to Pochita');
}

function renderPlayIcons() {
  renderDragIcons('play', PLAY_ICON_SRC);
  updateStatusTag('Drag a toy to Pochita');
}

function renderDragIcons(actionType, iconSrc) {
  const actions = getActionsContainer();
  if (!actions) return;

  actions.classList.add('drag-mode');
  actions.classList.toggle('feed-mode', actionType === 'feed');
  actions.classList.toggle('play-mode', actionType === 'play');
  actions.innerHTML = `
    <div class="drag-slot"><img class="action-draggable" data-action="${actionType}" src="${iconSrc}" alt="${actionType} icon" draggable="true"></div>
  `;

  actions.querySelectorAll('.action-draggable').forEach((icon) => {
    icon.addEventListener('dragstart', onActionDragStart);
    icon.addEventListener('dragend', onActionDragEnd);
  });
}

function onActionDragStart(e) {
  if (state.isBusy) return;
  const actionType = e.target.dataset.action;
  e.dataTransfer.setData('text/plain', actionType || '');
  e.dataTransfer.effectAllowed = 'move';
  const pet = document.getElementById('pet');
  if (pet) pet.classList.add('feed-drop-active');
}

function onActionDragEnd() {
  const pet = document.getElementById('pet');
  if (pet) pet.classList.remove('feed-drop-active');
}

function isFeedMode() {
  const actions = getActionsContainer();
  return !!actions && actions.classList.contains('feed-mode');
}

function enterFeedMode() {
  if (state.isBusy) return;
  renderFeedIcons();
}

function isPlayMode() {
  const actions = getActionsContainer();
  return !!actions && actions.classList.contains('play-mode');
}

function enterPlayMode() {
  if (state.isBusy) return;
  renderPlayIcons();
}

function executeFeedAction() {
  if (state.isBusy) return;
  state.isBusy = true;
  renderDefaultActions();
  setButtonsDisabled(true);

  setAnimation('eating');
  showBubble(randomOf(messages.eating), 2000);
  updateStatusTag('🍪 Eating a snack...');
  setStat('hunger', state.hunger + 30);
  setStat('happy',  state.happy  + 10);
  addXP(8);
  setTimeout(endAction, 2200);
}

function initFeedDropTarget() {
  const pet = document.getElementById('pet');
  if (!pet) return;

  pet.addEventListener('dragover', (e) => {
    if ((!isFeedMode() && !isPlayMode()) || state.isBusy) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  pet.addEventListener('drop', (e) => {
    if ((!isFeedMode() && !isPlayMode()) || state.isBusy) return;
    e.preventDefault();
    const dragType = e.dataTransfer.getData('text/plain');
    if (dragType !== 'feed' && dragType !== 'play') return;
    pet.classList.remove('feed-drop-active');
    if (dragType === 'feed') {
      executeFeedAction();
    } else if (dragType === 'play') {
      executePlayAction();
    }
  });
}

// ── Actions ───────────────────────────────────────────────────

function doAction(action) {
  if (action === 'feed') {
    if (state.isBusy) return;
    enterFeedMode();
    return;
  } else if (action === 'play') {
    if (state.isBusy) return;
    enterPlayMode();
    return;
  } else if (action === 'study') {
    if (state.isBusy) return;
    enterStudyMode();
    return;
  }

  if (state.isBusy) return;
  state.isBusy = true;
  setButtonsDisabled(true);
}

function endAction() {
  state.isBusy = false;
  renderDefaultActions();
  setButtonsDisabled(false);
  hidePetImage();
  updateStatusTag('● Idle · feeling good');
}

function executePlayAction() {
  if (state.isBusy) return;
  state.isBusy = true;
  renderDefaultActions();
  setButtonsDisabled(true);

  setAnimation('playing');
  showBubble(randomOf(messages.playing), 2500);
  updateStatusTag('🎾 Playing around!');
  setStat('happy',  state.happy  + 25);
  setStat('hunger', state.hunger - 10);
  addXP(12);
  setTimeout(endAction, 2800);
}

function petTap() {
  if (state.isBusy) return;
  state.tapCount++;
  spawnHeart();
  setStat('happy', state.happy + 5);

  if (state.tapCount % 5 === 0) {
    setAnimation('petting');
    showBubble(randomOf(messages.happy), 2000);
    addXP(3);
    setTimeout(hidePetImage, 2200);
  } else {
    showBubble(randomOf(messages.idle), 1800);
  }
}

// passive decay every 30s
setInterval(() => {
  if (!state.isBusy) {
    setStat('hunger', state.hunger - 3);
    setStat('happy',  state.happy  - 2);
  }
}, 30000);

// idle chatter every 15s
setInterval(() => {
  if (!state.isBusy) {
    let pool = messages.idle;
    if (state.hunger < 30) pool = messages.hungry;
    else if (state.happy < 30) pool = messages.sad;
    showBubble(randomOf(pool), 2000);
  }
}, 15000);

// Show idle image on load
initIdleImage();
initFeedDropTarget();
updatePomodoroDisplay();
