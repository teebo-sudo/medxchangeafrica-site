/* ==========================================================================
   MedXchange Africa — front-end runtime
   Ported from the Claude Design handoff (DCLogic component) into a plain,
   dependency-free script. Behaviour is faithful to the original mockup:
   globe, scroll-reactive nav, reveal-on-scroll, counters, magnetic buttons,
   marquee, ECG pulse — plus a style-hover shim (replacing the design runtime)
   and an added mobile menu. All motion respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";
  var mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  var REDUCE = mql.matches;          // freeze globe / disable scroll motion
  var REDUCE_ALL = mql.matches;      // disable reveals/counters animation
  var FINE = window.matchMedia("(pointer:fine)").matches;

  // react if the user changes their motion preference mid-session (pause/resume marquee)
  if (mql.addEventListener) {
    mql.addEventListener("change", function (e) {
      document.querySelectorAll("[data-marquee]").forEach(function (m) {
        m.style.animationPlayState = e.matches ? "paused" : "running";
      });
    });
  }

  /* ---- language switcher: mark the current language for assistive tech ---- */
  function setupLangSwitch() {
    var cur = (document.documentElement.lang || "en").slice(0, 2);
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      if (el.getAttribute("data-lang") === cur) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---- style-hover shim (the design runtime applied these) ---- */
  function initHover() {
    if (!window.matchMedia("(hover:hover)").matches) return; // skip on touch — avoids sticky hover
    document.querySelectorAll("[style-hover]").forEach(function (el) {
      var base = el.getAttribute("style") || "";
      var hov = el.getAttribute("style-hover") || "";
      el.addEventListener("pointerenter", function () {
        el.setAttribute("style", base + ";" + hov);
      });
      el.addEventListener("pointerleave", function () {
        el.setAttribute("style", base);
      });
    });
  }

  /* ---- email obfuscation ---- */
  function initEmail() {
    try {
      var addr = "medxchangegh" + "@" + "outlook.com";
      document.querySelectorAll("[data-email]").forEach(function (el) {
        el.textContent = addr;
        el.setAttribute("href", "mailto:" + addr);
      });
    } catch (e) {}
  }

  /* ---- scroll-reactive nav + hero parallax ---- */
  function initNav() {
    var nav = document.getElementById("mxNav");
    var wrap = document.getElementById("mxGlobeWrap");
    if (!nav) return;
    var links = document.querySelectorAll("[data-navlink]");
    var showLinks = function () {
      if (window.innerWidth > 920) links.forEach(function (l) { l.style.display = "inline-block"; });
      else links.forEach(function (l) { l.style.display = "none"; });
    };
    showLinks();
    var hasHero = !!document.getElementById("mxHero");
    var apply = function () {
      var c = hasHero ? (window.scrollY > 64) : true;
      nav.style.background = c ? "rgba(251,248,241,0.9)" : "transparent";
      nav.style.borderBottom = c ? "1px solid #E2D8C5" : "1px solid transparent";
      nav.style.backdropFilter = c ? "saturate(1.3) blur(12px)" : "none";
      nav.style.webkitBackdropFilter = nav.style.backdropFilter;
      nav.style.paddingTop = c ? "14px" : "22px";
      nav.style.paddingBottom = c ? "14px" : "22px";
      document.querySelectorAll("[data-navtext]").forEach(function (el) {
        el.style.color = c ? "#1C1A17" : "#F1EADB";
      });
      if (wrap && !REDUCE_ALL) wrap.style.transform = "translateY(calc(-50% + " + (window.scrollY * 0.05) + "px))";
    };
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", showLinks);
    apply();
  }

  /* ---- mobile menu (added; not in original mockup) ---- */
  function initMobileMenu() {
    var burger = document.getElementById("mxBurger");
    var menu = document.getElementById("mxMobile");
    if (!burger || !menu) return;
    burger.setAttribute("aria-controls", "mxMobile");
    var setClosedState = function (closed) {
      burger.setAttribute("aria-expanded", closed ? "false" : "true");
      if (closed) { menu.setAttribute("aria-hidden", "true"); try { menu.setAttribute("inert", ""); } catch (e) {} }
      else { menu.removeAttribute("aria-hidden"); try { menu.removeAttribute("inert"); } catch (e) {} }
    };
    setClosedState(true);
    var toggle = function (open) {
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      setClosedState(!open);
      if (open) { var f = menu.querySelector("a,button"); if (f) f.focus(); }
      else { burger.focus(); }
    };
    burger.addEventListener("click", function () { toggle(!menu.classList.contains("open")); });
    var close = document.getElementById("mxMobileClose");
    if (close) close.addEventListener("click", function () { toggle(false); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { toggle(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) toggle(false);
    });
  }

  /* ---- reveal on scroll ---- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    // Never hide content if we cannot reliably reveal it (no IO support / reduced motion)
    if (REDUCE_ALL || !("IntersectionObserver" in window)) return;
    els.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      var d = el.getAttribute("data-reveal-delay") || "0";
      el.style.transition = "opacity .9s cubic-bezier(.2,.7,.2,1) " + d + "ms, transform .9s cubic-bezier(.2,.7,.2,1) " + d + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = "1";
          en.target.style.transform = "none";
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- number counters ---- */
  function initCounters() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (REDUCE_ALL) { el.textContent = target + suffix; return; }
      var dur = 1500, start = performance.now();
      var step = function (now) {
        var t = Math.min(1, (now - start) / dur);
        var e = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- magnetic buttons ---- */
  function initMagnetic() {
    if (REDUCE_ALL || !FINE) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + dx * 0.22 + "px," + dy * 0.3 + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = "translate(0,0)"; });
    });
  }

  /* ---- specialty marquee ---- */
  function initMarquee() {
    if (REDUCE_ALL) {
      document.querySelectorAll("[data-marquee]").forEach(function (m) { m.style.animationPlayState = "paused"; });
    }
  }

  /* ---- ECG pulse line ---- */
  function initEcg() {
    var p = document.querySelector("[data-ecg-path]");
    var pulse = document.querySelector("[data-ecg-pulse]");
    if (!p) return;
    var len = 0, plen = 0;
    try { len = p.getTotalLength(); if (pulse) plen = pulse.getTotalLength(); } catch (e) { return; }
    var head = document.querySelector("[data-ecg-head]");
    if (REDUCE_ALL) {
      p.style.strokeDasharray = "none"; p.style.strokeDashoffset = "0"; p.style.opacity = "0.7";
      if (pulse) pulse.style.display = "none";
      if (head) head.style.display = "none";
      return;
    }
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    var litLen = 170, headLen = 6;
    if (pulse) { pulse.style.strokeDasharray = litLen + " " + plen; pulse.style.strokeDashoffset = plen; }
    if (head) { head.style.strokeDasharray = headLen + " " + plen; head.style.strokeDashoffset = plen; }
    var sweep = function () {
      if (!pulse) return;
      var speed = (plen + litLen) / 1.9, start = null;
      var tick = function (now) {
        if (start === null) start = now;
        var pos = ((now - start) / 1000 * speed) % (plen + litLen);
        pulse.style.strokeDashoffset = (plen - pos);
        if (head) head.style.strokeDashoffset = (plen - pos - litLen + headLen);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          p.style.transition = "stroke-dashoffset 2.2s cubic-bezier(.65,0,.35,1)";
          p.style.strokeDashoffset = "0";
          sweep();
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    io.observe(p);
  }

  /* ---- the living-connection globe (2D canvas) ---- */
  function initGlobe(canvasId, opts) {
    opts = opts || {};
    var cv = document.getElementById(canvasId);
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var reduce = REDUCE;
    var N = 1500;
    var inc = Math.PI * (3 - Math.sqrt(5));
    var off = 2 / N;
    var pts = [];
    for (var i = 0; i < N; i++) {
      var y = i * off - 1 + off / 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var phi = i * inc;
      pts.push([Math.cos(phi) * r, y, Math.sin(phi) * r]);
    }
    var ll = function (lat, lon) {
      var a = lat * Math.PI / 180, o = lon * Math.PI / 180;
      return [Math.cos(a) * Math.cos(o), Math.sin(a), Math.cos(a) * Math.sin(o)];
    };
    var cities = [
      ["London", 51.5, -0.12, 0.0], ["Berlin", 52.5, 13.4, 0.35], ["Madrid", 40.4, -3.7, 0.7],
      ["Stockholm", 59.3, 18.1, 1.0], ["Toronto", 43.7, -79.4, 1.25], ["New York", 40.7, -74.0, 1.55],
      ["Sao Paulo", -23.5, -46.6, 1.85], ["Nairobi", -1.3, 36.8, 2.2], ["Mumbai", 19.1, 72.9, 2.55],
      ["Sydney", -33.9, 151.2, 2.9], ["Cairo", 30.0, 31.2, 3.25]
    ].map(function (c) { return { v: ll(c[1], c[2]), ph: c[3] }; });
    var ghana = ll(5.1, -1.25);
    var graticule = [];
    var addCircle = function (fn) { var seg = []; for (var s = 0; s <= 64; s++) seg.push(fn(s / 64)); graticule.push(seg); };
    for (var lon = -150; lon <= 180; lon += 30) (function (lon) { addCircle(function (u) { return ll(-85 + u * 170, lon); }); })(lon);
    for (var lat = -60; lat <= 60; lat += 20) (function (lat) { addCircle(function (u) { return ll(lat, -180 + u * 360); }); })(lat);
    var norm = function (a) { var m = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / m, a[1] / m, a[2] / m]; };
    var L = norm([-0.45, 0.4, 0.82]);
    var tilt = 0.42;
    var W, H, DPR, cx, cy, R;
    var resize = function () {
      var rect = cv.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      cv.width = Math.max(2, W * DPR); cv.height = Math.max(2, H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W / 2; cy = H / 2; R = Math.min(W, H) * 0.4;
    };
    resize();
    window.addEventListener("resize", resize);
    var tmx = 0, tmy = 0, mx = 0, my = 0;
    var hero = opts.parallaxHost ? document.getElementById(opts.parallaxHost) : null;
    if (hero && !reduce) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        tmx = (e.clientX - r.left) / r.width - 0.5;
        tmy = (e.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener("pointerleave", function () { tmx = 0; tmy = 0; });
    }
    var rot = function (p, ry, rx) {
      var x = p[0] * Math.cos(ry) + p[2] * Math.sin(ry);
      var z = -p[0] * Math.sin(ry) + p[2] * Math.cos(ry);
      var yy = p[1];
      var y2 = yy * Math.cos(rx) - z * Math.sin(rx);
      var z2 = yy * Math.sin(rx) + z * Math.cos(rx);
      return [x, y2, z2];
    };
    var proj = function (v) { return [cx + R * v[0], cy - R * v[1]]; };
    var quad = function (a, c, b, t) { var m = 1 - t; return [m * m * a[0] + 2 * m * t * c[0] + t * t * b[0], m * m * a[1] + 2 * m * t * c[1] + t * t * b[1]]; };
    var visible = true, coarse = window.matchMedia("(pointer:coarse)").matches, _frame = 0;
    var t = 0, ry = -1.2;
    var draw = function () {
      if (coarse && ((_frame++) & 1)) { if (!reduce && visible) requestAnimationFrame(draw); return; }
      t += 0.016; ry += 0.0015;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      var RYp = ry + mx * 0.6;
      var RX = tilt + my * 0.45;
      ctx.clearRect(0, 0, W, H);
      var g = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.15, cx, cy, R * 1.45);
      g.addColorStop(0, "rgba(217,138,61,0.12)");
      g.addColorStop(0.55, "rgba(14,58,52,0.0)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.45, 0, 7); ctx.fill();
      ctx.lineWidth = 0.85;
      ctx.strokeStyle = "rgba(184,137,58,0.13)";
      for (var gi = 0; gi < graticule.length; gi++) {
        var seg = graticule[gi];
        ctx.beginPath();
        var started = false;
        for (var j = 0; j < seg.length; j++) {
          var v = rot(seg[j], RYp, RX);
          if (v[2] > 0.02) {
            var pp = proj(v);
            if (!started) { ctx.moveTo(pp[0], pp[1]); started = true; } else ctx.lineTo(pp[0], pp[1]);
          } else started = false;
        }
        ctx.stroke();
      }
      for (var k = 0; k < N; k++) {
        var vv = rot(pts[k], RYp, RX);
        if (vv[2] <= 0.02) continue;
        var b = vv[0] * L[0] + vv[1] * L[1] + vv[2] * L[2];
        var lit = Math.max(0, Math.min(1, (b + 0.55) / 1.4));
        var p2 = proj(vv);
        var a = (0.1 + lit * 0.5) * Math.min(1, vv[2] * 1.7);
        var cr = Math.round(70 + lit * 150);
        var cg = Math.round(110 + lit * 65);
        var cb = Math.round(108 - lit * 28);
        ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + a + ")";
        var sz = vv[2] > 0.72 ? 1.7 : 1.2;
        ctx.fillRect(p2[0], p2[1], sz, sz);
      }
      ctx.strokeStyle = "rgba(184,137,58,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.004, 0, 7); ctx.stroke();
      var gv = rot(ghana, RYp, RX);
      var gp = proj(gv);
      cities.forEach(function (c) {
        var cvr = rot(c.v, RYp, RX);
        var cp = proj(cvr);
        var vis = Math.max(0, Math.min(1, cvr[2] * 2)) * Math.max(0, Math.min(1, gv[2] * 2));
        if (vis <= 0.01) return;
        var mxp = (cp[0] + gp[0]) / 2, myp = (cp[1] + gp[1]) / 2;
        var dx = mxp - cx, dy = myp - cy, dl = Math.hypot(dx, dy) || 1;
        var ctrl = [mxp + dx / dl * R * 0.34, myp + dy / dl * R * 0.34];
        ctx.strokeStyle = "rgba(184,137,58," + (0.13 + vis * 0.24) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cp[0], cp[1]); ctx.quadraticCurveTo(ctrl[0], ctrl[1], gp[0], gp[1]); ctx.stroke();
        var tt = ((t * 0.16) + c.ph) % 2;
        if (tt < 1) {
          for (var q = 0; q < 9; q++) {
            var uu = Math.max(0, tt - q * 0.028);
            var bp = quad(cp, ctrl, gp, uu);
            ctx.fillStyle = "rgba(229,161,85," + (vis * (0.5 - q * 0.055)) + ")";
            ctx.beginPath(); ctx.arc(bp[0], bp[1], Math.max(0.4, 2.3 - q * 0.2), 0, 7); ctx.fill();
          }
          var hp = quad(cp, ctrl, gp, tt);
          ctx.fillStyle = "rgba(246,241,231," + vis + ")";
          ctx.beginPath(); ctx.arc(hp[0], hp[1], 2.4, 0, 7); ctx.fill();
        }
        ctx.fillStyle = "rgba(217,138,61," + vis + ")";
        ctx.beginPath(); ctx.arc(cp[0], cp[1], 2.1, 0, 7); ctx.fill();
      });
      if (gv[2] > 0) {
        var pulse = (t * 0.45) % 1;
        ctx.strokeStyle = "rgba(192,85,47," + (1 - pulse) * 0.55 + ")";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(gp[0], gp[1], 4 + pulse * 24, 0, 7); ctx.stroke();
        ctx.fillStyle = "rgba(229,161,85,1)";
        ctx.beginPath(); ctx.arc(gp[0], gp[1], 3.4, 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(246,241,231,0.95)";
        ctx.beginPath(); ctx.arc(gp[0], gp[1], 1.4, 0, 7); ctx.fill();
      }
      if (!reduce && visible) requestAnimationFrame(draw);
    };
    if (!reduce && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        var was = visible; visible = es[0].isIntersecting;
        if (visible && !was) requestAnimationFrame(draw);
      }, { threshold: 0 }).observe(cv);
    }
    if (reduce) { ry = 0.2; draw(); } else { draw(); }
  }

  ready(function () {
    try { initHover(); } catch (e) {}
    try { initEmail(); } catch (e) {}
    try { setupLangSwitch(); } catch (e) {}
    try { initNav(); } catch (e) {}
    try { initMobileMenu(); } catch (e) {}
    try { initReveal(); } catch (e) {}
    try { initCounters(); } catch (e) {}
    try { initMagnetic(); } catch (e) {}
    try { initMarquee(); } catch (e) {}
    try { initEcg(); } catch (e) {}
    try { initGlobe("mxGlobe", { parallaxHost: "mxHero" }); } catch (e) {}
    try { initGlobe("mxGlobe2", {}); } catch (e) {}
  });
})();
