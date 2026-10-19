const app = document.querySelector('#app');

const quizData = [
  { question: '现在最想要什么？', options: ['抱抱', '听我说话', '静静陪着', '吃点好吃的'] },
  { question: '现在的情绪是？', options: ['委屈', '难过', '疲惫', '生气'] },
  { question: '希望我怎么哄你？', options: ['讲笑话', '说情话', '发红包', '视频陪聊'] },
];

const careData = [
  { question: '今天过得还好吗？', options: ['很好', '一般', '有点累', '想休息'] },
  { question: '今晚想让我陪你做什么？', options: ['聊天', '一起放松', '陪我一会儿', '发个红包'] },
  { question: '你最想听我说什么？', options: ['我爱你', '你最棒', '我会一直在', '陪你度过难关'] },
];

const stations = [
  { title: '心情补给站', symbol: '♡' },
  { title: '星邮局', symbol: '✉' },
  { title: '流星许愿池', symbol: '✧' },
  { title: '名字星球', symbol: '☆' },
  { title: '告白电台', symbol: '♫' },
  { title: '回忆相册', symbol: '▧' },
  { title: '抱抱小屋', symbol: '♥' },
  { title: '快乐星球', symbol: '☼' },
  { title: '心事树洞', symbol: '♡' },
  { title: '爱意终点站', symbol: '∞' },
];

const loveLines = ['我喜欢你', '即使现在你很难受', '我也会哄哄你', '我一直都在'];
const blessings = ['天天开心', '被爱包围', '你最棒了', '早点睡', '甜甜哒', '好运连连', '笑口常开', '我爱你'];
const sceneIds = ['cover', 'quiz', 'envelope', 'stars', 'name', 'words', 'photos', 'comfort', 'blessings', 'care', 'final'];
const stationSpacing = 690;
const state = {
  scene: 0,
  loveLine: 0,
  worldX: 0,
  avatarY: 0,
  velocityY: 0,
  nextPortal: 1,
  keys: new Set(),
  gameActive: false,
  frameId: null,
  sendingNote: false,
  jumpTimer: null,
  uploadedPhotos: [],
  notice: '',
  lastFrame: 0,
};

const goBackButton = `<button class="button button-secondary resume-button" type="button" id="resume-game">回到星轨继续 <span aria-hidden="true">→</span></button>`;

function makeQuestionForm(data, formId, submitText, withExtra = false) {
  return `<form id="${formId}" class="question-list">
    ${data.map((item, index) => `<fieldset class="question-card">
      <legend><span class="question-number">0${index + 1}</span>${item.question}</legend>
      <div class="choice-grid">${item.options.map((option) => `<label class="choice">
        <input type="radio" name="q${index}" value="${option}" required>
        <span>${option}</span>
      </label>`).join('')}</div>
    </fieldset>`).join('')}
    ${withExtra ? `<fieldset class="question-card">
      <legend><span class="question-number">04</span>还有什么想对我说？</legend>
      <textarea name="extra" maxlength="300" rows="2" placeholder="可以写下来，也可以留给我们见面时说…"></textarea>
    </fieldset>` : ''}
    <p class="privacy-note">答案只保存在这台设备的浏览器里，不会自动发送给任何人。</p>
    <button class="button" type="submit">${submitText} <span aria-hidden="true">♡</span></button>
  </form>`;
}

