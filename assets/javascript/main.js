(function ($) {
  "use strict";

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================================
     0. AWWWARDS EDITORIAL CUSTOM CURSOR (Spring Reticle + Context Lens)
     ========================================================================== */
  function initEditorialCursor() {
    if (prefersReducedMotion) return;
    if (
      window.matchMedia &&
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    var dot = document.getElementById("ed-cursor-dot");
    var ring = document.getElementById("ed-cursor-ring");
    var labelEl = document.getElementById("ed-cursor-label");
    if (!dot || !ring || !labelEl) return;

    document.body.classList.add("has-custom-cursor");

    var mouseX = -100;
    var mouseY = -100;
    var ringX = -100;
    var ringY = -100;

    window.addEventListener(
      "pointermove",
      function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform =
          "translate3d(" + mouseX + "px, " + mouseY + "px, 0)";
      },
      { passive: true }
    );

    function tickCursor() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform =
        "translate3d(" +
        ringX.toFixed(2) +
        "px, " +
        ringY.toFixed(2) +
        "px, 0)";
      requestAnimationFrame(tickCursor);
    }
    requestAnimationFrame(tickCursor);

    // Context-aware hover states
    document.addEventListener(
      "mouseover",
      function (e) {
        var target = e.target;
        if (!target || !target.closest) return;

        var darkSection = target.closest('[data-cursor-theme="dark"]');
        if (darkSection) {
          document.body.classList.add("cursor-on-dark");
        } else {
          document.body.classList.remove("cursor-on-dark");
        }

        var labeledEl = target.closest("[data-cursor-label]");
        if (labeledEl) {
          var txt = labeledEl.getAttribute("data-cursor-label");
          labelEl.textContent = txt || "";
          document.body.classList.add("cursor-has-label");
          document.body.classList.remove("cursor-hover-link");
          return;
        }

        document.body.classList.remove("cursor-has-label");
        var interactiveEl = target.closest("a, button, .filter, input, select, textarea");
        if (interactiveEl) {
          document.body.classList.add("cursor-hover-link");
        } else {
          document.body.classList.remove("cursor-hover-link");
        }
      },
      { passive: true }
    );
  }

  /* ==========================================================================
     1. THREE.JS WEBGL FULL-SIZE HERO SCULPTURE
        (Aerodynamic Obsidian Ribbon + Chromatic Crimson/Amber/Cobalt Isolines)
     ========================================================================== */
  var heroWavePulse = 0;
  var heroAccentColors = [0xc8102e, 0xf59e0b, 0x0ea5e9, 0x10b981];
  var activeHeroAccentHex = heroAccentColors[0];

  function initHeroThreeJS() {
    var canvas = document.getElementById("hero-webgl-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      return;
    }

    var parent = canvas.parentElement;
    var width = parent.clientWidth || window.innerWidth;
    var height = parent.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.25, 5.0);
    camera.lookAt(0, 0, 0);

    var segX = 84;
    var segY = 32;
    var geometry = new THREE.PlaneGeometry(11.0, 4.8, segX, segY);
    geometry.rotateX(-Math.PI * 0.35);

    var basePositions = geometry.attributes.position.array.slice();

    var wireMat = new THREE.MeshStandardMaterial({
      color: 0x262630,
      emissive: 0x07070b,
      roughness: 0.24,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });

    var ribbonMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(ribbonMesh);

    // Floating chromatic contour lines (Alabaster, Crimson, Electric Amber, Cobalt Cyan)
    var lineGroup = new THREE.Group();
    var lineMatWhite = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
    });
    var lineMatCrimson = new THREE.LineBasicMaterial({
      color: 0xc8102e,
      transparent: true,
      opacity: 0.82,
    });
    var lineMatAmber = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.58,
    });
    var lineMatCobalt = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.55,
    });

    var contourLines = [];
    for (var l = 0; l < 9; l++) {
      var pts = [];
      for (var s = 0; s <= 72; s++) {
        var px = (s / 72 - 0.5) * 10.5;
        var pz = (l / 8 - 0.5) * 3.0;
        pts.push(new THREE.Vector3(px, 0, pz));
      }
      var lGeo = new THREE.BufferGeometry().setFromPoints(pts);
      var mat = lineMatWhite;
      if (l === 4) mat = lineMatCrimson;
      else if (l === 2) mat = lineMatAmber;
      else if (l === 6) mat = lineMatCobalt;

      var lMesh = new THREE.Line(lGeo, mat);
      lineGroup.add(lMesh);
      contourLines.push({ line: lMesh, index: l });
    }
    scene.add(lineGroup);

    var ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    var keyLight = new THREE.DirectionalLight(0xfaf9f6, 1.7);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    var crimsonRim = new THREE.PointLight(0xc8102e, 3.4, 16);
    crimsonRim.position.set(-2.5, 1.2, 2.2);
    scene.add(crimsonRim);

    var cobaltRim = new THREE.PointLight(0x0ea5e9, 2.4, 15);
    cobaltRim.position.set(2.8, 1.5, 1.8);
    scene.add(cobaltRim);

    var pointerX = 0;
    var pointerY = 0;
    var targetX = 0;
    var targetY = 0;

    parent.addEventListener(
      "pointermove",
      function (e) {
        var rect = parent.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      },
      { passive: true }
    );

    var isVisible = true;
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      });
      obs.observe(canvas);
    }

    window.addEventListener("resize", function () {
      var nw = parent.clientWidth || window.innerWidth;
      var nh = parent.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh, false);
    });

    var clock = new THREE.Clock();

    function renderFrame() {
      requestAnimationFrame(renderFrame);
      if (!isVisible) return;

      var t = prefersReducedMotion ? 0.5 : clock.getElapsedTime();
      pointerX += (targetX - pointerX) * 0.05;
      pointerY += (targetY - pointerY) * 0.05;
      heroWavePulse *= 0.93;

      crimsonRim.color.setHex(activeHeroAccentHex);

      var pos = geometry.attributes.position.array;
      var amp = 0.24 + heroWavePulse * 0.38;

      for (var i = 0; i < pos.length; i += 3) {
        var bx = basePositions[i];
        var by = basePositions[i + 1];
        var bz = basePositions[i + 2];
        var wave =
          Math.sin(bx * 0.8 + t * 0.92) *
            Math.cos(bz * 1.05 - t * 0.55) *
            amp +
          Math.sin(bx * 1.85 - t * 1.25) * 0.065;
        pos[i + 1] = by + wave;
      }
      geometry.attributes.position.needsUpdate = true;

      for (var c = 0; c < contourLines.length; c++) {
        var cl = contourLines[c];
        var cArr = cl.line.geometry.attributes.position.array;
        var offsetZ = (cl.index / 8 - 0.5) * 3.0;
        for (var j = 0; j <= 72; j++) {
          var cx = (j / 72 - 0.5) * 10.5;
          var cy =
            Math.sin(cx * 0.8 + t * 0.92 + cl.index * 0.28) *
              (0.3 + heroWavePulse * 0.34) +
            0.14;
          cArr[j * 3 + 1] = cy;
          cArr[j * 3 + 2] = offsetZ;
        }
        cl.line.geometry.attributes.position.needsUpdate = true;
      }

      ribbonMesh.rotation.z = pointerX * 0.065;
      ribbonMesh.rotation.x = pointerY * 0.05;
      lineGroup.rotation.z = pointerX * 0.065;
      lineGroup.rotation.x = pointerY * 0.05;
      crimsonRim.position.x = -2.0 + pointerX * 2.8;
      cobaltRim.position.x = 2.2 - pointerX * 2.4;

      renderer.render(scene, camera);
    }

    renderFrame();
  }

  /* ==========================================================================
     2. HERO MACHINE SWITCHER (Synchronized with Three.js Chromatic Pulse)
     ========================================================================== */
  function initHeroSwitcher() {
    var $slides = $(".ed-hero-slide");
    var $btns = $(".ed-switch-btn");
    if (!$slides.length || !$btns.length) return;

    var currentIndex = 0;
    var timer = null;

    function activateSlide(index) {
      currentIndex = index;
      $slides.removeClass("is-active").eq(index).addClass("is-active");
      $btns
        .removeClass("is-active")
        .attr("aria-selected", "false")
        .eq(index)
        .addClass("is-active")
        .attr("aria-selected", "true");
      heroWavePulse = 1.0;
      activeHeroAccentHex =
        heroAccentColors[index % heroAccentColors.length] || 0xc8102e;
    }

    $btns.on("click", function () {
      var idx = $(this).index();
      activateSlide(idx);
      restartAuto();
    });

    function restartAuto() {
      if (prefersReducedMotion) return;
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        var next = (currentIndex + 1) % $slides.length;
        activateSlide(next);
      }, 6500);
    }

    $(".ed-hero-monolith")
      .on("mouseenter", function () {
        if (timer) clearInterval(timer);
      })
      .on("mouseleave", function () {
        restartAuto();
      });

    restartAuto();
  }

  /* ==========================================================================
     3. PROCEDURAL AERO CANVAS IN PINNED SERVICES STAGE
     ========================================================================== */
  var activeServiceSeed = 1.2;

  function initServicesAeroCanvas() {
    var canvas = document.getElementById("services-abstract-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var isVisible = false;
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      });
      obs.observe(canvas);
    } else {
      isVisible = true;
    }

    function resize() {
      var p = canvas.parentElement;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = (p.clientWidth || 480) * dpr;
      canvas.height = (p.clientHeight || 540) * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    var phase = 0;
    var currentFreq = 1.2;

    function draw() {
      requestAnimationFrame(draw);
      if (!isVisible) return;

      if (!prefersReducedMotion) {
        phase += 0.015;
      }
      currentFreq += (activeServiceSeed - currentFreq) * 0.06;

      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var lines = 20;
      for (var i = 0; i < lines; i++) {
        var norm = i / (lines - 1);
        ctx.beginPath();
        for (var x = 0; x <= w; x += 10) {
          var nx = x / w;
          var y =
            h * (0.24 + norm * 0.52) +
            Math.sin(nx * (3.2 + currentFreq) + phase + norm * 2.4) * (h * 0.075) +
            Math.cos(nx * 5.8 - phase * 0.75) * (h * 0.025);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        if (i === 10) {
          ctx.strokeStyle = "rgba(200, 16, 46, 0.85)";
          ctx.lineWidth = 2;
        } else if (i === 6) {
          ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
          ctx.lineWidth = 1.3;
        } else if (i === 14) {
          ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
          ctx.lineWidth = 1.3;
        } else {
          ctx.strokeStyle = "rgba(244, 243, 239, 0.14)";
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }
    }

    draw();
  }

  /* ==========================================================================
     4. INTERACTIVE & SCROLL-SYNCHRONIZED SERVICES LEDGER
     ========================================================================== */
  function activateServiceRow($row) {
    if (!$row || !$row.length) return;
    var $rows = $(".ed-service-row");
    $rows.removeClass("is-active");
    $row.addClass("is-active");

    var newImg = $row.attr("data-image");
    var newDisc = $row.attr("data-discipline");
    var newIdx = $row.attr("data-idx");
    var newSpec = $row.attr("data-spec");
    var newTitle = $row.find("h3").text();
    var newDesc = $row.find("p").text();
    var seed = parseFloat($row.attr("data-seed") || "1.2");

    activeServiceSeed = seed;
    if (newDisc) $("#service-stage-discipline").text(newDisc);
    if (newIdx) $("#service-stage-counter").text(newIdx);
    if (newTitle) $("#service-stage-title").text(newTitle);
    if (newDesc) $("#service-stage-desc").text(newDesc);
    if (newSpec) $("#service-stage-spec").text(newSpec);

    var $img = $("#service-stage-img");
    if (newImg && $img.attr("src") !== newImg) {
      $img.css("opacity", 0.32);
      setTimeout(function () {
        $img.attr("src", newImg).css("opacity", 0.9);
      }, 130);
    }
  }

  function initServicesLedger() {
    var $rows = $(".ed-service-row");
    if (!$rows.length) return;

    $rows.on("mouseenter focus click", function () {
      activateServiceRow($(this));
    });

    $(document).on("click", ".js-commission-pick", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var serviceName = $(this).attr("data-service");
      var $msg = $("#message");
      if (serviceName && $msg.length) {
        var currentVal = $.trim($msg.val());
        var prefix = "Commission inquiry: " + serviceName + "\n";
        if (currentVal.indexOf("Commission inquiry:") === 0) {
          $msg.val(
            currentVal.replace(/^Commission inquiry:[^\n]*\n?/, prefix)
          );
        } else {
          $msg.val(prefix + currentVal);
        }
      }
      var $contact = $("#contact");
      if ($contact.length) {
        var navH = $("#mainNav").outerHeight() || 72;
        window.scrollTo({
          top: $contact.offset().top - navH + 8,
          behavior: "smooth",
        });
        setTimeout(function () {
          $("#name").trigger("focus");
        }, 650);
      }
    });
  }

  /* ==========================================================================
     5. ANIMATED ABSTRACT TOPOGRAPHIC BACKGROUND FOR "COMMISSION A BUILD"
     ========================================================================== */
  function initContactAbstractCanvas() {
    var canvas = document.getElementById("contact-abstract-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var section = document.getElementById("contact");
    var isVisible = false;
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      });
      obs.observe(section);
    } else {
      isVisible = true;
    }

    var pointerX = 0.5;
    var pointerY = 0.5;
    var targetX = 0.5;
    var targetY = 0.5;

    section.addEventListener(
      "pointermove",
      function (e) {
        var rect = section.getBoundingClientRect();
        targetX = (e.clientX - rect.left) / Math.max(1, rect.width);
        targetY = (e.clientY - rect.top) / Math.max(1, rect.height);
      },
      { passive: true }
    );

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = (section.clientWidth || window.innerWidth) * dpr;
      canvas.height = (section.clientHeight || 820) * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    var t = 0;

    function render() {
      requestAnimationFrame(render);
      if (!isVisible) return;

      if (!prefersReducedMotion) {
        t += 0.0085;
      }
      pointerX += (targetX - pointerX) * 0.04;
      pointerY += (targetY - pointerY) * 0.04;

      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var totalLines = 32;
      for (var i = 0; i < totalLines; i++) {
        var p = i / (totalLines - 1);
        ctx.beginPath();

        for (var x = 0; x <= w; x += 18) {
          var nx = x / w;
          var dx = nx - pointerX;
          var dy = p - pointerY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var influence = Math.max(0, 1 - dist * 2.1);

          var wave1 =
            Math.sin(nx * 4.2 + t * 1.4 + p * 3.1) * (h * 0.065);
          var wave2 =
            Math.cos(nx * 7.5 - t * 0.9 + p * 1.8) * (h * 0.024);
          var mouseBend =
            Math.sin(dist * 10 - t * 2.2) * influence * (h * 0.045);

          var y =
            h * (0.08 + p * 0.84) + wave1 + wave2 + mouseBend;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (i === 14 || i === 15) {
          ctx.strokeStyle = "rgba(200, 16, 46, 0.28)";
          ctx.lineWidth = 1.6;
        } else if (i % 4 === 0) {
          ctx.strokeStyle = "rgba(17, 17, 19, 0.11)";
          ctx.lineWidth = 1.15;
        } else {
          ctx.strokeStyle = "rgba(17, 17, 19, 0.055)";
          ctx.lineWidth = 0.85;
        }
        ctx.stroke();
      }
    }

    render();
  }

  /* ==========================================================================
     6. GSAP + SCROLLTRIGGER CHOREOGRAPHY
     ========================================================================== */
  function initGSAPMotion() {
    if (
      prefersReducedMotion ||
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) {
      $(".ed-scrub-word").css("opacity", 1);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".js-hero-reveal", {
      y: 24,
      opacity: 0,
      duration: 0.9,
      stagger: 0.09,
      ease: "power3.out",
    });

    var scrubWords = gsap.utils.toArray(".ed-scrub-word");
    if (scrubWords.length) {
      gsap.to(scrubWords, {
        opacity: 1,
        ease: "none",
        stagger: 0.06,
        scrollTrigger: {
          trigger: ".ed-manifesto-band",
          start: "top 78%",
          end: "bottom 52%",
          scrub: true,
        },
      });
    }

    // Desktop Scroll Pinning for BOTH #machines and #services
    ScrollTrigger.matchMedia({
      "(min-width: 992px)": function () {
        ScrollTrigger.create({
          trigger: "#machines .ed-pinned-grid",
          start: "top 104px",
          end: "bottom bottom",
          pin: "#machines .ed-pinned-left",
          pinSpacing: false,
        });

        ScrollTrigger.create({
          trigger: "#services .ed-services-pinned-grid",
          start: "top 92px",
          end: "bottom bottom",
          pin: "#services .ed-services-pinned-left",
          pinSpacing: false,
        });
      },
    });

    var monographs = gsap.utils.toArray(".ed-monograph");
    monographs.forEach(function (mono) {
      var label = mono.getAttribute("data-monograph-index");
      ScrollTrigger.create({
        trigger: mono,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: function () {
          if (label) $("#machines-active-chapter").text(label);
        },
        onEnterBack: function () {
          if (label) $("#machines-active-chapter").text(label);
        },
      });
    });

    var serviceRows = gsap.utils.toArray(".ed-service-row");
    serviceRows.forEach(function (rowEl) {
      ScrollTrigger.create({
        trigger: rowEl,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: function () {
          activateServiceRow($(rowEl));
        },
        onEnterBack: function () {
          activateServiceRow($(rowEl));
        },
      });
    });

    var plates = gsap.utils.toArray(".ed-plate-visual");
    plates.forEach(function (plate) {
      gsap.fromTo(
        plate,
        { scale: 0.94, opacity: 0.72 },
        {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: plate,
            start: "top 90%",
            end: "top 40%",
            scrub: 0.5,
          },
        }
      );
    });
  }

  /* ==========================================================================
     7. LIVE EDMONTON WORKSHOP CLOCK IN FOOTER COLOPHON
     ========================================================================== */
  function initEdmontonClock() {
    var el = document.getElementById("edmonton-live-clock");
    if (!el) return;

    function updateClock() {
      try {
        var fmt = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Edmonton",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        el.textContent = fmt.format(new Date()) + " MST";
      } catch (e) {
        el.textContent = "Edmonton, AB";
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ==========================================================================
     8. NAVIGATION, GALLERY ISOTOPE, LIGHTBOX & CONTACT FORM CONTRACTS
     ========================================================================== */
  var nav = $("nav");
  var navHeight = nav.outerHeight() || 72;

  $(".navbar-toggler").on("click", function () {
    if (!$("#mainNav").hasClass("navbar-reduce")) {
      $("#mainNav").addClass("navbar-reduce");
    }
  });

  $(document).on("click", function (e) {
    var $menu = $("#navbarDefault");
    if (
      $menu.hasClass("show") &&
      !$(e.target).closest("#navbarDefault, .navbar-toggler").length
    ) {
      $menu.collapse("hide");
    }
  });

  $(window).on("scroll", function () {
    var scrolled = $(window).scrollTop();
    if (scrolled > 70) {
      $(".navbar-expand-lg").addClass("navbar-reduce").removeClass("navbar-trans");
    } else {
      $(".navbar-expand-lg").addClass("navbar-trans").removeClass("navbar-reduce");
    }
    if (scrolled > 300) $(".back-to-top").addClass("active");
    else $(".back-to-top").removeClass("active");
  });

  $(".back-to-top, #footer-top-trigger").on("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $('a.js-scroll[href*="#"]:not([href="#"])').on("click", function (e) {
    if (
      location.pathname.replace(/^\//, "") ===
        this.pathname.replace(/^\//, "") &&
      location.hostname === this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        e.preventDefault();
        window.scrollTo({
          top: target.offset().top - navHeight + 8,
          behavior: "smooth",
        });
      }
    }
  });

  $(".js-scroll").on("click", function () {
    $(".navbar-collapse").collapse("hide");
  });

  $("body").scrollspy({
    target: "#mainNav",
    offset: navHeight + 16,
  });

  $(".gallery-container").magnificPopup({
    delegate: ".popimg",
    type: "image",
    gallery: {
      enabled: true,
    },
  });

  $(document).ready(function () {
    $(".popup-gmaps").magnificPopup({
      disableOn: 700,
      type: "iframe",
      mainClass: "mfp-fade",
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false,
    });

    initEditorialCursor();
    initHeroThreeJS();
    initHeroSwitcher();
    initServicesAeroCanvas();
    initServicesLedger();
    initContactAbstractCanvas();
    initEdmontonClock();
    initGSAPMotion();
  });

  $(window).on("load", function () {
    var PAGE_SIZE = 12;
    var $galleryItems = $(".gallery-grid-item");
    var $loadMore = $("#gallery-load-more");
    var activeFilter = $("#gallery-flters li:first").data("filter");
    var visibleCount = PAGE_SIZE;

    var galleryIsotope = $(".gallery-container").isotope({
      itemSelector: ".gallery-grid-item",
    });

    function applyGalleryFilter() {
      var matched = $galleryItems.filter(activeFilter);
      $galleryItems.removeClass("gallery-page-visible");
      matched.slice(0, visibleCount).addClass("gallery-page-visible");
      $loadMore.toggle(matched.length > visibleCount);
      galleryIsotope.isotope({ filter: ".gallery-page-visible" });
      if (typeof ScrollTrigger !== "undefined") {
        setTimeout(function () {
          ScrollTrigger.refresh();
        }, 350);
      }
    }

    applyGalleryFilter();

    $("#gallery-flters li").on("click", function () {
      $("#gallery-flters li").removeClass("filter-active");
      $(this).addClass("filter-active");
      activeFilter = $(this).data("filter");
      visibleCount = PAGE_SIZE;
      applyGalleryFilter();
    });

    $loadMore.on("click", function () {
      visibleCount += PAGE_SIZE;
      applyGalleryFilter();
    });

    jQuery(".preloader").delay(250).fadeOut("fast");
  });

  var RECAPTCHA_SITE_KEY = "6LeFv_kpAAAAAGAya7K3pj9u5n3mI7ugnyBctIWr";
  var CONTACT_API_URL =
    "https://ja6439b71i.execute-api.ca-central-1.amazonaws.com/prd/contact-us";
  var $contactForm = $("#recaptcha-contact-form");
  var $formMsg = $("#form-msg");

  function showFormMessage(text, type) {
    $formMsg.removeClass("success error animate__fadeIn animate__animated");
    $formMsg.text(text);
    if (type) {
      $formMsg.addClass(type + " animate__animated animate__fadeIn");
    }
  }

  function sendContactForm(token) {
    var formdata = {
      name: $("#name").val(),
      phone: $("#phone").val(),
      email: $("#email").val(),
      contact_method: $("#contact_method").val(),
      message: $("#message").val(),
      token: token,
      action: "contact_submit",
    };

    $.ajax({
      type: "POST",
      url: CONTACT_API_URL,
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(formdata),
      success: function (data) {
        if (String(data.statusCode) === "200") {
          showFormMessage("Thank you. Your commission inquiry has been sent.", "success");
          $contactForm[0].reset();
        } else if (String(data.statusCode) === "401") {
          showFormMessage("Verification timed out. Please try again in a moment.", "error");
        } else {
          showFormMessage("Connection failed. Please refresh and try again.", "error");
        }
      },
      error: function () {
        showFormMessage("Connection failed. Please try again.", "error");
      },
    });
  }

  $contactForm.on("submit", function (e) {
    e.preventDefault();
    showFormMessage("", "");

    if (typeof grecaptcha !== "undefined" && grecaptcha.ready) {
      grecaptcha.ready(function () {
        grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" })
          .then(sendContactForm, function () {
            showFormMessage("Verification failed. Please try again.", "error");
          });
      });
    } else {
      showFormMessage("Verification service unavailable. Please call us directly.", "error");
    }
  });

  (function () {
    var section = document.getElementById("review");
    var widget =
      section &&
      section.querySelector(".elfsight-app-43f1c437-13cd-47ba-af38-c870c24568be");
    if (!widget || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      setTimeout(function () {
        if (!widget.children.length) {
          section.style.display = "none";
          $('a.nav-link[href="#review"]').closest("li").hide();
        }
      }, 3000);
    });
    observer.observe(widget);
  })();
})(jQuery);
