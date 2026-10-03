/* Saiba Café v0 — interações vanilla, zero dependência */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isShots = /[?&]shots=1/.test(location.search);
  if (isShots) document.documentElement.classList.add("shots");

  /* modo captura: números já nos valores finais (sem depender de IO/rAF) */
  if (isShots) {
    document.querySelectorAll(".count").forEach(function (el) {
      el.textContent = parseFloat(el.getAttribute("data-count")).toFixed(parseInt(el.getAttribute("data-decimals") || "0", 10)).replace(".", ",");
    });
  }

  /* ---------- 1. split letra-a-letra do hero ---------- */
  document.querySelectorAll("[data-letters]").forEach(function (block, blockIndex) {
    var seq = 0;
    block.querySelectorAll(".line").forEach(function (line) {
      var text = line.textContent;
      line.setAttribute("aria-label", text);
      line.textContent = "";
      Array.prototype.forEach.call(text, function (ch) {
        var span = document.createElement("span");
        span.className = "l";
        span.setAttribute("aria-hidden", "true");
        span.textContent = ch;
        span.style.setProperty("--i", String(seq + blockIndex * 6));
        line.appendChild(span);
        seq++;
      });
    });
  });

  /* dispara o stagger logo no load */
  function armHero() {
    requestAnimationFrame(function () {
      document.body.classList.add("in");
    });
  }
  if (reduced) {
    document.body.classList.add("in");
  } else {
    window.addEventListener("load", armHero);
    /* fallback: se o load demorar (file://), arma em 300ms */
    setTimeout(function () {
      if (!document.body.classList.contains("in")) armHero();
    }, 300);
  }

  /* ---------- 2. reveal-on-scroll + contadores ---------- */
  function fmt(value, decimals) {
    return value.toFixed(decimals).replace(".", ",");
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduced) { el.textContent = fmt(target, decimals); return; }
    var dur = 1300;
    var start = null;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, decimals);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add("in");
      if (!isShots) el.querySelectorAll(".count").forEach(animateCount);
      io.unobserve(el);
    });
  }, { threshold: 0.25 });

  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* hero: dispara contadores só quando os números entrarem — tratado pelo IO acima */

  /* ---------- 3. botões magnéticos ---------- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduced) {
    document.querySelectorAll(".magnet").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = "translate(" + (dx * 10).toFixed(1) + "px," + (dy * 7).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- 4. formulário (v0 sem backend) ---------- */
  var form = document.getElementById("email-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".email-note");
      if (note) note.hidden = false;
    });
  }
})();
