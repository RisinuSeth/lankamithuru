(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile navigation works on every page without assuming page-specific markup.
  const menuButton = $("#menuToggle");
  const nav = $(".main-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menuButton.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
      nav.classList.toggle("open", !expanded);
    });
    $$("a", nav).forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        menuButton.focus();
      }
    });
  }

  // One searchable index shared by the homepage and the three divisions.
  const searchable = [
    { title:"Explore Sri Lanka", terms:"destinations places travel tourism island", target:"explore.html", type:"EXPLORE" },
    { title:"Beaches & coast", terms:"beach sea ocean surf coast", target:"explore.html#categories", type:"EXPLORE" },
    { title:"Hills & nature", terms:"mountain hills nature forest waterfall", target:"explore.html#categories", type:"EXPLORE" },
    { title:"Culture & heritage", terms:"culture heritage history ancient", target:"explore.html#categories", type:"EXPLORE" },
    { title:"Food & flavour", terms:"food restaurants cuisine cafes", target:"explore.html#categories", type:"EXPLORE" },
    { title:"Places to stay", terms:"hotels accommodation stays guest houses", target:"explore.html#categories", type:"EXPLORE" },
    { title:"Things to do", terms:"activities experiences outings", target:"explore.html#categories", type:"EXPLORE" },
    { title:"Local businesses", terms:"business shop local directory companies", target:"hub.html#directory", type:"HUB" },
    { title:"Services & professionals", terms:"services professionals repair help", target:"hub.html#directory", type:"HUB" },
    { title:"Jobs & opportunities", terms:"jobs careers vacancies opportunities", target:"hub.html#opportunities", type:"HUB" },
    { title:"Events & activities", terms:"events happenings calendar activities", target:"hub.html#opportunities", type:"HUB" },
    { title:"Community resources", terms:"community local information resources", target:"hub.html#directory", type:"HUB" },
    { title:"Advanced Level resources", terms:"a/l al advanced level subjects notes", target:"edu.html#resources", type:"EDU" },
    { title:"Ordinary Level resources", terms:"o/l ol ordinary level subjects notes", target:"edu.html#resources", type:"EDU" },
    { title:"Past papers", terms:"past papers exam answers revision", target:"edu.html#resources", type:"EDU" },
    { title:"Notes & study guides", terms:"study guides learning resources notes", target:"edu.html#resources", type:"EDU" },
    { title:"Courses & skills", terms:"courses skills training learning", target:"edu.html#resources", type:"EDU" }
  ];

  const modal = $("#searchModal");
  const searchInput = $("#siteSearch");
  const results = $("#searchResults");
  const openButtons = [$("#openSearch"), $("#heroSearch")].filter(Boolean);
  const closeButton = $("#closeSearch");
  let previousFocus = null;

  function renderSearch(query = "") {
    if (!results) return;
    const term = query.trim().toLocaleLowerCase();
    const matches = term
      ? searchable.filter(item => (item.title + " " + item.terms).toLocaleLowerCase().includes(term))
      : searchable.slice(0, 5);
    results.replaceChildren();
    const label = document.createElement("span");
    label.className = "results-label";
    label.textContent = term ? (matches.length ? "MATCHING DISCOVERIES" : "NO MATCHES YET") : "QUICK DISCOVERIES";
    results.append(label);
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "search-hint";
      empty.textContent = "Try travel, businesses, jobs or study.";
      results.append(empty);
      return;
    }
    matches.slice(0, 8).forEach(item => {
      const link = document.createElement("a");
      link.href = item.target;
      link.className = "search-result-link";
      const title = document.createElement("span");
      title.textContent = item.title;
      const type = document.createElement("small");
      type.textContent = item.type;
      const arrow = document.createElement("b");
      arrow.textContent = "↗";
      link.append(title, type, arrow);
      results.append(link);
    });
  }

  function openSearch(query = "") {
    if (!modal || !searchInput) return;
    previousFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("search-open");
    searchInput.value = query;
    renderSearch(query);
    window.requestAnimationFrame(() => searchInput.focus());
  }
  function closeSearch() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("search-open");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }
  openButtons.forEach(button => button.addEventListener("click", () => openSearch()));
  closeButton?.addEventListener("click", closeSearch);
  searchInput?.addEventListener("input", event => renderSearch(event.target.value));
  modal?.addEventListener("click", event => { if (event.target === modal) closeSearch(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal?.classList.contains("open")) closeSearch();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && modal) {
      event.preventDefault();
      openSearch();
    }
  });
  $$("[data-search-term]").forEach(link => link.addEventListener("click", event => {
    if (!modal || !searchInput) return;
    event.preventDefault();
    openSearch(link.dataset.searchTerm || "");
  }));

  // Hero video carousel: play each scene once in a strict sequence.
  // Advance on the clip's timeline (or when it ends), never on overlapping timers.
  const hero = $(".hero-video-backdrop");
  if (hero) {
    const videos = $$(".hero-bg-video", hero);
    const bars = $$(".hero-video-progress span", hero);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxSceneSeconds = 13.5;
    const loadTimeout = 18000;
    let current = -1;
    let pending = -1;
    let loadTimer = 0;
    let userGestureSeen = false;
    let switching = false;
    const failedVideos = new Set();

    const clearLoadTimer = () => {
      window.clearTimeout(loadTimer);
      loadTimer = 0;
    };
    const markProgress = index => bars.forEach((bar, i) => bar.classList.toggle("is-current", i === index));

    function nextAvailable(from) {
      for (let step = 1; step <= videos.length; step += 1) {
        const candidate = (from + step) % videos.length;
        if (!failedVideos.has(candidate)) return candidate;
      }
      return -1;
    }

    function beginNext(from = current) {
      if (switching || document.hidden || reducedMotion) return;
      const next = nextAvailable(from);
      if (next < 0) return;
      switching = true;
      playCandidate(next);
    }

    function handleFailure(index) {
      if (pending !== index) return;
      clearLoadTimer();
      failedVideos.add(index);
      videos[index].dataset.videoState = "error";
      try { videos[index].pause(); } catch (_) {}
      pending = -1;
      switching = false;
      if (failedVideos.size < videos.length) beginNext(index);
    }

    function playCandidate(index) {
      if (!videos.length || document.hidden || reducedMotion || pending !== -1) {
        switching = false;
        return;
      }
      if (failedVideos.has(index)) {
        switching = false;
        beginNext(index);
        return;
      }
      const video = videos[index];
      pending = index;
      video.dataset.videoState = "loading";
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = false;
      video.removeAttribute("loop");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      const source = video.dataset.videoSource;
      if (!source) {
        handleFailure(index);
        return;
      }
      if (video.dataset.loadedSource !== source) {
        video.src = source;
        video.dataset.loadedSource = source;
        video.load();
      }

      clearLoadTimer();
      loadTimer = window.setTimeout(() => {
        if (pending === index && video.dataset.videoState !== "playing") handleFailure(index);
      }, loadTimeout);

      const attemptPlay = () => {
        if (pending !== index || document.hidden) return;
        video.play().catch(() => {
          video.dataset.videoState = "blocked";
          if (userGestureSeen) handleFailure(index);
        });
      };
      if (video.readyState >= 2) attemptPlay();
      else video.addEventListener("canplay", attemptPlay, { once: true });
    }

    videos.forEach((video, index) => {
      video.addEventListener("playing", () => {
        if (pending !== index) return;
        clearLoadTimer();
        const previous = current;
        current = index;
        pending = -1;
        switching = false;
        video.dataset.videoState = "playing";
        video.loop = false;
        video.style.zIndex = "1";
        video.classList.add("is-visible");
        if (previous >= 0 && previous !== index) {
          videos[previous].style.zIndex = "0";
          videos[previous].classList.remove("is-visible");
          try { videos[previous].pause(); } catch (_) {}
        }
        markProgress(index);
      });

      video.addEventListener("timeupdate", () => {
        if (current !== index || switching || document.hidden) return;
        if (video.currentTime >= maxSceneSeconds) beginNext(index);
      });

      video.addEventListener("ended", () => {
        if (current === index && !switching) beginNext(index);
      });

      video.addEventListener("error", () => {
        if (pending === index) handleFailure(index);
        else if (current === index && !switching) {
          failedVideos.add(index);
          beginNext(index);
        }
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearLoadTimer();
        pending = -1;
        switching = false;
        videos.forEach(video => { try { video.pause(); } catch (_) {} });
      } else if (current >= 0) {
        const active = videos[current];
        active.play().catch(() => {});
      } else {
        switching = false;
        playCandidate(0);
      }
    });

    document.addEventListener("pointerdown", () => {
      userGestureSeen = true;
      if (pending >= 0 && !document.hidden) videos[pending].play().catch(() => {});
      else if (current >= 0 && !document.hidden && videos[current].paused) videos[current].play().catch(() => {});
    }, { once: true, passive: true });

    if (!reducedMotion) playCandidate(0);
  }

  // Crossfade through real scenes from Sri Lanka for Explore, Hub and Edu.
  // Each division rotates independently and skips images that fail to load.
  const photoRotations = $$(".photo-rotation[data-photo-rotation]");
  const reducedPhotoMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedPhotoMotion) {
    photoRotations.forEach((gallery, galleryIndex) => {
      const frames = $$(".photo-frame", gallery);
      if (frames.length < 2) return;
      let active = Math.max(0, frames.findIndex(frame => frame.classList.contains("is-active")));
      const activateNext = () => {
        for (let step = 1; step <= frames.length; step += 1) {
          const next = (active + step) % frames.length;
          const frame = frames[next];
          if (frame.classList.contains("is-broken")) continue;
          frame.loading = "eager";
          frame.addEventListener("error", () => {
            frame.classList.add("is-broken");
            if (frame.classList.contains("is-active")) activateNext();
          }, { once: true });
          if (frame.complete && frame.naturalWidth === 0) {
            frame.classList.add("is-broken");
            continue;
          }
          frames[active]?.classList.remove("is-active");
          frame.classList.add("is-active");
          active = next;
          return;
        }
      };
      frames.forEach(frame => frame.addEventListener("error", () => {
        frame.classList.add("is-broken");
        if (frame.classList.contains("is-active")) activateNext();
      }, { once: true }));
      window.setTimeout(() => {
        window.setInterval(() => {
          const rect = gallery.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) activateNext();
        }, 5200);
      }, galleryIndex * 1250);
    });
  }
})();