// motion.js — efeitos visíveis (skills animate, choreograph, gestures, emil-design-eng)
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 1. título do hero em linhas mascaradas
  const h1 = document.querySelector('.hero-title');
  if (h1) {
    h1.innerHTML = h1.innerHTML
      .split(/<br\s*\/?>/i)
      .map((part, i) => `<span class="line"><span class="line-inner" style="--i:${i}">${part.trim()}</span></span>`)
      .join('');
  }

  // 10. citação palavra por palavra
  const quote = document.querySelector('.quote');
  if (quote) {
    quote.innerHTML = quote.textContent.trim().split(/\s+/)
      .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
  }

  // 4. botões vazados guardam o próprio texto para a varredura dourada
  document.querySelectorAll('.btn:not(.solid)').forEach(b => { b.dataset.label = b.textContent.trim(); });

  // revelações ao entrar na tela (uma vez só)
  // elementos recortados com clip-path têm área visível zero, então observamos o pai deles
  const proxies = new Map(); // alvo observado -> elementos a revelar
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      (proxies.get(e.target) || [e.target]).forEach(el => el.classList.add('is-in'));
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

  const watch = (selector, cls, each, viaParent) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add(cls);
      if (each) each(el, i);
      const target = viaParent ? el.parentElement : el;
      if (viaParent) proxies.set(target, [...(proxies.get(target) || []), el]);
      io.observe(target);
    });
  };

  watch('.section-title', 'title-reveal');
  watch('.frame', 'frame-reveal', el => {
    if (el.closest('#hero')) el.style.transitionDelay = '.2s';
  }, true);
  if (quote) { quote.classList.add('quote-reveal'); io.observe(quote); }

  // 7. ícones desenhados, em cascata dentro de cada grade
  document.querySelectorAll('.digital-grid, .feat-row').forEach(grid => {
    grid.querySelectorAll('svg.glyph').forEach((g, i) => {
      g.classList.add('glyph-draw');
      g.style.transitionDelay = `${i * 80}ms, 0ms`; // atraso só no desenho, não no hover
      io.observe(g);
    });
  });

  // 6. trilho lateral acompanha a rolagem (transform direto no elemento, sem variável CSS)
  const rail = document.getElementById('rail');
  if (rail) {
    const fill = document.createElement('div');
    fill.className = 'stem-fill';
    rail.prepend(fill);
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = `scaleY(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  if (!fine) return; // o resto depende de mouse

  // brilho que segue o cursor
  const addSpot = host => {
    const spot = document.createElement('span');
    spot.className = 'spot';
    spot.setAttribute('aria-hidden', 'true');
    host.appendChild(spot);
    host.addEventListener('pointermove', e => {
      const r = host.getBoundingClientRect();
      spot.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
    });
  };
  document.querySelectorAll('.dcard, #hero .frame').forEach(addSpot);

  if (reduce) return;

  // retrato do hero inclina com mola (decorativo, página de apresentação)
  const tilt = el => {
    const MAX = 6, K = 170, D = 20; // rigidez e amortecimento ≈ mola de 0.5s com pouco quique
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, last = 0;
    const step = t => {
      const dt = last ? Math.min(0.032, (t - last) / 1000) : 1 / 60;
      last = t;
      vx += (K * (tx - x) - D * vx) * dt;
      vy += (K * (ty - y) - D * vy) * dt;
      x += vx * dt; y += vy * dt;
      el.style.transform = `perspective(900px) rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) < 0.01) {
        raf = 0; last = 0;
        if (!tx && !ty) el.style.transform = '';
        return;
      }
      raf = requestAnimationFrame(step);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAX;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 2 * MAX;
      kick();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  };
  document.querySelectorAll('#hero .frame').forEach(tilt);
})();
