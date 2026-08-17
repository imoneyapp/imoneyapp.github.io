/* Spinning the pearl.
   Shared by / and /zh/ — the two pages were about to hold two copies of
   this, which is how they drift.

   The old version leaned the ball 26° toward your cursor and sprang back.
   That reads as a hover state, not an object: there was nowhere to GO. This
   one has no cap. Drag and the mark travels around the sphere, over the
   limb, out of sight behind it, and back around the other side — "a ball has
   countless corners", actually built. Let go and it coasts.

   One state machine, not two. Hover and homing both write to the same
   TARGET and a single easing step chases it; the earlier attempt had hover
   setting the angle directly while homing eased it, and the two overwrote
   each other every frame. */
(() => {
  const orb = document.getElementById('orb');
  if (!orb) return;

  // A real pearl photo carries its own lighting. Tell the CSS the moment one
  // is actually there, so the painted highlight — which is most of what
  // makes a gradient ball look rendered — takes itself off.
  const probe = new Image();
  probe.onload = () => orb.classList.add('has-photo');
  probe.src = '/assets/pearl.png';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ry = 0, rx = 0;        // where the engraving is now, degrees
  let ty = 0, tx = 0;        // where it wants to rest
  let hy = 0, hx = 0;        // the hover lean, added to the rest position
  let vy = 0, vx = 0;        // coast, degrees per frame
  let dragging = false, px = 0, py = 0;

  const apply = () => {
    orb.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    orb.style.setProperty('--rx', rx.toFixed(2) + 'deg');
  };

  orb.classList.add('free');   // turning is continuous; it can't run on a transition

  orb.addEventListener('pointerdown', e => {
    dragging = true;
    px = e.clientX; py = e.clientY;
    vy = vx = 0;
    orb.setPointerCapture(e.pointerId);
    orb.classList.add('grabbing');
    e.preventDefault();
  });

  addEventListener('pointermove', e => {
    const r = orb.getBoundingClientRect();
    if (!r.width) return;

    if (dragging) {
      // 180° per ball-width dragged: sweep across the pearl and you've
      // turned it half a revolution, so the far side is one gesture away
      // rather than four.
      const k = 180 / r.width;
      const dy = (e.clientX - px) * k;
      const dx = -(e.clientY - py) * k;
      ry += dy; rx += dx;
      // Capped so a hard flick coasts about half a turn instead of
      // spinning like a slot machine. At .93 decay a 12°/frame throw
      // travels ~170° before it dies.
      vy = Math.max(-12, Math.min(12, dy));
      vx = Math.max(-12, Math.min(12, dx));
      px = e.clientX; py = e.clientY;
      apply();
      return;
    }

    // Not dragging: the cursor only leans the RESTING position, so it can't
    // fight the coast or the homing. Off the ball it eases back to square.
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let x = (e.clientX - cx) / (r.width * 1.5);
    let y = (e.clientY - cy) / (r.height * 1.5);
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    hy = x * 22; hx = -y * 22;
  });

  const release = e => {
    if (!dragging) return;
    dragging = false;
    orb.classList.remove('grabbing');
    // Rest at the nearest whole turn, not at zero — a ball spun three times
    // shouldn't rewind three times to show you the same face.
    ty = Math.round(ry / 360) * 360;
    tx = 0;
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  const tick = () => {
    if (!dragging) {
      if (Math.abs(vy) > 0.05 || Math.abs(vx) > 0.05) {
        ry += vy; rx += vx;
        vy *= 0.93; vx *= 0.93;
        ty = Math.round(ry / 360) * 360;   // land on whichever turn it ends on
        apply();
      } else {
        const gy = (ty + hy - ry) * 0.07, gx = (tx + hx - rx) * 0.07;
        if (Math.abs(gy) > 0.005 || Math.abs(gx) > 0.005) { ry += gy; rx += gx; apply(); }
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
