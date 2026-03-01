
const petImages = {
  idle: "idle.png",    // paste ONE idle image URL between the quotes

  eating: [
    'assets/eat1.png',
    'assets/eat2.png',
    'assets/eat3.png'
  ],
  playing: [
    'assets/play1.png',
    'assets/play2.png',
    'assets/play3.png'
  ],
  petting: [
    'assets/pet1.png',
    'assets/pet2.png',
    'assets/pet3.png',
  ],
};
// ============================================================

const state = {
  hunger: 60, happy: 75, energy: 80, focus: 50,
  xp: 45, xpMax: 100, level: 3,
  mood: 'idle', // idle, eating, playing, studying, sleeping, happy
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

// ── Image animation helpers ───────────────────────────────────

const imageAnim = {
  frameInterval: null,  // holds the setInterval reference
  frameIndex: 0,
  fps: 3,               // frames per second — adjust to taste
};

// Returns (or creates) the single overlay <img> element
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
    `;
    document.getElementById('pet').appendChild(img);
  }
  return img;
}

// Call once on page load to show the idle image (hides SVG if URL provided)
function initIdleImage() {
  if (!petImages.idle) return;
  const petEl = document.getElementById('pet');
  petEl.querySelector('svg').style.display = 'none';
  const img = getOverlayImg();
  img.src = petImages.idle;
  img.style.display = 'block';
}

// Play an action's frames in order, then restore idle when done
function showPetImage(action) {
  const urls = petImages[action];
  if (!urls || urls.length === 0) return; // no frames, keep current look

  const img = getOverlayImg();
  img.style.display = 'block'; // make sure overlay is visible
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

// Stop animation and return to idle image (or SVG if no idle URL)
function hidePetImage() {
  clearInterval(imageAnim.frameInterval);
  imageAnim.frameInterval = null;
  const petEl = document.getElementById('pet');

  if (petImages.idle) {
    // Restore idle image
    const img = getOverlayImg();
    img.src = petImages.idle;
  } else {
    // No idle image — fall back to SVG
    petEl.querySelector('svg').style.display = '';
    const img = document.getElementById('pet-img-overlay');
    if (img) img.style.display = 'none';
  }
}

// ── Existing helpers (unchanged) ─────────────────────────────

function setStat(name, val) {
  val = Math.max(0, Math.min(100, val));
  state[name] = val;
  document.getElementById('bar-' + name).style.width = val + '%';
  document.getElementById('val-' + name).textContent = Math.round(val);
}

function showBubble(text, duration = 2200) {
  const b = document.getElementById('bubble');
  b.textContent = text;
  b.classList.add('show');
  setTimeout(() => b.classList.remove('show'), duration);
}

function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function setAnimation(anim) {
  const pet = document.getElementById('pet');
  pet.className = 'pet' + (anim ? ' ' + anim : '');
}

function setEyes(type) {
  document.getElementById('eyes-normal').style.display = type === 'normal' ? '' : 'none';
  document.getElementById('eyes-sleep').style.display  = type === 'sleep'  ? '' : 'none';
  document.getElementById('eyes-happy').style.display  = type === 'happy'  ? '' : 'none';
}

function setMouth(type) {
  document.getElementById('mouth-normal').style.display = type === 'normal' ? '' : 'none';
  document.getElementById('mouth-sad').style.display    = type === 'sad'    ? '' : 'none';
}

function setGlasses(show) {
  document.getElementById('glasses').style.display = show ? '' : 'none';
}

function setScene(night) {
  document.getElementById('scene').classList.toggle('night', night);
}

function spawnHeart() {
  const scene = document.getElementById('scene');
  const h = document.createElement('div');
  h.className = 'heart-particle';
  h.textContent = ['💖','✨','🌸','⭐'][Math.floor(Math.random()*4)];
  h.style.left = (30 + Math.random()*30) + '%';
  h.style.bottom = '80px';
  scene.appendChild(h);
  setTimeout(() => h.remove(), 1000);
}

function addXP(amount) {
  state.xp += amount;
  if (state.xp >= state.xpMax) {
    state.xp -= state.xpMax;
    state.level++;
    document.getElementById('level-badge').textContent = '✦ LVL ' + state.level;
    state.xpMax = Math.round(state.xpMax * 1.3);
    setTimeout(() => {
      showBubble(randomOf(messages.levelup), 3000);
      setAnimation('happy');
      setEyes('happy');
      for (let i = 0; i < 5; i++) setTimeout(spawnHeart, i * 200);
    }, 300);
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
    setEyes('happy');
    setGlasses(false);
    showPetImage('eating');
    showBubble(randomOf(messages.eating), 2000);
    updateStatusTag('🍪 Eating a snack...');
    setStat('hunger', state.hunger + 30);
    setStat('happy',  state.happy  + 10);
    addXP(8);
    setTimeout(endAction, 2200);

  } else if (action === 'play') {
    setAnimation('playing');
    setEyes('happy');
    setGlasses(false);
    setScene(false);
    showPetImage('playing');
    showBubble(randomOf(messages.playing), 2500);
    updateStatusTag('🎾 Playing around!');
    setStat('happy',  state.happy  + 25);
    setStat('energy', state.energy - 15);
    setStat('hunger', state.hunger - 10);
    for (let i = 0; i < 3; i++) setTimeout(spawnHeart, i * 400);
    addXP(12);
    setTimeout(endAction, 2800);

  } else if (action === 'study') {
    setAnimation('studying');
    setEyes('normal');
    setGlasses(true);
    showBubble(randomOf(messages.studying), 3000);
    updateStatusTag('📖 Studying hard...');
    setStat('focus',  state.focus  + 30);
    setStat('energy', state.energy - 10);
    setStat('hunger', state.hunger - 8);
    addXP(20);
    setTimeout(endAction, 3200);

  } else if (action === 'sleep') {
    setAnimation('sleeping');
    setEyes('sleep');
    setGlasses(false);
    setScene(true);
    showBubble(randomOf(messages.sleeping), 3500);
    updateStatusTag('💤 Taking a nap...');
    setStat('energy', state.energy + 40);
    setStat('hunger', state.hunger - 5);
    ['zzz1','zzz2'].forEach((id, i) => {
      const el = document.getElementById(id);
      setTimeout(() => {
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 1800);
      }, i * 700);
    });
    addXP(5);
    setTimeout(() => { setScene(false); endAction(); }, 4000);
  }
}

function endAction() {
  state.isBusy = false;
  setButtonsDisabled(false);
  setGlasses(false);
  hidePetImage(); // restore SVG when action ends

  if (state.happy < 30) {
    setAnimation('');
    setEyes('normal');
    setMouth('sad');
    updateStatusTag('😢 Feeling lonely...');
  } else if (state.energy < 20) {
    setAnimation('');
    setEyes('sleep');
    setMouth('normal');
    updateStatusTag('😴 Really sleepy...');
  } else {
    setAnimation('');
    setEyes('normal');
    setMouth('normal');
    updateStatusTag('● Idle · feeling good');
  }
}

function petTap() {
  if (state.isBusy) return;
  state.tapCount++;
  spawnHeart();
  setStat('happy', state.happy + 5);

  if (state.tapCount % 5 === 0) {
    showPetImage('petting');
    setAnimation('happy');
    setEyes('happy');
    showBubble(randomOf(messages.happy), 2000);
    addXP(3);
    setTimeout(() => {
      hidePetImage();
      setAnimation('');
      setEyes('normal');
    }, 2200);
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

// Show idle image on load (replaces SVG if a URL is provided)
initIdleImage();