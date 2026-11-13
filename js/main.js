/* ═══════════════════════════════════════
   AI 执行导演 · Portfolio 交互脚本
   ═══════════════════════════════════════ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───── 1. 星空画布：闪烁星空 ───── */
  var canvas = document.getElementById("starfield");
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var stars = [];
    var shooting = [];
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildStars();
    }

    function buildStars() {
      stars = [];
      var count = Math.min(240, Math.floor((W * H) / 6200));
      for (var i = 0; i < count; i++) {
        var isBlue = Math.random() > 0.82;
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.4 + 0.3,
          base: Math.random() * 0.4 + 0.3,
          amp: Math.random() * 0.4 + 0.15,
          phase: Math.random() * Math.PI * 2,
          twSpeed: Math.random() * 0.018 + 0.006,
          sparkSpeed: Math.random() * 0.09 + 0.04,
          sparkAmp: Math.random() * 0.45 + 0.1,
          glow: Math.random() > 0.55,
          hue: isBlue ? "200, 220, 255" : "255, 255, 255"
        });
      }
    }

    function spawnShooting() {
      if (Math.random() < 0.006 && shooting.length < 2) {
        shooting.push({
          x: Math.random() * W * 0.7 + W * 0.15,
          y: Math.random() * H * 0.3,
          vx: -(Math.random() * 5 + 4),
          vy: Math.random() * 3 + 2,
          life: 1
        });
      }
    }

    var t = 0;
    function draw() {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var breathe = Math.sin(t * s.twSpeed + s.phase) * s.amp;
        var spark = Math.sin(t * s.sparkSpeed + s.phase) * s.sparkAmp;
        var a = s.base + breathe + spark;
        if (a < 0) a = 0; else if (a > 1) a = 1;
        var radius = s.r * (1 + Math.max(0, spark) * 0.5);

        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + s.hue + "," + a.toFixed(3) + ")";
        ctx.fill();

        if (s.glow && a > 0.55) {
          var gr = radius * 5;
          var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gr);
          g.addColorStop(0, "rgba(" + s.hue + "," + (a * 0.35).toFixed(3) + ")");
          g.addColorStop(1, "rgba(" + s.hue + ",0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(s.x, s.y, gr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      spawnShooting();
      for (var j = shooting.length - 1; j >= 0; j--) {
        var m = shooting[j];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.018;
        if (m.life <= 0) { shooting.splice(j, 1); continue; }
        var grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        grad.addColorStop(0, "rgba(210, 230, 255," + (0.9 * m.life).toFixed(3) + ")");
        grad.addColorStop(1, "rgba(210, 230, 255, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
  }

  /* ───── 1b. 银河漩涡（星轨线条盘） ───── */
  var vortex = document.getElementById("vortex");
  if (vortex) {
    var vctx = vortex.getContext("2d");
    var VS = 480;
    var vDPR = Math.min(window.devicePixelRatio || 1, 2);
    vortex.width = VS * vDPR;
    vortex.height = VS * vDPR;
    vctx.setTransform(vDPR, 0, 0, vDPR, 0, 0);

    var vcx = VS / 2, vcy = VS / 2;
    var vIn = 40, vOut = 250;
    var t2 = 0;

    // 星轨线条：细长的螺旋弧线，越靠内越快越亮
    var vLines = [];
    for (var vi = 0; vi < 130; vi++) {
      var vr = vIn + Math.pow(Math.random(), 0.85) * (vOut - vIn);
      var vd = 1 - (vr - vIn) / (vOut - vIn);
      vLines.push({
        a0: Math.random() * Math.PI * 2,
        r0: vr,
        span: 1.1 + Math.random() * 2.4,        // 弧线扫过角度
        drift: 6 + Math.random() * 26,          // 沿弧线向内收拢
        seg: 14 + Math.floor(Math.random() * 14),
        w: 0.35 + Math.random() * 0.9,
        al: 0.05 + vd * 0.3 * (0.35 + Math.random() * 0.65),
        sp: (0.0008 + vd * 0.0035) * (0.7 + Math.random() * 0.6)
      });
    }

    // 彩色星尘：冷暖随机的小点，散布在盘面上
    var vDots = [];
    var vWarm = ["255, 150, 80", "255, 110, 70", "255, 200, 140"];
    for (var vj = 0; vj < 320; vj++) {
      var isWarm = Math.random() > 0.72;
      var vr2 = vIn + Math.pow(Math.random(), 0.8) * (vOut - vIn + 30);
      vDots.push({
        a: Math.random() * Math.PI * 2,
        r: vr2,
        off: (Math.random() - 0.5) * 14,
        size: 0.3 + Math.random() * 0.9,
        hue: isWarm ? vWarm[Math.floor(Math.random() * vWarm.length)] : "225, 232, 245",
        al: 0.12 + Math.random() * 0.6,
        tw: 0.01 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        sp: 0.0006 + (1 - (vr2 - vIn) / (vOut - vIn)) * 0.002
      });
    }

    var vStep = function () {
      vctx.clearRect(0, 0, VS, VS);
      var sq = 0.42;                           // 透视压扁

      // 漩涡亮核辉光
      var gg = vctx.createRadialGradient(vcx + 26, vcy + 34, 0, vcx + 26, vcy + 34, 130);
      gg.addColorStop(0, "rgba(225, 235, 250, 0.5)");
      gg.addColorStop(0.35, "rgba(170, 190, 225, 0.16)");
      gg.addColorStop(1, "rgba(150, 170, 215, 0)");
      vctx.fillStyle = gg;
      vctx.beginPath();
      vctx.ellipse(vcx + 26, vcy + 34, 130, 130 * sq + 26, 0, 0, Math.PI * 2);
      vctx.fill();

      // 星轨线条（缓慢盘旋流动）
      vctx.lineCap = "round";
      for (var i = 0; i < vLines.length; i++) {
        var L = vLines[i];
        L.a0 += L.sp;
        var bright = 1 - (L.r0 - vIn) / (vOut - vIn);
        vctx.beginPath();
        for (var k = 0; k <= L.seg; k++) {
          var ang = L.a0 + (k / L.seg) * L.span;
          var rad = L.r0 - (k / L.seg) * L.drift;
          var x = vcx + Math.cos(ang) * rad;
          var y = vcy + Math.sin(ang) * rad * sq;
          if (k === 0) vctx.moveTo(x, y); else vctx.lineTo(x, y);
        }
        vctx.strokeStyle = "rgba(215, 226, 245," + (L.al * (0.45 + 0.55 * bright)).toFixed(3) + ")";
        vctx.lineWidth = L.w;
        vctx.stroke();
      }

      // 彩色星尘（随盘旋转 + 闪烁）
      for (var j = 0; j < vDots.length; j++) {
        var d = vDots[j];
        d.a += d.sp;
        var rad2 = d.r + d.off * Math.sin(d.a * 2);
        var x2 = vcx + Math.cos(d.a) * rad2;
        var y2 = vcy + Math.sin(d.a) * rad2 * sq;
        var twk = 0.55 + 0.45 * Math.sin(t2 * d.tw + d.phase);
        vctx.fillStyle = "rgba(" + d.hue + "," + (d.al * twk).toFixed(3) + ")";
        vctx.beginPath();
        vctx.arc(x2, y2, d.size, 0, Math.PI * 2);
        vctx.fill();
      }
    };

    vStep();
    if (!prefersReduced) {
      (function vLoop() {
        t2 += 1;
        vStep();
        requestAnimationFrame(vLoop);
      })();
    }
  }

  /* ───── 2. 导航滚动状态 ───── */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (nav) {
    setTimeout(function () { nav.classList.add("is-in"); }, 250);
  }

  /* ───── 3. 当前区块高亮 ───── */
  var navLinks = document.querySelectorAll("[data-nav]");
  var sections = ["work", "strength", "film", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === "#" + entry.target.id
          );
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ───── 4. 移动端抽屉菜单 ───── */
  var burger = document.getElementById("navBurger");
  var drawer = document.getElementById("drawer");

  function setDrawer(open) {
    if (!burger || !drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (burger && drawer) {
    burger.addEventListener("click", function () {
      setDrawer(!drawer.classList.contains("is-open"));
    });
    drawer.querySelectorAll("[data-drawer-link]").forEach(function (link) {
      link.addEventListener("click", function () { setDrawer(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setDrawer(false);
    });
  }

  /* ───── 5. 滚动进场动画 ───── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ───── 6. 卡片 3D 倾斜 ───── */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var raf = null;
      card.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var rect = card.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width - 0.5;
          var py = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            "perspective(900px) rotateX(" + (-py * 4).toFixed(2) + "deg) rotateY(" +
            (px * 5).toFixed(2) + "deg) translateY(-4px)";
          raf = null;
        });
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ───── 7. HERO 开场：图片进场 + 轮播 ───── */
  var heroTitle = document.getElementById("heroTitle");
  var heroContent = document.getElementById("heroContent");
  var heroSection = document.getElementById("hero");

  function renderTitle(text) {
    if (!heroTitle) return;
    heroTitle.innerHTML = "";
    heroTitle.setAttribute("aria-label", text);
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "ch";
      span.setAttribute("aria-hidden", "true");
      span.textContent = text[i] === " " ? "\u00A0" : text[i];
      span.style.animationDelay = (0.12 + i * 0.045).toFixed(3) + "s";
      heroTitle.appendChild(span);
    }
    requestAnimationFrame(fitTitle);
  }

  // 让首屏标题始终压在一行内：超宽时等比缩小字号
  function fitTitle() {
    if (!heroTitle || !heroSection) return;

    var pad = 0;
    var maxW = 780;
    if (heroContent) {
      var contentStyle = window.getComputedStyle(heroContent);
      pad = (parseFloat(contentStyle.paddingLeft) || 0) + (parseFloat(contentStyle.paddingRight) || 0);
      var mw = parseFloat(contentStyle.maxWidth);
      if (mw && !isNaN(mw)) maxW = mw;
    }

    var available = Math.min(heroSection.clientWidth, maxW) - pad;
    if (available <= 0) return;

    heroTitle.style.fontSize = "";
    var base = parseFloat(window.getComputedStyle(heroTitle).fontSize) || 0;
    if (!base) return;

    var size = base;
    for (var pass = 0; pass < 4; pass++) {
      heroTitle.style.fontSize = size.toFixed(1) + "px";
      var textWidth = heroTitle.scrollWidth;
      if (textWidth <= available) return;
      size = size * (available / textWidth) * 0.995;
      if (size <= 34) {
        heroTitle.style.fontSize = "34px";
        return;
      }
    }
  }

  var SLIDES = [
    {
      tag: "WORLD · 世界观",
      title: "BELL TOWER",
      cn: "钟楼之上",
      desc: "钟声之下，永夜之城的第一次呼吸 —— 场景世界观与气氛开发。",
      img: "assets/img/gothic-01.png",
      cap: "The city sleeps beneath the bell."
    },
    {
      tag: "LOCATION · 城市场景",
      title: "NIGHTFALL",
      cn: "永夜之城",
      desc: "从街区动线到灯火层次，用 AI 搭建一座可无限延展的哥特城市。",
      img: "assets/img/gothic-02.png",
      cap: "A road of light through the endless night."
    },
    {
      tag: "SCENE · 场景美术",
      title: "CRIMSON HALL",
      cn: "猩红圣殿",
      desc: "红毯、烛火与石阶 —— 以光影塑造仪式的庄重与悲怆。",
      img: "assets/img/gothic-03.png",
      cap: "Petals fall where the ceremony ends."
    },
    {
      tag: "INTERIOR · 内景设计",
      title: "GOTHIC STUDY",
      cn: "幽冥书房",
      desc: "尖拱窗与月光对照，构建人物独处时的静谧叙事空间。",
      img: "assets/img/gothic-04.png",
      cap: "Moonlight studies with the silent scholar."
    },
    {
      tag: "ART · 场景概念",
      title: "ETERNAL REST",
      cn: "长眠之厅",
      desc: "紫绒棺椁与烛台阵列，为故事终章铺设仪式感。",
      img: "assets/img/gothic-05.png",
      cap: "Two coffins wait beneath the moon."
    }
  ];

  var slideImg = document.getElementById("slideImg");
  var slideTag = document.getElementById("slideTag");
  var slideCn = document.getElementById("slideCn");
  var slideDesc = document.getElementById("slideDesc");
  var slideCaption = document.getElementById("slideCaption");
  var heroPrev = document.getElementById("heroPrev");
  var heroNext = document.getElementById("heroNext");
  var thumbs = document.querySelectorAll("#heroThumbs .thumb");
  var currentSlide = 0;
  var slideTimer = null;
  var imgTimer = null;

  function applySlide(i) {
    var s = SLIDES[i];
    if (!s) return;

    if (slideTag) slideTag.textContent = s.tag;
    if (slideCn) slideCn.textContent = s.cn;
    if (slideDesc) slideDesc.textContent = s.desc;
    if (slideCaption) slideCaption.textContent = s.cap || "";
    renderTitle(s.title);

    if (slideImg) {
      if (imgTimer) clearTimeout(imgTimer);
      slideImg.classList.add("is-fading");
      imgTimer = setTimeout(function () {
        slideImg.src = s.img;
        slideImg.classList.remove("is-fading");
      }, 280);
    }

    thumbs.forEach(function (btn) {
      btn.classList.toggle("is-active", Number(btn.getAttribute("data-slide")) === i);
    });
  }

  function goTo(i) {
    currentSlide = (i + SLIDES.length) % SLIDES.length;
    applySlide(currentSlide);
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(function () { goTo(currentSlide + 1); }, 5500);
  }

  if (thumbs.length) {
    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        goTo(Number(btn.getAttribute("data-slide")));
      });
    });
  }

  if (heroPrev) heroPrev.addEventListener("click", function () { goTo(currentSlide - 1); });
  if (heroNext) heroNext.addEventListener("click", function () { goTo(currentSlide + 1); });

  if (heroContent) {
    applySlide(0);
    slideTimer = setInterval(function () { goTo(currentSlide + 1); }, 5500);
    setTimeout(function () { heroContent.classList.add("is-in"); }, 450);
  }

  if (heroTitle) {
    var fitTimer = null;
    window.addEventListener("resize", function () {
      if (fitTimer) clearTimeout(fitTimer);
      fitTimer = setTimeout(fitTitle, 120);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitTitle);
    }
  }

  /* —— 拼贴视差 —— */
  var inners = document.querySelectorAll(".panel__inner");
  if (heroSection && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    heroSection.addEventListener("pointermove", function (e) {
      var r = heroSection.getBoundingClientRect();
      var mx = (e.clientX - r.left) / r.width - 0.5;
      var my = (e.clientY - r.top) / r.height - 0.5;
      inners.forEach(function (el) {
        var d = parseFloat(el.getAttribute("data-depth")) || 10;
        el.style.transform = "translate(" + (-mx * d).toFixed(1) + "px," + (-my * d).toFixed(1) + "px)";
      });
    });
  }

  /* ───── 7b. 主图动态层：星尘闪烁 / 流星 / 星云呼吸 ───── */
  var planetFx = document.getElementById("planetFx");
  if (planetFx && !prefersReduced) {
    var pctx = planetFx.getContext("2d");
    var pW = 0, pH = 0;
    var pDPR = Math.min(window.devicePixelRatio || 1, 2);
    var pStars = [];
    var pShots = [];

    function pResize() {
      var rect = planetFx.parentElement.getBoundingClientRect();
      pW = rect.width;
      pH = rect.height;
      planetFx.width = pW * pDPR;
      planetFx.height = pH * pDPR;
      pctx.setTransform(pDPR, 0, 0, pDPR, 0, 0);
      pStars = [];
      for (var i = 0; i < 90; i++) {
        pStars.push({
          x: Math.random() * pW,
          y: Math.random() * pH * 0.72,
          r: 0.3 + Math.random() * 1.1,
          base: 0.15 + Math.random() * 0.5,
          amp: 0.1 + Math.random() * 0.35,
          sp: 0.01 + Math.random() * 0.035,
          ph: Math.random() * Math.PI * 2
        });
      }
    }

    function pStep(t) {
      pctx.clearRect(0, 0, pW, pH);

      // 月光雾气的呼吸辉光
      var pulse = 0.045 + 0.03 * Math.sin(t * 0.012);
      var ng = pctx.createRadialGradient(pW * 0.5, pH * 0.32, 0, pW * 0.5, pH * 0.32, pW * 0.3);
      ng.addColorStop(0, "rgba(150, 180, 220," + pulse.toFixed(3) + ")");
      ng.addColorStop(1, "rgba(150, 180, 220, 0)");
      pctx.fillStyle = ng;
      pctx.fillRect(0, 0, pW, pH);

      // 星尘闪烁
      for (var i = 0; i < pStars.length; i++) {
        var s = pStars[i];
        var a = s.base + Math.sin(t * s.sp + s.ph) * s.amp;
        if (a < 0) a = 0; else if (a > 1) a = 1;
        pctx.beginPath();
        pctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        pctx.fillStyle = "rgba(225, 235, 250," + a.toFixed(3) + ")";
        pctx.fill();
      }

      // 划过画面的流星
      if (Math.random() < 0.008 && pShots.length < 2) {
        pShots.push({
          x: pW * (0.2 + Math.random() * 0.6),
          y: pH * (0.05 + Math.random() * 0.2),
          vx: 2.6 + Math.random() * 2.4,
          vy: 1 + Math.random() * 0.8,
          life: 1
        });
      }
      for (var j = pShots.length - 1; j >= 0; j--) {
        var m = pShots[j];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.02;
        if (m.life <= 0) { pShots.splice(j, 1); continue; }
        var lg = pctx.createLinearGradient(m.x, m.y, m.x - m.vx * 16, m.y - m.vy * 16);
        lg.addColorStop(0, "rgba(220, 235, 255," + (0.85 * m.life).toFixed(3) + ")");
        lg.addColorStop(1, "rgba(220, 235, 255, 0)");
        pctx.strokeStyle = lg;
        pctx.lineWidth = 1.2;
        pctx.beginPath();
        pctx.moveTo(m.x, m.y);
        pctx.lineTo(m.x - m.vx * 16, m.y - m.vy * 16);
        pctx.stroke();
      }
    }

    var pt = 0;
    function pLoop() {
      pt += 1;
      pStep(pt);
      requestAnimationFrame(pLoop);
    }

    pResize();
    window.addEventListener("resize", pResize);
    pStep(0);
    requestAnimationFrame(pLoop);
  }

  /* ───── 7c. 海报自动滚动（可拖动 / 悬停暂停） ───── */
  var posterTrack = document.getElementById("posterTrack");
  if (posterTrack) {
    // 复制一整组，形成无缝循环
    var pNodes = Array.prototype.slice.call(posterTrack.children);
    pNodes.forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      Array.prototype.forEach.call(clone.querySelectorAll("a"), function (a) {
        a.setAttribute("tabindex", "-1");
      });
      posterTrack.appendChild(clone);
    });

    var pPaused = false;
    var pDown = false;
    var pStartX = 0;
    var pStartScroll = 0;
    var pMoved = 0;
    var pSpeed = 0.55;
    var pHalf = 0;

    function pMeasure() { pHalf = posterTrack.scrollWidth / 2; }

    posterTrack.addEventListener("pointerenter", function () { pPaused = true; });
    posterTrack.addEventListener("pointerleave", function () {
      if (!pDown) pPaused = false;
    });

    posterTrack.addEventListener("pointerdown", function (e) {
      pDown = true;
      pPaused = true;
      pStartX = e.clientX;
      pStartScroll = posterTrack.scrollLeft;
      pMoved = 0;
      posterTrack.classList.add("is-dragging");
    });

    window.addEventListener("pointermove", function (e) {
      if (!pDown) return;
      posterTrack.scrollLeft = pStartScroll - (e.clientX - pStartX);
      pMoved = Math.max(pMoved, Math.abs(e.clientX - pStartX));
    });

    // 拖动后不触发卡片内的链接跳转
    posterTrack.addEventListener("click", function (e) {
      if (pMoved > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    window.addEventListener("pointerup", function () {
      if (!pDown) return;
      pDown = false;
      posterTrack.classList.remove("is-dragging");
      pPaused = false;
    });

    pMeasure();
    window.addEventListener("resize", pMeasure);

    if (!prefersReduced) {
      var pLast = 0;
      (function pTick(ts) {
        if (!pLast) pLast = ts;
        var dt = Math.min(ts - pLast, 60);
        pLast = ts;

        if (!pPaused && pHalf > 0) {
          posterTrack.scrollLeft += pSpeed * (dt / 16.67);
          if (posterTrack.scrollLeft >= pHalf) posterTrack.scrollLeft -= pHalf;
        }
        requestAnimationFrame(pTick);
      })(0);
    }
  }

  /* ───── 7d. 配音提示词展开 ───── */
  var voiceToggles = Array.prototype.slice.call(document.querySelectorAll(".voice-toggle"));
  if (voiceToggles.length) {
    function setToggleState(id, open) {
      voiceToggles.forEach(function (btn) {
        if (btn.getAttribute("data-prompt") === id) {
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        }
      });
    }

    function closePanel(id) {
      var panel = document.getElementById(id);
      if (!panel) return;
      panel.hidden = true;
      setToggleState(id, false);
    }

    voiceToggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-prompt");
        var panel = document.getElementById(id);
        if (!panel) return;

        var willOpen = btn.getAttribute("aria-expanded") !== "true";

        voiceToggles.forEach(function (other) {
          var otherId = other.getAttribute("data-prompt");
          if (otherId !== id) closePanel(otherId);
        });

        panel.hidden = !willOpen;
        setToggleState(id, willOpen);

        if (willOpen) {
          panel.setAttribute("tabindex", "-1");
          var top = panel.getBoundingClientRect().top + window.pageYOffset - 110;
          window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
          panel.focus({ preventScroll: true });
        }
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll(".voice-panel__close"), function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-close");
        closePanel(id);
        var toggle = document.querySelector('.voice-toggle[data-prompt="' + id + '"]');
        if (toggle) toggle.focus();
      });
    });
  }

  /* ───── 8. 点击水波纹 ───── */
  if (!prefersReduced) {
    var rippleLayer = document.createElement("div");
    rippleLayer.className = "ripple-layer";
    document.body.appendChild(rippleLayer);

    function spawnRipple(x, y) {
      var a = document.createElement("span");
      a.className = "ripple";
      a.style.left = x + "px";
      a.style.top = y + "px";
      var b = document.createElement("span");
      b.className = "ripple ripple--2";
      b.style.left = x + "px";
      b.style.top = y + "px";
      rippleLayer.appendChild(a);
      rippleLayer.appendChild(b);
      setTimeout(function () {
        a.remove();
        b.remove();
      }, 1000);
    }

    document.addEventListener("pointerdown", function (e) {
      spawnRipple(e.clientX, e.clientY);
    });
  }
})();