function storyContent() {
  switch (state.scene) {
    case 0:
      return `<section class="story-card cover-card">
        <span class="eyebrow">给卿美静的一场星际小冒险</span>
        <div class="cover-heart" aria-hidden="true">♥</div>
        <h1>沿着星轨，<br><span>去见你的心动</span></h1>
        <p>横过手机，操控小小数码女孩，沿着流星之路拜访每一座星球。</p>
        <button class="button start-button" type="button" id="start-game">开始横屏冒险 <span aria-hidden="true">✦</span></button>
        <small class="orientation-note">建议横屏游玩 · 方向键移动 · ↑ 跳跃</small>
        <div class="portrait-hint"><span>↻</span>建议先将手机横屏</div>
      </section>`;
    case 1:
      return `<section class="story-card">
        <div class="section-kicker">星球 01 / 心情补给站</div>
        <h2>此刻的你，需要什么？</h2>
        <p>选一选吧，我想更懂你一点。</p>
        ${makeQuestionForm(quizData, 'quiz-form', '把心情收进信里', true)}
      </section>`;
    case 2:
      return `<section class="story-card envelope-card">
        <div class="section-kicker">星球 02 / 星邮局</div>
        <div class="envelope-art" aria-hidden="true"><span>♥</span></div>
        <h2>一封写给你的信</h2>
        <p>你的心情好好收下了。星邮局没有替你发送任何信息，这份答案只留在你的手机里。</p>
        ${goBackButton}
      </section>`;
    case 3:
      return `<section class="story-card star-card">
        <div class="section-kicker">星球 03 / 流星许愿池</div>
        <div class="constellation" aria-hidden="true"><span>✦</span><span>·</span><span>✧</span><span>·</span><span>✦</span><span>·</span><span>✧</span></div>
        <h2>今晚的星星，都在听你说话</h2>
        <p>慢一点也没关系，我会陪你把心情整理好。</p>
        ${goBackButton}
      </section>`;
    case 4:
      return `<section class="story-card name-card">
        <div class="section-kicker">星球 04 / 名字星球</div>
        <div class="name-reveal">卿美静</div>
        <p>你是我心里，最特别的那颗星。</p>
        ${goBackButton}
      </section>`;
    case 5:
      return `<section class="story-card words-card">
        <div class="section-kicker">星球 05 / 告白电台</div>
        <div class="love-word" id="love-word">${loveLines[state.loveLine]}</div>
        <p class="word-progress" id="word-progress">0${state.loveLine + 1} / 04</p>
        <div class="story-actions">
          <button class="button button-secondary" id="next-word" type="button">下一句 <span aria-hidden="true">→</span></button>
          ${goBackButton}
        </div>
      </section>`;
    case 6:
      return `<section class="story-card photos-card">
        <div class="section-kicker">星球 06 / 回忆相册</div>
        <h2>每个有你的瞬间，都值得珍藏</h2>
        <p>选几张喜欢的照片，在星轨边一起看看。照片仅在当前页面预览，不会上传。</p>
        <label class="button button-secondary upload-button">从手机选择照片
          <input id="photo-upload" type="file" accept="image/*" multiple hidden>
        </label>
        <div class="photo-grid" id="photo-grid">
          ${state.uploadedPhotos.length ? state.uploadedPhotos.map((url, index) => `<div class="photo-card"><img src="${url}" alt="选择的回忆照片 ${index + 1}"></div>`).join('') : ['花与春天', '一起看月亮', '闪闪发光', '温柔日常'].map((caption, index) => `<div class="photo-card placeholder photo-${index + 1}"><span aria-hidden="true">${['✿', '☾', '✧', '♡'][index]}</span><small>${caption}</small></div>`).join('')}
        </div>
        ${goBackButton}
      </section>`;
    case 7:
      return `<section class="story-card comfort-card">
        <div class="section-kicker">星球 07 / 抱抱小屋</div>
        <div class="pixel-character" aria-hidden="true"><span class="pixel-head">☺</span><span class="pixel-body">♡</span><span class="pixel-heart heart-a">♥</span><span class="pixel-heart heart-b">♥</span></div>
        <h2>我来哄你啦～</h2>
        <p>给你一个大大的抱抱，今天辛苦啦。</p>
        ${goBackButton}
      </section>`;
    case 8:
      return `<section class="story-card blessing-card">
        <div class="section-kicker">星球 08 / 快乐星球</div>
        <h2 class="blessing-title">乖乖要天天开心！</h2>
        <div class="blessing-cloud">${blessings.map((word, index) => `<span class="blessing-tag tag-${index + 1}">${word}</span>`).join('')}</div>
        ${goBackButton}
      </section>`;
    case 9:
      return `<section class="story-card">
        <div class="section-kicker">星球 09 / 心事树洞</div>
        <h2>今天的你，还好吗？</h2>
        <p>认真选也好，随心选也好，我都会好好听。</p>
        ${makeQuestionForm(careData, 'care-form', '把心意收好')}
      </section>`;
    case 10:
      return `<section class="story-card final-card">
        <div class="final-heart" aria-hidden="true">♥</div>
        <div class="section-kicker">星球 10 / 爱意终点站</div>
        <h2>卿美静，<br><span>我爱你。</span></h2>
        <p>这段星际旅程的最后，留一段话给我吧。</p>
        <form class="love-note-form" id="love-note-form">
          <label for="love-note">写下你想对我说的话</label>
          <textarea id="love-note" name="message" maxlength="1000" rows="3" required placeholder="你的心情、想说的话，或一个小小的愿望……">${getSavedDraft()}</textarea>
          <div class="note-footer"><small>留言会先保存在你的手机；配置微信通知后，才会发送给我。</small><span id="note-count">0 / 1000</span></div>
          <button class="button send-note-button" type="submit" ${state.sendingNote ? 'disabled' : ''}>${state.sendingNote ? '正在发送…' : '把这段话发给我'} <span aria-hidden="true">♡</span></button>
          <p class="send-status" id="send-status" role="status" aria-live="polite"></p>
        </form>
        <button class="button button-secondary" id="restart" type="button">再玩一次</button>
      </section>`;
    default:
      return '';
  }
}

