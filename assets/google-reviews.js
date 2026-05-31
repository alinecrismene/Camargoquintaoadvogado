/**
 * Widget de avaliações do Google — Dr. Camargo Quintão
 *
 * Para carregar avaliações reais (nome, foto, estrelas):
 * 1. Acesse https://console.cloud.google.com/
 * 2. Ative "Places API (New)"
 * 3. Crie uma chave de API e restrinja ao domínio do site
 * 4. Cole a chave em GOOGLE_PLACES_API_KEY abaixo
 */
(function () {
  const GOOGLE_PLACES_API_KEY = "";
  const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/HnM9uWgqgFqrymi47";
  const PLACE_SEARCH_QUERY = "Dr Camargo Quintão Advocacia Av Nossa Sra da Penha 1491 Vitória ES";
  const PLACE_ID = "";

  const root = document.getElementById("googleReviewsWidget");
  if (!root) return;

  const summaryEl = root.querySelector("[data-reviews-summary]");
  const trackEl = root.querySelector("[data-reviews-track]");
  const statusEl = root.querySelector("[data-reviews-status]");
  const prevBtn = root.querySelector("[data-reviews-prev]");
  const nextBtn = root.querySelector("[data-reviews-next]");

  const AVATAR_COLORS = ["#1a73e8", "#d93025", "#188038", "#e37400", "#9334e6", "#007b83", "#c5221f", "#137333"];

  function hashName(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h);
  }

  function renderStars(rating) {
    const full = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) =>
      `<svg class="g-star${i < full ? " g-star--on" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>`
    ).join("");
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    } catch {
      return "";
    }
  }

  function initials(name) {
    return (name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderReviewCard(review) {
    const name = review.authorAttribution?.displayName || review.author_name || "Cliente Google";
    const photo = review.authorAttribution?.photoUri || review.profile_photo_url || "";
    const rating = review.rating || 5;
    const text = escapeHtml(review.text?.text || review.text || "");
    const date = formatDate(review.publishTime || review.relative_time_description);
    const color = AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];

    const avatar = photo
      ? `<img class="g-review-avatar" src="${photo}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
      : `<span class="g-review-avatar g-review-avatar--initials" style="background:${color}">${initials(name)}</span>`;

    return `
      <article class="g-review-card card">
        <header class="g-review-head">
          ${avatar}
          <div class="g-review-meta">
            <strong class="g-review-name">${escapeHtml(name)}</strong>
            <div class="g-review-stars" aria-label="${rating} de 5 estrelas">${renderStars(rating)}</div>
            ${date ? `<time class="g-review-date">${date}</time>` : ""}
          </div>
          <svg class="g-review-google" viewBox="0 0 24 24" aria-label="Avaliação no Google" role="img">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </header>
        <p class="g-review-text">${text}</p>
      </article>
    `;
  }

  function renderSummary(rating, count) {
    if (!summaryEl) return;
    summaryEl.innerHTML = `
      <div class="g-summary-score">
        <span class="g-summary-rating">${Number(rating).toFixed(1)}</span>
        <div class="g-summary-stars" aria-label="Nota média ${rating} de 5">${renderStars(rating)}</div>
        <span class="g-summary-count">${count} avaliações no Google</span>
      </div>
      <a class="btn btn-ghost g-summary-link" href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener">
        Ver todas no Google
      </a>
    `;
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function bindCarousel() {
    const scrollByCard = (dir) => {
      if (!trackEl) return;
      const card = trackEl.querySelector(".g-review-card");
      const amount = (card?.getBoundingClientRect().width || 320) + 12;
      trackEl.scrollBy({ left: dir * amount, behavior: "smooth" });
    };
    prevBtn?.addEventListener("click", () => scrollByCard(-1));
    nextBtn?.addEventListener("click", () => scrollByCard(1));

    let touchStartX = 0;
    trackEl?.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    trackEl?.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) scrollByCard(diff > 0 ? 1 : -1);
    }, { passive: true });
  }

  async function findPlaceId(apiKey) {
    if (PLACE_ID) return PLACE_ID;
    const url = `https://places.googleapis.com/v1/places:searchText`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName"
      },
      body: JSON.stringify({ textQuery: PLACE_SEARCH_QUERY, languageCode: "pt-BR" })
    });
    if (!res.ok) throw new Error("place_search_failed");
    const data = await res.json();
    return data.places?.[0]?.id || null;
  }

  async function fetchPlaceDetails(placeId, apiKey) {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews,googleMapsUri"
      }
    });
    if (!res.ok) throw new Error("place_details_failed");
    return res.json();
  }

  function renderFallback() {
    renderSummary("—", "—");
    if (trackEl) {
      trackEl.innerHTML = `
        <article class="g-review-card card g-review-card--cta">
          <svg class="g-review-google g-review-google--lg" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <h3>Avaliações verificadas no Google</h3>
          <p>Confira as opiniões reais de clientes com nome, foto e estrelas diretamente no Google Maps.</p>
          <a class="btn btn-primary" href="${GOOGLE_MAPS_URL}" target="_blank" rel="noopener">Ver avaliações no Google</a>
        </article>
      `;
    }
    console.info("[Google Reviews] Adicione GOOGLE_PLACES_API_KEY em assets/google-reviews.js para carregar avaliações reais.");
  }

  async function init() {
    setStatus("Carregando avaliações…");
    bindCarousel();

    if (!GOOGLE_PLACES_API_KEY) {
      renderFallback();
      setStatus("");
      return;
    }

    try {
      const placeId = await findPlaceId(GOOGLE_PLACES_API_KEY);
      if (!placeId) throw new Error("no_place");

      const place = await fetchPlaceDetails(placeId, GOOGLE_PLACES_API_KEY);
      const reviews = place.reviews || [];
      const rating = place.rating || 5;
      const count = place.userRatingCount || reviews.length;
      const mapsUrl = place.googleMapsUri || GOOGLE_MAPS_URL;

      renderSummary(rating, count);
      if (summaryEl) {
        const link = summaryEl.querySelector(".g-summary-link");
        if (link) link.href = mapsUrl;
      }

      if (!reviews.length) {
        renderFallback();
        setStatus("");
        return;
      }

      if (trackEl) {
        trackEl.innerHTML = reviews.slice(0, 8).map(renderReviewCard).join("");
      }
      setStatus("");
      root.classList.add("is-loaded");
    } catch {
      renderFallback();
    }
  }

  init();
})();
