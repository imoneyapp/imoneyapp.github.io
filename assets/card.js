/* Pointer-driven tilt, shared by the landing pages. Skips .turning (the
   post-claim card runs its own continuous spin) and touch devices, where
   there's no hover to respond to.
   No tap-to-turn: turning is what the card does once the name is actually
   secured, and spending that move here cheapens it. */
(() => {
  const cards = document.querySelectorAll('.card:not(.turning)');
  if (!cards.length) return;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  cards.forEach(card => {
    if (fine) {
      card.addEventListener('pointermove', e => {
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

  });
})();