function gameMarkup() {
  const portals = stations.map((station, index) => `<div class="portal" data-portal="${index + 1}" style="left:${(index + 1) * stationSpacing}px">
    <span class="portal-orbit"></span>
    <span class="portal-door"><b>${station.symbol}</b></span>
    <span class="portal-label">${station.title}</span>
    <span class="portal-number">${String(index + 1).padStart(2, '0')}</span>
  </div>`).join('');
  const obstacles = stations.flatMap((_, index) => {
    const segmentStart = index * stationSpacing;
    const firstHeight = 34 + (index % 3) * 7;
    const secondHeight = 41 + ((index + 1) % 3) * 7;
    return [
      `<div class="track-obstacle obstacle-crystal" data-obstacle style="left:${segmentStart + 225}px;--obstacle-height:${firstHeight}px"><span>✦</span></div>`,
      `<div class="track-obstacle obstacle-comet" data-obstacle style="left:${segmentStart + 465}px;--obstacle-height:${secondHeight}px"><span>♥</span></div>`,
    ];
  }).join('');
  const stars = Array.from({ length: 44 }, (_, index) => {
    const left = (index * 83 + 19) % 100;
    const top = (index * 47 + 13) % 66;
    const size = index % 9 === 0 ? 3 : 2;
    return `<i class="sky-star" style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;animation-delay:${(index % 8) * -.37}s"></i>`;
  }).join('');
  return `<div class="game-world">
    <div class="sky">${stars}
      <div class="moon">☾</div>
      <div class="meteor meteor-a"></div><div class="meteor meteor-b"></div><div class="meteor meteor-c"></div>
      <div class="planet planet-a">✦</div><div class="planet planet-b">✧</div>
    </div>
    <div class="world-camera" id="world-camera">
      <div class="world-content">
        <div class="star-road"></div>
        <div class="road-glow"></div>
        ${obstacles}
        ${portals}
        <div class="world-finish">一路有你，刚刚好 ♡</div>
      </div>
    </div>
    <div class="player-anchor" id="player-anchor">
      <div class="girl-runner" id="girl-runner" role="img" aria-label="正在星轨奔跑的数码女孩">
        <span class="girl-hair"></span><span class="girl-face"><i></i><b></b></span>
        <span class="girl-body"></span><span class="girl-arm"></span><span class="girl-leg"></span>
        <span class="runner-spark">✦</span>
      </div>
    </div>
    <div class="hud">
      <div class="hud-brand"><span>✦</span> 星轨小冒险</div>
      <div class="hud-location" id="hud-location">出发点</div>
      <div class="hud-count"><span id="hud-count">0</span> / 10 颗星球</div>
      <div class="hud-notice" id="hud-notice" role="status">${state.notice}</div>
    </div>
    <div class="game-controls" aria-label="游戏控制">
      <div class="direction-pad">
        <button class="control-button direction-button" type="button" data-direction="-1" aria-label="向左移动">←</button>
        <button class="control-button direction-button" type="button" data-direction="1" aria-label="向右移动">→</button>
      </div>
      <button class="control-button jump-control" type="button" id="jump" aria-label="跳跃">跳 跃 <span>↑</span></button>
      <div class="keyboard-hint">← → 移动&nbsp; · &nbsp;空格跳跃</div>
    </div>
    <div class="portrait-message"><div><span>↻</span><h2>把手机横过来</h2><p>准备好沿着流星星轨出发了吗？</p></div></div>
    <div class="world-vignette"></div>
  </div>`;
}

