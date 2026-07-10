/* ===================== CONFIG ===================== */
// To go live with real-time Google Reviews, set an API key and Place ID below.
// Until then (or if the request fails), the site falls back to FALLBACK_REVIEWS.
const GOOGLE_PLACES_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY";
const PLACE_ID = "YOUR_PLACE_ID"; // Look up: Birria Patro Jaramillo, San Jose, CA

const FALLBACK_REVIEWS = [
  { author: "Maria G.", stars: 5, text: "Best birria in San Jose! The consomé is incredible and the tacos dorados are perfectly crispy. Family-owned and it shows — they put love into every plate.", time: "2 weeks ago" },
  { author: "Carlos R.", stars: 5, text: "Authentic Zacatecas style birria. The revolcada is a must — grilled birria with charred onions is next level. Come hungry, leave full and happy.", time: "1 month ago" },
  { author: "Jennifer L.", stars: 5, text: "I drive 30 minutes just to come here. The birria pizza is unreal. Consomé for dipping everything. This place is a hidden gem in South San Jose.", time: "3 weeks ago" },
  { author: "David M.", stars: 5, text: "Ordered the full Patro Experience pack for a family gathering — everyone was blown away. Huge portions, amazing quality. We'll be back every week.", time: "2 months ago" },
  { author: "Ana P.", stars: 5, text: "The flan here tastes like crème brûlée. Food is always fresh and hot. Service is fast and friendly. This is our go-to spot for birria in San Jose.", time: "1 week ago" },
];

let reviewsData = FALLBACK_REVIEWS;
let currentReviewIndex = 0;
let reviewsTimer = null;

function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function initialsAvatar(name) {
  return name.trim().charAt(0).toUpperCase();
}

function renderReviews() {
  const track = document.getElementById("reviewsTrack");
  const dotsWrap = document.getElementById("reviewsDots");
  if (!track) return;

  track.innerHTML = reviewsData
    .map(
      (r, i) => `
    <div class="review-card ${i === 0 ? "active" : ""}" data-index="${i}">
      <div class="review-stars" aria-hidden="true">${starString(r.stars)}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <div class="review-avatar">${r.photo ? `<img src="${r.photo}" alt="${r.author}">` : initialsAvatar(r.author)}</div>
        <div>
          <div class="review-name">${r.author}</div>
          <div class="review-time">${r.time || ""} · Google</div>
        </div>
      </div>
    </div>`
    )
    .join("");

  dotsWrap.innerHTML = reviewsData
    .map((_, i) => `<button aria-label="Show review ${i + 1}" class="${i === 0 ? "active" : ""}" data-dot="${i}"></button>`)
    .join("");

  dotsWrap.querySelectorAll("[data-dot]").forEach((btn) => {
    btn.addEventListener("click", () => goToReview(+btn.dataset.dot));
  });

  currentReviewIndex = 0;
}

function goToReview(index) {
  const cards = document.querySelectorAll(".review-card");
  const dots = document.querySelectorAll("[data-dot]");
  if (!cards.length) return;
  currentReviewIndex = (index + cards.length) % cards.length;
  cards.forEach((c, i) => c.classList.toggle("active", i === currentReviewIndex));
  dots.forEach((d, i) => d.classList.toggle("active", i === currentReviewIndex));
}

function nextReview() { goToReview(currentReviewIndex + 1); }
function prevReview() { goToReview(currentReviewIndex - 1); }

function startAutoplay() {
  stopAutoplay();
  if (document.body.classList.contains("reduce-motion")) return;
  reviewsTimer = setInterval(nextReview, 4000);
}
function stopAutoplay() {
  if (reviewsTimer) clearInterval(reviewsTimer);
  reviewsTimer = null;
}

async function fetchGoogleReviews() {
  const configured =
    GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== "YOUR_GOOGLE_PLACES_API_KEY" && PLACE_ID && PLACE_ID !== "YOUR_PLACE_ID";
  if (!configured) return FALLBACK_REVIEWS;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=review&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("Places API request failed");
    const data = await res.json();
    const reviews = data.result && data.result.reviews;
    if (!Array.isArray(reviews) || !reviews.length) throw new Error("No reviews returned");
    return reviews.slice(0, 5).map((r) => ({
      author: r.author_name,
      stars: r.rating,
      text: r.text,
      time: r.relative_time_description,
      photo: r.profile_photo_url,
    }));
  } catch (err) {
    console.warn("Google Places reviews fetch failed, using fallback reviews:", err);
    return FALLBACK_REVIEWS;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const section = document.getElementById("reviewsTrack");
  if (!section) return;

  reviewsData = await fetchGoogleReviews();
  renderReviews();
  startAutoplay();

  const carousel = document.querySelector(".reviews-carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
  }
  const nextBtn = document.getElementById("reviewsNext");
  const prevBtn = document.getElementById("reviewsPrev");
  if (nextBtn) nextBtn.addEventListener("click", () => { nextReview(); stopAutoplay(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { prevReview(); stopAutoplay(); startAutoplay(); });
});
