/* Pointer-driven tilt + tap-to-turn, shared by the landing pages.
   Skips .turning (the post-claim card runs its own continuous spin) and
   anything on a touch device, where there's no hover to respond to. */
(() => {
  const cards = document.querySelectorAll('.card:not(.turning)');
  if (!cards.length) return;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  cards.forEach(card => {
    if (fine) {
      card.addEventListener('pointermove', e => {
        if (card.classList.contains('flipping')) return;
        const r = card.getBoundingClientRect();
        // −1…1 from the centre, so each corner leans its own way.
        const x = (e.clientX - r.left) / r.width  * 2 - 1;
        const y = (e.clientY - r.top)  / r.height * 2 - 1;
        card.classList.add('tilting');
        card.style.transform =
          `rotateY(${x * 13}deg) rotateX(${-y * 9}deg) scale(1.03)`;
      });

      card.addEventListener('pointerleave', () => {
        card.classList.remove('tilting');   // restores the settle transition
        card.style.transform = '';
      });
    }

    // Tap anywhere on it for one full turn, landing back on the front.
    card.addEventListener('click', () => {
      if (card.classList.contains('flipping')) return;
      card.classList.remove('tilting');
      card.style.transform = '';
      card.classList.add('flipping');
      card.addEventListener('animationend',
        () => card.classList.remove('flipping'), { once: true });
    });
    card.style.cursor = 'pointer';
  });
})();
