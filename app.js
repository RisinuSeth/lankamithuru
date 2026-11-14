const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const modal = $("#searchModal");
const searchInput = $("#siteSearch");
const results = $("#searchResults");
const toast = $("#toast");
let toastTimer;

$("#year").textContent = new Date().getFullYear();

function openSearch(query = "") {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  searchInput.value = query;
  renderSearch(query);
  window.setTimeout(() => searchInput.focus(), 80);
}
function closeSearch() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

const searchable = [
  { title: "Explore Sri Lanka", terms: "explore destinations places travel tourism island", target: "#explore", type: "EXPLORE" },
  { title: "Beaches & coast", terms: "beach sea ocean surf coast", target: "#explore-categories", type: "EXPLORE" },
  { title: "Hills & nature", terms: "mountain hills nature forest waterfall", target: "#explore-categories", type: "EXPLORE" },
  { title: "Culture & heritage", terms: "culture heritage history ancient", target: "#explore-categories", type: "EXPLORE" },
  { title: "Food & flavour", terms: "food restaurants cuisine flavour", target: "#explore-categories", type: "EXPLORE" },
  { title: "Places to stay", terms: "hotels accommodation stays guest houses", target: "#explore-categories", type: "EXPLORE" },
  { title: "Local businesses", terms: "business shop local directory companies", target: "#hub", type: "HUB" },
  { title: "Services", terms: "services professionals repair help", target: "#hub", type: "HUB" },
  { title: "Jobs & opportunities", terms: "jobs careers opportunities vacancies", target: "#hub", type: "HUB" },
  { title: "Events & happenings", terms: "events happenings activities calendar", target: "#hub", type: "HUB" },
  { title: "Advanced Level resources", terms: "a/l al advanced level subjects notes", target: "#edu", type: "EDU" },
  { title: "Ordinary Level resources", terms: "o/l ol ordinary level subjects notes", target: "#edu", type: "EDU" },
  { title: "Past papers", terms: "past papers exam answers revision", target: "#edu", type: "EDU" },
  { title: "Study guides", terms: "study guides learning resources", target: "#edu", type: "EDU" },
  { title: "Courses & skills", terms: "courses skills training learning", target: "#edu", type: "EDU" }
];

function renderSearch(query) {
  const term = query.trim().toLowerCase();
  const matches = term ? searchable.filter(item => (item.title + " " + item.terms).toLowerCase().includes(term)) : searchable.slice(0, 5);
  results.innerHTML = '<span class="results-label">' + (term ? (matches.length ? "MATCHING DISCOVERIES" : "NO MATCHES YET") : "QUICK DISCOVERIES") + '</span>';
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "search-hint";
    empty.textContent = "Try a broader search, such as travel, business, jobs or study.";
    results.append(empty);
    return;
  }
  matches.slice(0, 8).forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    const title = document.createElement("span");
    title.textContent = item.title;
    const meta = document.createElement("small");
    meta.textContent = item.type;
    const arrow = document.createElement("b");
    arrow.textContent = "↗";
    button.append(title, meta, arrow);
    button.addEventListener("click", () => {
      closeSearch();
      document.querySelector(item.target)?.scrollIntoView({ behavior: "smooth" });
    });
    results.append(button);
  });
}

$("#openSearch").addEventListener("click", () => openSearch());
$("#heroSearch").addEventListener("click", () => openSearch());
$("#closeSearch").addEventListener("click", closeSearch);
searchInput.addEventListener("input", event => renderSearch(event.target.value));
modal.addEventListener("click", event => { if (event.target === modal) closeSearch(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeSearch();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
});

$$("[data-search-term]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    openSearch(link.dataset.searchTerm);
  });
});

$$(".search-results button[data-query]").forEach(button => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.query;
    renderSearch(button.dataset.query);
    searchInput.focus();
  });
});

const menuToggle = $("#menuToggle");
const nav = $(".main-nav");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("open", !expanded);
});
$$(".main-nav a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// The public directory and learning catalogue are being connected to their
// managed data source in the next build phase. Keep this launch page honest.
$$('a[href="#hub-directory"]').forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  document.querySelector("#hub")?.scrollIntoView({ behavior: "smooth" });
  showToast("The community directory is part of the next launch phase.");
}));
$$('a[href="#search"]').forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  openSearch(link.dataset.searchTerm || "");
}));
