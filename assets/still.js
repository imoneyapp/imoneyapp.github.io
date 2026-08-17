/* The still.
   Click the iMoney mark and the page gives way to one image — no chrome, no
   caption, nothing to do but look at it. Click or Esc and it's gone.

   Wired only if assets/still.jpg actually loads. A brand moment that opens
   onto a broken image icon is worse than no brand moment, and this way the
   header stays inert until the file is really there. */
(() => {
  const brand = document.getElementById('brand');
  if (!brand) return;

  const probe = new Image();
  probe.src = '/assets/still.jpg';
  probe.onload = () => {
    brand.classList.add('live');

    const veil = document.createElement('div');
    veil.className = 'still';
    veil.setAttribute('aria-hidden', 'true');
    veil.appendChild(probe);          // already decoded, so it opens instantly
    document.body.appendChild(veil);

    let open = false;
    const show = () => {
      open = true;
      veil.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const hide = () => {
      open = false;
      veil.classList.remove('open');
      document.body.style.overflow = '';
    };

    brand.addEventListener('click', e => { e.preventDefault(); show(); });
    veil.addEventListener('click', hide);
    addEventListener('keydown', e => { if (open && e.key === 'Escape') hide(); });
  };
})();
