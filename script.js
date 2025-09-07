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