function render() {
  app.innerHTML = `${gameMarkup()}
    <div class="story-overlay ${state.scene >= 0 ? 'is-open' : ''} ${state.scene === 10 ? 'is-final' : ''}" id="story-overlay">
      <div class="story-backdrop"></div>
      <div class="story-window scene-${state.scene}" role="dialog" aria-modal="true" aria-label="星球内容">
        <button class="close-story" id="close-story" type="button" aria-label="关闭并返回星轨">×</button>
        ${storyContent()}
      </div>
    </div>
    ${state.scene < 0 ? `<div class="orientation-cover"><span>⟳</span><strong>横屏冒险中</strong><small>把手机竖起来继续游玩</small></div>` : ''}`;
  bindControls();
  updateGameDisplay();
  updateNoteCounter();
}

function showScene(scene, notice = '') {
  state.scene = scene;
  state.notice = notice;
  state.gameActive = false;
  state.keys.clear();
  render();
}

function resumeGame() {
  state.scene = -1;
  state.notice = '';
  state.gameActive = true;
  state.keys.clear();
  render();
  ensureGameLoop();
}

function saveAnswer(key, answer) {
  try {
    localStorage.setItem(key, JSON.stringify(answer));
    return true;
  } catch (error) {
    console.error('Could not save answers in this browser.', error);
    return false;
  }
}

function bindControls() {
  document.getElementById('start-game')?.addEventListener('click', startGame);
  document.getElementById('resume-game')?.addEventListener('click', resumeGame);
  document.getElementById('close-story')?.addEventListener('click', resumeGame);

  const quiz = document.getElementById('quiz-form');
  quiz?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(quiz);
    const answer = {
      submittedAt: new Date().toISOString(),
      answers: quizData.map((item, index) => ({ question: item.question, answer: String(formData.get(`q${index}`) || '') })),
      extra: String(formData.get('extra') || '').trim(),
    };
    resumeGameWithNotice(saveAnswer('qingmeijing-quiz', answer) ? '' : '浏览器没有允许本地保存，这份答案不会在刷新后保留。');
  });

  const care = document.getElementById('care-form');
  care?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(care);
    const answer = {
      submittedAt: new Date().toISOString(),
      answers: careData.map((item, index) => ({ question: item.question, answer: String(formData.get(`q${index}`) || '') })),
    };
    resumeGameWithNotice(saveAnswer('qingmeijing-care', answer) ? '' : '浏览器没有允许本地保存，这份答案不会在刷新后保留。');
  });

  document.getElementById('close-story')?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') resumeGame();
  });
  document.getElementById('next-word')?.addEventListener('click', () => {
    state.loveLine = (state.loveLine + 1) % loveLines.length;
    const word = document.getElementById('love-word');
    word.textContent = loveLines[state.loveLine];
    document.getElementById('word-progress').textContent = `0${state.loveLine + 1} / 04`;
    word.classList.remove('word-pop');
    void word.offsetWidth;
    word.classList.add('word-pop');
  });
  document.getElementById('photo-upload')?.addEventListener('change', handlePhotoUpload);
  document.getElementById('restart')?.addEventListener('click', restartGame);
  const noteForm = document.getElementById('love-note-form');
  noteForm?.addEventListener('input', updateNoteCounter);
  noteForm?.addEventListener('submit', sendLoveNote);

  document.querySelectorAll('[data-direction]').forEach((button) => {
    const direction = Number(button.dataset.direction);
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      state.keys.add(direction);
      button.setPointerCapture(event.pointerId);
    });
    const stop = () => state.keys.delete(direction);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('lostpointercapture', stop);
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  });

  const jumpButton = document.getElementById('jump');
  jumpButton?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    jump();
  });
  jumpButton?.addEventListener('contextmenu', (event) => event.preventDefault());
}

