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
    'assets/eat4.png'
  ],
  playing: [
    'assets/play1.png',
    'assets/play2.png',
    'assets/play3.png',
    'assets/play4.png'
  ],
  petting: [
    'assets/pet2.png',
    'assets/pet3.png',
    'assets/pet2.png',
  ],
};
// ============================================================

const state = {
  hunger: 60, happy: 75, energy: 80, focus: 50,
  xp: 45, xpMax: 100, level: 3,
  isBusy: false,
  tapCount: 0
};

const messages = {
  idle:     ["I'm bored... 🥺", "Pet me! 🐾", "Wanna study together? 📚", "Can I have a snack? 🍪"],
  hungry:   ["Feed me please! 😿", "My tummy's rumbling... 🍽️", "Cookie? 🍪"],
  tired:    ["So sleepy... 😴", "Need a nap... 💤", "Zzzz..."],
  sad:      ["I feel lonely 😢", "Play with me? 🎾", "Cheer me up? 💔"],
  eating:   ["Nom nom nom! 😋", "Yummy!! ✨", "More please! 🍪"],
  playing:  ["Wheee!! 🎉", "This is SO fun! 🎾", "Yay yay yay! ⭐"],
  studying: ["Learning hard! 🧠", "Almost got it...📖", "Focus focus... 🎯"],
  sleeping: ["zzz... 💤", "Dreaming of fish... 🐟", "Do not disturb! 🌙"],
  happy:    ["I love you!! 💖", "Best day ever! ✨", "Squeee! 🌸"],
  levelup:  ["I LEVELED UP!! 🎊", "Look at me grow! ⭐", "Woohoo!! 🎉"]
};

// ── Image animation ───────────────────────────────────────────

const imageAnim = {
  frameInterval: null,
  frameIndex: 0,
  fps: 3, // frames per second — adjust to taste
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

function hidePetImage() {
  clearInterval(imageAnim.frameInterval);
  imageAnim.frameInterval = null;

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
  h.textContent = ['💖','✨','🌸','⭐','💕','🌟'][Math.floor(Math.random()*6)];
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
    document.getElementById('level-badge').textContent = '✦ LVL ' + state.level;
    state.xpMax = Math.round(state.xpMax * 1.3);
  }
  document.getElementById('xp-fill').style.width = (state.xp / state.xpMax * 100) + '%';
  document.getElementById('xp-text').textContent = state.xp + '/' + state.xpMax;
}

function updateStatusTag(text) {
  document.getElementById('status-tag').textContent = text;
}

function setButtonsDisabled(val) {
  document.querySelectorAll('.action-btn').forEach(b => b.disabled = val);
}

// ── Actions ───────────────────────────────────────────────────

function doAction(action) {
  if (state.isBusy) return;
  state.isBusy = true;
  setButtonsDisabled(true);

  if (action === 'feed') {
    setAnimation('eating');
    showBubble(randomOf(messages.eating), 2000);
    updateStatusTag('🍪 Eating a snack...');
    setStat('hunger', state.hunger + 30);
    setStat('happy',  state.happy  + 10);
    addXP(8);
    setTimeout(endAction, 2200);

  } else if (action === 'play') {
    setAnimation('playing');
    showBubble(randomOf(messages.playing), 2500);
    updateStatusTag('🎾 Playing around!');
    setStat('happy',  state.happy  + 25);
    setStat('energy', state.energy - 15);
    setStat('hunger', state.hunger - 10);
    addXP(12);
    setTimeout(endAction, 2800);

  } else if (action === 'study') {
    showBubble(randomOf(messages.studying), 3000);
    updateStatusTag('📖 Studying hard...');
    setStat('focus',  state.focus  + 30);
    setStat('energy', state.energy - 10);
    setStat('hunger', state.hunger - 8);
    addXP(20);
    setTimeout(endAction, 3200);

  } else if (action === 'sleep') {
    showBubble(randomOf(messages.sleeping), 3500);
    updateStatusTag('💤 Taking a nap...');
    setStat('energy', state.energy + 40);
    setStat('hunger', state.hunger - 5);
    addXP(5);
    setTimeout(endAction, 4000);
  }
}

function endAction() {
  state.isBusy = false;
  setButtonsDisabled(false);
  hidePetImage();
  updateStatusTag('● Idle · feeling good');
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
    setStat('energy', state.energy - 1);
  }
}, 30000);

// idle chatter every 15s
setInterval(() => {
  if (!state.isBusy) {
    let pool = messages.idle;
    if (state.hunger < 30) pool = messages.hungry;
    else if (state.energy < 30) pool = messages.tired;
    else if (state.happy < 30) pool = messages.sad;
    showBubble(randomOf(pool), 2000);
  }
}, 15000);

// Show idle image on load
initIdleImage();