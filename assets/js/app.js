(() => {
  "use strict";

  const normalizePhotos = (photos) =>
    (photos || [])
      .map((photo) => {
        if (photo.images?.length) return photo;
        if (!photo.src) return { ...photo, images: [] };
        return {
          ...photo,
          images: [{
            src: photo.src,
            width: photo.width,
            height: photo.height,
            alt: photo.alt || { en: "", es: "" }
          }]
        };
      })
      .filter((photo) => photo.images.length > 0);

  const PHOTOS = normalizePhotos(window.PHOTOS);
  const I18N = window.I18N || { en: {}, es: {} };
  const CATEGORIES = ["all", "birds", "mammals", "herps", "insects", "plants", "landscapes", "architecture"];
  const DEFAULTS = { q: "", category: "all", family: "all", place: "all", sort: "curated" };

  const state = { lang: "en", ...DEFAULTS };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const t = (key) => I18N[state.lang][key];
  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const els = {
    search: $("#search"),
    chips: $("#chips"),
    family: $("#family"),
    place: $("#place"),
    sort: $("#sort"),
    resultCount: $("#resultCount"),
    clear: $("#clear"),
    featured: $("#featured"),
    grid: $("#grid"),
    empty: $("#empty"),
    viewer: $("#viewer"),
    viewerPlate: $("#viewerPlate"),
    viewerCat: $("#viewerCat"),
    viewerImg: $("#viewerImg"),
    viewerThumbs: $("#viewerThumbs"),
    viewerInfo: $("#viewerInfo"),
    viewerPrev: $("#viewerPrev"),
    viewerNext: $("#viewerNext"),
    viewerImagePrev: $("#viewerImagePrev"),
    viewerImageNext: $("#viewerImageNext"),
    viewerClose: $("#viewerClose"),
    credits: $("#credits"),
    creditsList: $("#creditsList"),
    langButtons: $$("[data-lang]"),
    ledgerTop: $("#ledgerTop"),
    ledgerBottom: $("#ledgerBottom")
  };

  let visiblePhotos = [];
  let activeIndex = -1;
  let viewerImageIndex = 0;

  const carouselTimers = new Map();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- language ---------------- */

  function readInitialState() {
    const params = new URLSearchParams(window.location.search);
    let saved = "en";
    try {
      saved = localStorage.getItem("mfh-lang") || "en";
    } catch (_) {
      /* storage unavailable */
    }
    state.lang = params.get("lang") === "es" || params.get("lang") === "en"
      ? params.get("lang")
      : saved === "es" ? "es" : "en";

    state.q = params.get("q") || "";
    state.category = CATEGORIES.includes(params.get("cat")) ? params.get("cat") : "all";
    state.family = params.get("family") || "all";
    state.place = params.get("place") || "all";
    state.sort = ["curated", "newest", "name"].includes(params.get("sort")) ? params.get("sort") : "curated";
    els.search.value = state.q;
  }

  function applyStaticText() {
    document.documentElement.lang = state.lang;
    document.title = t("metaTitle");
    const description = $('meta[name="description"]');
    if (description) description.setAttribute("content", t("metaDescription"));

    $$("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    $$("[data-i18n-html]").forEach((node) => {
      node.innerHTML = t(node.dataset.i18nHtml);
    });
    $$("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
    });
    $$("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });

    els.langButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
    });

    renderLedger();
  }

  function renderLedger() {
    const species = new Set(PHOTOS.filter((photo) => photo.sci).map((photo) => photo.sci)).size;
    const families = new Set(
      PHOTOS
        .filter((photo) => photo.family && photo.family.sci && photo.family.sci !== "—")
        .map((photo) => photo.family.sci)
    ).size;
    const values = { plates: PHOTOS.length, species, families };
    const isEs = state.lang === "es";
    const plateWord = isEs
      ? values.plates === 1 ? "lámina" : "láminas"
      : values.plates === 1 ? "plate" : "plates";
    const speciesWord = isEs
      ? values.species === 1 ? "especie" : "especies"
      : values.species === 1 ? "species" : "species";
    const familyWord = isEs
      ? values.families === 1 ? "familia" : "familias"
      : values.families === 1 ? "family" : "families";
    els.ledgerTop.textContent = `${values.plates} ${plateWord} · ${values.species} ${speciesWord}`;
    els.ledgerBottom.textContent = isEs
      ? `${values.families} ${familyWord} · un país pequeño`
      : `${values.families} ${familyWord} · one small country`;
  }

  function setLanguage(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    try {
      localStorage.setItem("mfh-lang", lang);
    } catch (_) {
      /* storage unavailable */
    }
    applyStaticText();
    buildChips();
    buildSelects();
    render();
    if (els.viewer.open && activeIndex >= 0) {
      renderViewer(visiblePhotos[activeIndex]);
    }
    syncUrl();
  }

  /* ---------------- filtering ---------------- */

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const CATEGORY_SYNONYMS = {
    herps: ["herpetofauna", "herpetology", "herpeto", "reptiles", "amphibians"],
    architecture: ["architectural", "building", "buildings", "structure", "structures", "arquitectonico", "arquitectonica", "edificio", "edificios"]
  };

  function searchIndex(photo) {
    const category = photo.category;
    const categoryWords = [
      category,
      I18N.en.categoryNames?.[category],
      I18N.en.categorySingular?.[category],
      I18N.es.categoryNames?.[category],
      I18N.es.categorySingular?.[category],
      ...(CATEGORY_SYNONYMS[category] || [])
    ].filter(Boolean);
    return normalize([
      photo.name?.en,
      photo.name?.es,
      photo.sci,
      photo.family?.sci,
      photo.family?.en,
      photo.family?.es,
      photo.location?.en,
      photo.location?.es,
      photo.note?.en,
      photo.note?.es,
      photo.plate,
      photo.date,
      ...(photo.tags || []),
      ...(photo.images || []).flatMap((image) => [image?.alt?.en, image?.alt?.es]),
      ...categoryWords
    ].filter(Boolean).join(" "));
  }

  const indexCache = new Map(PHOTOS.map((photo) => [photo.id, searchIndex(photo)]));

  function filteredPhotos() {
    const tokens = normalize(state.q).split(/\s+/).filter(Boolean);

    let photos = PHOTOS.filter((photo) => {
      if (state.category !== "all" && photo.category !== state.category) return false;
      if (state.family !== "all" && photo.family.sci !== state.family) return false;
      if (state.place !== "all" && photo.location.en !== state.place) return false;
      if (!tokens.length) return true;
      const haystack = indexCache.get(photo.id);
      return tokens.every((token) =>
        new RegExp(`(^|[^a-z0-9])${escapeRegExp(token)}`).test(haystack)
      );
    });

    if (state.sort === "newest") {
      photos = photos.sort((a, b) => b.date.localeCompare(a.date));
    } else if (state.sort === "name") {
      const collator = new Intl.Collator(state.lang, { sensitivity: "base" });
      photos = photos.sort((a, b) => collator.compare(a.name[state.lang], b.name[state.lang]));
    }

    return photos;
  }

  function hasActiveFilters() {
    return Boolean(
      state.q ||
      state.category !== DEFAULTS.category ||
      state.family !== DEFAULTS.family ||
      state.place !== DEFAULTS.place ||
      state.sort !== DEFAULTS.sort
    );
  }

  /* ---------------- rendering ---------------- */

  function categoryLabel(photo) {
    return t("categorySingular")[photo.category] || photo.category;
  }

  function exifMarkup(photo) {
    return `
      <dl class="plate__exif">
        <div><dt>${esc(t("shutter"))}</dt><dd>${esc(photo.exif.shutter)}</dd></div>
        <div><dt>${esc(t("aperture"))}</dt><dd>${esc(photo.exif.aperture)}</dd></div>
        <div><dt>${esc(t("iso"))}</dt><dd>${esc(photo.exif.iso)}</dd></div>
        <div><dt>${esc(t("focalShort"))}</dt><dd>${esc(photo.exif.focal)}</dd></div>
      </dl>`;
  }

  function plateMarkup(photo, index, featured = false) {
    const name = photo.name[state.lang];
    const family =
      photo.family.sci && photo.family.sci !== "—"
        ? `<span><span class="plate__factlabel">${esc(t("family"))}</span> ${esc(photo.family[state.lang])} <span class="plate__sci-inline">${esc(photo.family.sci)}</span></span>`
        : "";
    const delay = Math.min(index * 45, 260);
    const cover = photo.images[0];
    const slides = photo.images.map((image, imageIndex) => `
              <img class="plate__slide${imageIndex === 0 ? " is-active" : ""}"
                   src="${esc(image.src)}" width="${image.width}" height="${image.height}"
                   alt="${esc(image.alt[state.lang])}" data-slide="${imageIndex}"
                   ${imageIndex > 0 ? 'aria-hidden="true"' : ""}
                   ${featured && imageIndex === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`).join("");
    const controls = photo.images.length > 1
      ? `
              <button class="plate__control plate__control--prev" type="button" data-carousel-control="-1" aria-label="${esc(t("prevImage"))}">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"></path></svg>
              </button>
              <button class="plate__control plate__control--next" type="button" data-carousel-control="1" aria-label="${esc(t("nextImage"))}">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"></path></svg>
              </button>
              <span class="plate__counter" aria-hidden="true"><span data-counter>1</span> / ${photo.images.length}</span>`
      : "";

    return `
      <article class="plate${featured ? " plate--featured" : ""}" style="--ar:${cover.width}/${cover.height}; --delay:${delay}ms">
        <a class="plate__link" href="#${esc(photo.id)}" data-photo="${esc(photo.id)}"
           aria-label="${esc(name)} — ${esc(t("openPlate"))}">
          <div class="plate__mount">
            <div class="plate__imgwrap" data-carousel>
              ${slides}
              ${controls}
            </div>
          </div>
          <div class="plate__body">
            <div class="plate__top">
              <span class="plate__no">${esc(t("plate"))} ${esc(photo.plate)}</span>
              <span class="plate__cat">${esc(categoryLabel(photo))}</span>
            </div>
            <h3 class="plate__name">${esc(name)}</h3>
            ${photo.sci ? `<p class="plate__sci">${esc(photo.sci)}</p>` : ""}
            <p class="plate__facts">
              ${family}
              <span><span class="plate__factlabel">${esc(t("place"))}</span> ${esc(photo.location[state.lang])}</span>
            </p>
            ${exifMarkup(photo)}
          </div>
        </a>
      </article>`;
  }

  function currentSlideIndex(wrap) {
    const slides = $$(".plate__slide", wrap);
    const index = slides.findIndex((slide) => slide.classList.contains("is-active"));
    return index < 0 ? 0 : index;
  }

  function setPlateSlide(wrap, index) {
    const slides = $$(".plate__slide", wrap);
    if (!slides.length) return;
    const next = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === next;
      slide.classList.toggle("is-active", active);
      if (active) slide.removeAttribute("aria-hidden");
      else slide.setAttribute("aria-hidden", "true");
    });
    const counter = $("[data-counter]", wrap);
    if (counter) counter.textContent = String(next + 1);
  }

  function stopPlateCarouselTimers(plate) {
    const timers = carouselTimers.get(plate);
    if (!timers) return;
    window.clearTimeout(timers.start);
    window.clearInterval(timers.interval);
    carouselTimers.delete(plate);
  }

  /* Auto-advance a plate while the pointer is over it (desktop hover). */
  function stopCarousel(plate) {
    stopPlateCarouselTimers(plate);
  }

  function clearCarousels() {
    [...carouselTimers.keys()].forEach(stopPlateCarouselTimers);
  }

  function initCarousels() {
    clearCarousels();
    $$("[data-carousel]").forEach((wrap) => {
      const plate = wrap.closest(".plate");
      const slides = $$(".plate__slide", wrap);
      const link = wrap.closest("[data-photo]");
      if (!plate || slides.length < 2) return;

      const startHoverAdvance = () => {
        if (carouselTimers.has(plate) || reduceMotion.matches) return;
        const advance = () => setPlateSlide(wrap, currentSlideIndex(wrap) + 1);
        const startTimer = window.setTimeout(() => {
          advance();
          const timers = carouselTimers.get(plate);
          if (timers) timers.interval = window.setInterval(advance, 2400);
        }, 900);
        carouselTimers.set(plate, { start: startTimer, interval: null });
      };

      plate.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        startHoverAdvance();
      });
      plate.addEventListener("pointerleave", () => stopPlateCarouselTimers(plate));

      $$("[data-carousel-control]", wrap).forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          stopPlateCarouselTimers(plate);
          if (link) link.dataset.suppressOpen = "1";
          setPlateSlide(wrap, currentSlideIndex(wrap) + Number(button.dataset.carouselControl));
          window.setTimeout(() => {
            if (link) delete link.dataset.suppressOpen;
          }, 0);
        });
      });

      /* Touch/mobile: swipe to change image, tap opens plate. */
      let swipe = null;
      wrap.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse") return;
        if (event.target.closest("[data-carousel-control]")) return;
        stopPlateCarouselTimers(plate);
        swipe = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          dx: 0,
          dy: 0,
          active: false
        };
      });

      wrap.addEventListener("pointermove", (event) => {
        if (!swipe || event.pointerId !== swipe.id) return;
        swipe.dx = event.clientX - swipe.x;
        swipe.dy = event.clientY - swipe.y;
        if (!swipe.active && Math.abs(swipe.dx) > 10 && Math.abs(swipe.dx) > Math.abs(swipe.dy)) {
          swipe.active = true;
          try { wrap.setPointerCapture(event.pointerId); } catch (_) {}
        }
        if (swipe.active) event.preventDefault();
      }, { passive: false });

      const finishSwipe = (event) => {
        if (!swipe || event.pointerId !== swipe.id) return;
        if (swipe.active && Math.abs(swipe.dx) > 34) {
          if (link) link.dataset.suppressOpen = "1";
          setPlateSlide(wrap, currentSlideIndex(wrap) + (swipe.dx < 0 ? 1 : -1));
          window.setTimeout(() => {
            if (link) delete link.dataset.suppressOpen;
          }, 350);
        }
        swipe = null;
      };

      wrap.addEventListener("pointerup", finishSwipe);
      wrap.addEventListener("pointercancel", () => { swipe = null; });
    });
  }

  function render() {
    visiblePhotos = filteredPhotos();
    const count = visiblePhotos.length;

    els.resultCount.textContent =
      count === 1 ? t("resultsOne") : t("resultsMany").replace("{n}", count);
    els.clear.hidden = !hasActiveFilters();

    const showFeatured =
      count > 0 &&
      state.q === "" &&
      state.category === "all" &&
      state.family === "all" &&
      state.place === "all" &&
      state.sort === "curated";

    const featured = showFeatured ? visiblePhotos[0] : null;
    const gridPhotos = showFeatured ? visiblePhotos.slice(1) : visiblePhotos;

    els.featured.hidden = !featured;
    els.featured.innerHTML = featured ? plateMarkup(featured, 0, true) : "";

    els.grid.innerHTML = gridPhotos
      .map((photo, index) => plateMarkup(photo, index + (featured ? 1 : 0)))
      .join("");

    els.empty.hidden = count !== 0;
    initCarousels();
    syncUrl();
  }

  function buildChips() {
    els.chips.innerHTML = CATEGORIES.map((category) => {
      const label = category === "all" ? (state.lang === "es" ? "Todas" : "All") : t("categoryNames")[category];
      return `<button class="chip${state.category === category ? " is-active" : ""}"
        type="button" data-category="${category}"
        aria-pressed="${state.category === category}">${esc(label)}</button>`;
    }).join("");
  }

  function buildSelects() {
    const families = new Map();
    PHOTOS.forEach((photo) => {
      if (!photo.family.sci || photo.family.sci === "—") return;
      families.set(photo.family.sci, photo.family[state.lang]);
    });
    const familyOptions = [...families.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], state.lang))
      .map(([sci, common]) =>
        `<option value="${esc(sci)}"${state.family === sci ? " selected" : ""}>${esc(common)} · ${esc(sci)}</option>`
      )
      .join("");

    const places = new Map();
    PHOTOS.forEach((photo) => {
      places.set(photo.location.en, photo.location[state.lang]);
    });
    const placeOptions = [...places.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], state.lang))
      .map(([key, label]) =>
        `<option value="${esc(key)}"${state.place === key ? " selected" : ""}>${esc(label)}</option>`
      )
      .join("");

    els.family.innerHTML = `<option value="all">${esc(t("allFamilies"))}</option>${familyOptions}`;
    els.place.innerHTML = `<option value="all">${esc(t("allPlaces"))}</option>${placeOptions}`;

    els.sort.innerHTML = `
      <option value="curated"${state.sort === "curated" ? " selected" : ""}>${esc(t("sortCurated"))}</option>
      <option value="newest"${state.sort === "newest" ? " selected" : ""}>${esc(t("sortNewest"))}</option>
      <option value="name"${state.sort === "name" ? " selected" : ""}>${esc(t("sortName"))}</option>`;
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (state.lang !== "en") params.set("lang", state.lang);
    if (state.q) params.set("q", state.q);
    if (state.category !== "all") params.set("cat", state.category);
    if (state.family !== "all") params.set("family", state.family);
    if (state.place !== "all") params.set("place", state.place);
    if (state.sort !== "curated") params.set("sort", state.sort);
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      history.replaceState(null, "", next);
    }
  }

  /* ---------------- viewer ---------------- */

  function formatDate(date) {
    try {
      return new Intl.DateTimeFormat(state.lang, {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(`${date}T12:00:00`));
    } catch (_) {
      return date;
    }
  }

  function viewerRecord(photo) {
    const family =
      photo.family.sci && photo.family.sci !== "—"
        ? `${esc(photo.family[state.lang])} <span class="viewer__latin">${esc(photo.family.sci)}</span>`
        : "";
    return `
      <div class="viewer__head">
        <h2 class="viewer__name" id="viewerTitle">${esc(photo.name[state.lang])}</h2>
        ${photo.sci ? `<p class="viewer__sci">${esc(photo.sci)}</p>` : ""}
      </div>

      <dl class="viewer__record">
        ${family ? `<div><dt>${esc(t("family"))}</dt><dd>${family}</dd></div>` : ""}
        <div><dt>${esc(t("place"))}</dt><dd>${esc(photo.location[state.lang])}</dd></div>
        <div><dt>${esc(t("date"))}</dt><dd>${esc(formatDate(photo.date))}</dd></div>
      </dl>

      <section class="viewer__note">
        <h3>${esc(t("fieldNote"))}</h3>
        <p>${esc(photo.note[state.lang])}</p>
      </section>

      <section class="viewer__craft">
        <h3>${esc(t("craft"))}</h3>
        <dl class="viewer__exif">
          <div><dt>${esc(t("shutter"))}</dt><dd>${esc(photo.exif.shutter)}</dd></div>
          <div><dt>${esc(t("aperture"))}</dt><dd>${esc(photo.exif.aperture)}</dd></div>
          <div><dt>${esc(t("iso"))}</dt><dd>${esc(photo.exif.iso)}</dd></div>
          <div><dt>${esc(t("focal"))}</dt><dd>${esc(photo.exif.focal)}</dd></div>
        </dl>
        <dl class="viewer__gear">
          <div><dt>${esc(t("camera"))}</dt><dd>${esc(photo.gear.camera)}</dd></div>
          <div><dt>${esc(t("lens"))}</dt><dd>${esc(photo.gear.lens)}</dd></div>
        </dl>
      </section>

      <p class="viewer__credit">
        ${esc(t("creditLine").replace("{author}", photo.credit.author).replace("{license}", photo.credit.license))}
        <a href="${esc(photo.credit.url)}" target="_blank" rel="noopener noreferrer">More info</a>
      </p>`;
  }

  function setViewerImage(photo) {
    const image = photo.images[viewerImageIndex] || photo.images[0];
    els.viewerImg.src = image.src;
    els.viewerImg.width = image.width;
    els.viewerImg.height = image.height;
    els.viewerImg.alt = image.alt[state.lang];
  }

  function renderViewerThumbs(photo) {
    const multiple = photo.images.length > 1;
    els.viewerThumbs.hidden = !multiple;
    els.viewerThumbs.setAttribute("aria-label", t("photosInPlate"));
    els.viewerThumbs.innerHTML = multiple
      ? photo.images.map((image, imageIndex) => `
          <button class="viewer__thumb" type="button" data-viewer-image="${imageIndex}"
                  aria-pressed="${imageIndex === viewerImageIndex}"
                  aria-label="${esc(t("viewPhoto").replace("{n}", imageIndex + 1).replace("{total}", photo.images.length))}">
            <img src="${esc(image.src)}" alt="" loading="lazy" decoding="async">
          </button>`).join("")
      : "";
  }

  function renderViewer(photo) {
    if (viewerImageIndex >= photo.images.length) viewerImageIndex = 0;
    const multiple = photo.images.length > 1;
    els.viewerPlate.textContent = `${t("plate")} ${photo.plate}`;
    els.viewerCat.textContent = categoryLabel(photo);
    setViewerImage(photo);
    renderViewerThumbs(photo);
    els.viewerInfo.innerHTML = viewerRecord(photo);
    els.viewerPrev.setAttribute("aria-label", t("prev"));
    els.viewerNext.setAttribute("aria-label", t("next"));
    els.viewerClose.setAttribute("aria-label", t("close"));
    if (els.viewerImagePrev) {
      els.viewerImagePrev.hidden = !multiple;
      els.viewerImagePrev.setAttribute("aria-label", t("prevImage"));
    }
    if (els.viewerImageNext) {
      els.viewerImageNext.hidden = !multiple;
      els.viewerImageNext.setAttribute("aria-label", t("nextImage"));
    }
  }

  function openViewer(id, imageIndex = 0) {
    if (!visiblePhotos.length) return;
    const index = visiblePhotos.findIndex((photo) => photo.id === id);
    if (index < 0) return;
    activeIndex = index;
    viewerImageIndex = imageIndex;
    const photo = visiblePhotos[activeIndex];
    clearCarousels();
    renderViewer(photo);

    if (!els.viewer.open) {
      els.viewer.showModal();
      document.documentElement.classList.add("is-locked");
    }
    els.viewerClose.focus({ preventScroll: true });
    history.replaceState(null, "", `#${photo.id}`);
  }

  function closeViewer() {
    if (!els.viewer.open) return;
    els.viewer.close();
  }

  function stepViewer(direction) {
    if (activeIndex < 0 || !visiblePhotos.length) return;
    activeIndex = (activeIndex + direction + visiblePhotos.length) % visiblePhotos.length;
    viewerImageIndex = 0;
    const photo = visiblePhotos[activeIndex];
    renderViewer(photo);
    history.replaceState(null, "", `#${photo.id}`);
  }

  function stepViewerImage(direction) {
    if (activeIndex < 0) return;
    const photo = visiblePhotos[activeIndex];
    if (!photo || photo.images.length < 2) return;
    viewerImageIndex = (viewerImageIndex + direction + photo.images.length) % photo.images.length;
    setViewerImage(photo);
    $$(".viewer__thumb", els.viewerThumbs).forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.viewerImage) === viewerImageIndex));
    });
  }

  function openCredits() {
    els.creditsList.innerHTML = PHOTOS.map((photo) => `
      <li>
        <span>${esc(photo.name[state.lang])}</span>
        <a href="${esc(photo.credit.url)}" target="_blank" rel="noopener noreferrer">
          ${esc(photo.credit.author)} · ${esc(photo.credit.license)}
        </a>
      </li>`).join("");
    if (!els.credits.open) {
      els.credits.showModal();
      document.documentElement.classList.add("is-locked");
    }
  }

  /* ---------------- events ---------------- */

  function bind() {
    els.search.addEventListener("input", () => {
      state.q = els.search.value.trim();
      render();
    });

    els.search.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.search.value) {
        event.preventDefault();
        els.search.value = "";
        state.q = "";
        render();
      }
    });

    els.chips.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-category]");
      if (!chip) return;
      state.category = chip.dataset.category;
      $$(".chip", els.chips).forEach((button) => {
        const active = button.dataset.category === state.category;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      render();
    });

    els.family.addEventListener("change", () => {
      state.family = els.family.value;
      render();
    });

    els.place.addEventListener("change", () => {
      state.place = els.place.value;
      render();
    });

    els.sort.addEventListener("change", () => {
      state.sort = els.sort.value;
      render();
    });

    els.clear.addEventListener("click", () => {
      Object.assign(state, DEFAULTS);
      els.search.value = "";
      els.family.value = "all";
      els.place.value = "all";
      els.sort.value = "curated";
      buildChips();
      render();
      els.search.focus();
    });

    els.empty.addEventListener("click", (event) => {
      if (!event.target.closest("[data-reset]")) return;
      els.clear.click();
    });

    [els.featured, els.grid].forEach((container) => {
      container.addEventListener("click", (event) => {
        if (event.target.closest("[data-carousel-control]")) return;
        const link = event.target.closest("[data-photo]");
        if (!link) return;
        if (link.dataset.suppressOpen === "1") {
          event.preventDefault();
          delete link.dataset.suppressOpen;
          return;
        }
        event.preventDefault();
        const activeSlide = link.querySelector(".plate__slide.is-active");
        const imageIndex = activeSlide ? Number(activeSlide.dataset.slide) : 0;
        openViewer(link.dataset.photo, imageIndex);
      });
    });

    els.viewerClose.addEventListener("click", closeViewer);
    els.viewerPrev.addEventListener("click", () => stepViewer(-1));
    els.viewerNext.addEventListener("click", () => stepViewer(1));
    els.viewerImagePrev?.addEventListener("click", () => stepViewerImage(-1));
    els.viewerImageNext?.addEventListener("click", () => stepViewerImage(1));

    els.viewerThumbs.addEventListener("click", (event) => {
      const thumb = event.target.closest("[data-viewer-image]");
      if (!thumb || activeIndex < 0) return;
      viewerImageIndex = Number(thumb.dataset.viewerImage);
      setViewerImage(visiblePhotos[activeIndex]);
      $$(".viewer__thumb", els.viewerThumbs).forEach((button) => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.viewerImage) === viewerImageIndex));
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearCarousels();
    });

    els.viewer.addEventListener("close", () => {
      document.documentElement.classList.remove("is-locked");
      activeIndex = -1;
      viewerImageIndex = 0;
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    });

    els.viewer.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeViewer();
    });

    els.viewer.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const photo = activeIndex >= 0 ? visiblePhotos[activeIndex] : null;
      const multi = !!(photo && photo.images.length > 1);
      event.preventDefault();
      if (multi) stepViewerImage(event.key === "ArrowLeft" ? -1 : 1);
      else stepViewer(event.key === "ArrowLeft" ? -1 : 1);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      event.preventDefault();
      els.search.focus();
      els.search.select();
    });

    els.langButtons.forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang));
    });

    const creditsTriggers = $$("[data-open-credits]");
    creditsTriggers.forEach((trigger) => trigger.addEventListener("click", openCredits));

    const creditsClose = $("#creditsClose");
    creditsClose?.addEventListener("click", () => els.credits.close());
    els.credits.addEventListener("close", () => {
      document.documentElement.classList.remove("is-locked");
    });
    els.credits.addEventListener("cancel", (event) => {
      event.preventDefault();
      els.credits.close();
    });
  }

  /* ---------------- boot ---------------- */

  readInitialState();
  applyStaticText();
  buildChips();
  buildSelects();
  render();
  bind();

  if (window.location.hash) {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (PHOTOS.some((photo) => photo.id === id)) {
      openViewer(id);
    }
  }
})();