function resumeGameWithNotice(notice) {
  state.notice = notice;
  state.scene = -1;
  state.gameActive = true;
  state.keys.clear();
  render();
  ensureGameLoop();
}

async function startGame() {
  if (screen.orientation?.lock) {
    try {
      await document.documentElement.requestFullscreen();
      await screen.orientation.lock('landscape');
    } catch {
      // Fullscreen and orientation lock are browser-dependent; the rotate prompt is the fallback.
    }
  }
  state.worldX = 0;
  state.avatarY = 0;
  state.velocityY = 0;
  state.nextPortal = 1;
  state.gameActive = true;
  state.scene = -1;
  render();
  ensureGameLoop();
}

function restartGame() {
  state.worldX = 0;
  state.avatarY = 0;
  state.velocityY = 0;
  state.nextPortal = 1;
  state.loveLine = 0;
  state.notice = '';
  state.sendingNote = false;
  showScene(0);
}

function jump() {
  if (!state.gameActive || state.avatarY !== 0) return;
  state.velocityY = 560;
  const runner = document.getElementById('girl-runner');
  runner?.classList.add('jumping');
}

function gameLoop(timestamp) {
  state.frameId = null;
  const delta = Math.min((timestamp - (state.lastFrame || timestamp)) / 1000, 0.04);
  state.lastFrame = timestamp;
  if (state.gameActive) {
    const direction = Number(state.keys.has(1)) - Number(state.keys.has(-1));
    const previousX = state.worldX;
    let nextX = Math.max(0, state.worldX + direction * 310 * delta);
    if (direction > 0) {
      const obstacle = Array.from(document.querySelectorAll('[data-obstacle]')).find((element) => {
        const obstacleX = Number.parseFloat(element.style.left);
        const clearance = Number.parseFloat(element.style.getPropertyValue('--obstacle-height')) + 8;
        return state.avatarY < clearance && previousX <= obstacleX + 38 && nextX + 25 >= obstacleX && nextX <= obstacleX + 38;
      });
      if (obstacle) {
        nextX = Math.min(nextX, Number.parseFloat(obstacle.style.left) - 26);
        const hudNotice = document.getElementById('hud-notice');
        if (hudNotice && !hudNotice.textContent) hudNotice.textContent = '前面有星星障碍，跳起来越过去！';
      } else {
        const hudNotice = document.getElementById('hud-notice');
        if (hudNotice?.textContent) hudNotice.textContent = '';
      }
    }
    state.worldX = nextX;
    if (state.avatarY > 0 || state.velocityY > 0) {
      state.avatarY = Math.max(0, state.avatarY + state.velocityY * delta);
      state.velocityY -= 1450 * delta;
      if (state.avatarY === 0) {
        state.velocityY = 0;
        document.getElementById('girl-runner')?.classList.remove('jumping');
      }
    }
    const portalDistance = state.worldX - state.nextPortal * stationSpacing;
    if (state.nextPortal <= stations.length && portalDistance >= -18 && portalDistance <= 20) {
      state.worldX = state.nextPortal * stationSpacing;
      state.nextPortal += 1;
      showScene(state.nextPortal - 1);
    }
    updateGameDisplay();
  }
  if (state.gameActive) state.frameId = requestAnimationFrame(gameLoop);
}

