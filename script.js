const track = document.querySelector('.ticker__track');
track.appendChild(track.firstElementChild.cloneNode(true));


(function () {
  const root = document.querySelector('.participants');
  if (!root) return;

  const list = root.querySelector('.participants__list');
  const cards = Array.from(list.children);
  const prevBtn = root.querySelector('.participants__btn--prev');
  const nextBtn = root.querySelector('.participants__btn--next');
  const counterEl = root.querySelector('.participants__counter');

  const total = cards.length;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  function getStep() {
    const firstCard = cards[0];
    if (!firstCard) return 0;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const cs = getComputedStyle(list);

    const gapStr = cs.gap || cs.columnGap || '0px';
    const gap = parseFloat(gapStr) || 0;
    return cardWidth + gap;
  }

  function getIndex() {
    const step = getStep() || 1;
    const i = Math.round(list.scrollLeft / step) + 1;
    return Math.min(Math.max(i, 1), total);
  }

  function setIndex(i) {
    i = Math.min(Math.max(i, 1), total);
    const step = getStep();
    const left = step * (i - 1);
    list.scrollTo({ left, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function updateUI() {
    const i = getIndex();

    counterEl.textContent = `${i} / ${total}`;
    prevBtn.disabled = (i === 1);
    nextBtn.disabled = (i === total);
  }

  function next() { setIndex(getIndex() + 1); }
  function prev() { setIndex(getIndex() - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  const header = root.querySelector('.participants__header');
  header.setAttribute('tabindex', '0');

  let rafId = null;
  list.addEventListener('scroll', () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateUI);
  });


  window.addEventListener('resize', () => {
    setIndex(getIndex());
    updateUI();
  });

  list.setAttribute('role', 'list');
  cards.forEach((li, idx) => {
    li.setAttribute('role', 'listitem');
    li.setAttribute('aria-label', `Участник ${idx + 1} из ${total}`);
  });

  updateUI();
})();

(function () {
  const mq = window.matchMedia('(max-width: 768px)');
  const root = document.querySelector('.stages');
  const track = root?.querySelector('.stages__list');
  if (!root || !track) return;

  let index = 0;
  let count = track.children.length;
  let width = root.clientWidth;

  // создаём точки
  const dots = document.createElement('div');
  dots.className = 'stages__dots';
  for (let i = 0; i < count; i++) {
    const b = document.createElement('button');
    b.className = 'stages__dot';
    b.type = 'button';
    b.setAttribute('aria-label', `Слайд ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dots.appendChild(b);
  }
  track.after(dots);

  function updateDots() {
    [...dots.children].forEach((d, i) =>
      d.setAttribute('aria-current', i === index ? 'true' : 'false')
    );
  }
  function go(i, {immediate = false} = {}) {
    index = Math.max(0, Math.min(i, count - 1));
    track.style.transition = immediate ? 'none' : 'transform .35s ease';
    track.style.transform = `translateX(${-index * 100}%)`;
    updateDots();
  }

  // свайпы
  let startX = 0, dx = 0, isDrag = false;
  const THRESHOLD = 50;

  function onStart(e) {
    if (!mq.matches) return;
    isDrag = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    dx = 0;
    track.style.transition = 'none';
  }
  function onMove(e) {
    if (!isDrag) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    dx = x - startX;
    const base = -index * width + dx;
    track.style.transform = `translateX(${base * 100 / width}%)`;
  }
  function onEnd() {
    if (!isDrag) return;
    isDrag = false;
    if (Math.abs(dx) > THRESHOLD) {
      go(index + (dx < 0 ? 1 : -1));
    } else {
      go(index); // вернуть на место
    }
  }

  // события
  track.addEventListener('touchstart', onStart, {passive: true});
  track.addEventListener('touchmove',  onMove,  {passive: true});
  track.addEventListener('touchend',   onEnd);
  track.addEventListener('mousedown',  onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup',   onEnd);

  // ресайз (важно при повороте экрана)
  window.addEventListener('resize', () => { width = root.clientWidth; go(index, {immediate:true}); });

  // включаем только на мобильном брейкпоинте
  function toggleByMQ(e) {
    if (e.matches) {
      width = root.clientWidth;
      go(index = 0, {immediate:true});
      dots.style.display = 'flex';
    } else {
      track.style.transform = '';
      track.style.transition = '';
      dots.style.display = 'none';
    }
  }
  mq.addEventListener('change', toggleByMQ);
  toggleByMQ(mq); // первичная инициализация
})();