function ensureGameLoop() {
  if (state.gameActive && state.frameId === null) state.frameId = requestAnimationFrame(gameLoop);
}

function updateGameDisplay() {
  const camera = document.getElementById('world-camera');
  const worldWidth = stationSpacing * stations.length + 900;
  const cameraX = Math.max(0, Math.min(state.worldX - window.innerWidth * .34, worldWidth - window.innerWidth));
  if (camera) camera.style.transform = `translate3d(${-cameraX}px, 0, 0)`;
  const runner = document.getElementById('girl-runner');
  if (runner) runner.style.transform = `translateY(${-state.avatarY}px)`;
  const nextStation = Math.min(stations.length, state.nextPortal);
  const location = document.getElementById('hud-location');
  const count = document.getElementById('hud-count');
  if (location) location.textContent = state.worldX === 0 ? '出发点' : `前往：${stations[nextStation - 1].title}`;
  if (count) count.textContent = String(Math.min(stations.length, state.nextPortal - 1));
}

function getSavedDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem('qingmeijing-love-note-draft') || '""');
    return typeof draft === 'string' ? draft : '';
  } catch (error) {
    console.error('Could not load the saved love note.', error);
    return '';
  }
}

function updateNoteCounter() {
  const textarea = document.getElementById('love-note');
  const counter = document.getElementById('note-count');
  if (textarea && counter) counter.textContent = `${textarea.value.length} / 1000`;
}

async function sendLoveNote(event) {
  event.preventDefault();
  if (state.sendingNote) return;

  const form = event.currentTarget;
  const textarea = form.elements.namedItem('message');
  const status = document.getElementById('send-status');
  const message = textarea.value.trim();
  if (!message) {
    textarea.setCustomValidity('写几句话再发送吧。');
    textarea.reportValidity();
    return;
  }
  textarea.setCustomValidity('');
  const saved = saveAnswer('qingmeijing-love-note', {
    submittedAt: new Date().toISOString(),
    message,
  });
  if (!saved) {
    status.textContent = '这台手机没有允许保存留言，请复制保存后再试。';
    return;
  }
  saveAnswer('qingmeijing-love-note-draft', message);

  const notifyUrl = import.meta.env.VITE_WECHAT_NOTIFY_URL;
  if (!notifyUrl) {
    status.textContent = '留言已保存在这台手机里，但微信通知还未配置。完成部署说明中的 PushPlus 配置后，才能发送到微信。';
    return;
  }

  state.sendingNote = true;
  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = '正在发送…';
  status.textContent = '正在把留言发送到微信…';
  try {
    const response = await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) {
      throw new Error(result.error || `通知服务返回 HTTP ${response.status}`);
    }
    status.textContent = '发送成功！你的留言已经发到微信。';
    submitButton.textContent = '已发送 ♡';
  } catch (error) {
    console.error('Could not send the love note to WeChat.', error);
    status.textContent = '没有发送成功；留言已保存在这台手机里。请检查网络或通知服务配置后重试。';
    submitButton.disabled = false;
    submitButton.innerHTML = '重试发送 <span aria-hidden="true">♡</span>';
  } finally {
    state.sendingNote = false;
  }
}

function handlePhotoUpload(event) {
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/')).slice(0, 5);
  state.uploadedPhotos.forEach((url) => URL.revokeObjectURL(url));
  state.uploadedPhotos = files.map((file) => URL.createObjectURL(file));
  render();
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && state.gameActive) {
    event.preventDefault();
    jump();
  }
  if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    event.preventDefault();
    state.keys.add(1);
  }
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    event.preventDefault();
    state.keys.add(-1);
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowRight' || event.code === 'KeyD') state.keys.delete(1);
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') state.keys.delete(-1);
});

window.addEventListener('blur', () => state.keys.clear());
window.addEventListener('resize', updateGameDisplay);
window.addEventListener('beforeunload', () => {
  state.uploadedPhotos.forEach((url) => URL.revokeObjectURL(url));
});

render();
