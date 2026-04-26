const SITE_CONFIG = {
  brandName: "Belluno Essenza",
  domain: "https://www.bellunoessenza.com.br",
  dataUrl: "data/produtos.json",
  fallbackImage: "assets/branding/hero-lifestyle.png",
  contactEmail: "contato@bellunoessenza.com.br",
  instagramUrl: "https://instagram.com/belluno.essenza",
  instagramHandle: "@belluno.essenza",
  whatsappNumber: "5547997954557",
  defaultWhatsAppMessage: "Olá! Gostaria de saber mais sobre os produtos da Belluno Essenza."
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

let catalogPromise;

document.addEventListener("DOMContentLoaded", () => {
  setCurrentYear();
  setupHeader();
  setupRevealAnimations();
  setupNewsletterForms();
  hydrateWhatsAppLinks();
  injectFloatingWhatsAppButton();
  setupImageFallbacks();
  routePage();
});

function routePage() {
  const page = document.body.dataset.page;

  if (page === "home") {
    initHome();
  }

  if (page === "catalog") {
    initCatalog();
  }

  if (page === "product") {
    initProduct();
  }

  if (page === "contact") {
    initContact();
  }
}

function setCurrentYear() {
  document.querySelectorAll("#current-year").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function setupHeader() {
  const header = document.getElementById("site-header");
  const menuToggle = document.querySelector(".menu-toggle");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".site-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");

  if (!items.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => observer.observe(item));
}

function setupNewsletterForms() {
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    const feedback = form.querySelector(".form-feedback");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (feedback) {
        feedback.textContent = "Obrigada. Seu interesse foi registrado para as novidades da Belluno Essenza.";
      }
      form.reset();
    });
  });
}

function hydrateWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    const message = link.dataset.whatsappMessage || SITE_CONFIG.defaultWhatsAppMessage;
    link.setAttribute("href", buildWhatsAppLink(message));
  });
}

function injectFloatingWhatsAppButton() {
  if (document.querySelector(".whatsapp-float")) {
    return;
  }

  const link = document.createElement("a");
  link.className = "whatsapp-float";
  link.href = buildWhatsAppLink(SITE_CONFIG.defaultWhatsAppMessage);
  link.target = "_blank";
  link.rel = "noreferrer";
  link.setAttribute("aria-label", "Falar com a Belluno Essenza no WhatsApp");
  link.innerHTML = `
    <span class="whatsapp-float__label">WhatsApp</span>
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.52 3.48A11.83 11.83 0 0 0 12.08 0C5.52 0 .19 5.33.19 11.89c0 2.09.55 4.13 1.58 5.92L0 24l6.36-1.67a11.83 11.83 0 0 0 5.72 1.46h.01c6.56 0 11.89-5.34 11.89-11.9 0-3.17-1.23-6.15-3.46-8.41Zm-8.44 18.3h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.22-3.77.99 1.01-3.67-.23-.38a9.86 9.86 0 0 1-1.52-5.24C2.2 6.44 6.62 2 12.08 2c2.63 0 5.1 1.03 6.96 2.88a9.79 9.79 0 0 1 2.88 6.97c0 5.46-4.44 9.92-9.84 9.92Zm5.44-7.42c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.57-.48-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"/>
    </svg>
  `;
  document.body.appendChild(link);
}

async function fetchCatalog() {
  if (!catalogPromise) {
    catalogPromise = loadCatalogPayload()
      .then((payload) => {
        const rawProducts = Array.isArray(payload) ? payload : payload.products || [];
        return rawProducts.map((product, index) => normalizeProduct(product, index));
      });
  }

  return catalogPromise;
}

async function loadCatalogPayload() {
  const inlinePayload = window.BELLUNO_PRODUCTS_DATA;

  if (window.location.protocol === "file:" && inlinePayload) {
    return inlinePayload;
  }

  try {
    const response = await fetch(SITE_CONFIG.dataUrl);
    if (!response.ok) {
      throw new Error("Não foi possível carregar o catálogo.");
    }
    return await response.json();
  } catch (error) {
    if (inlinePayload) {
      return inlinePayload;
    }
    throw error;
  }
}

function normalizeProduct(product, index) {
  const explicitSlug = textOrFallback(product.slug);
  const slug = explicitSlug || slugify(product.nome || `produto-${index + 1}`);
  const rawImages = Array.isArray(product.imagens) && product.imagens.length
    ? product.imagens
    : [product.imagem_principal, product.galeria_1, product.galeria_2, product.galeria_3];

  const images = rawImages
    .filter(Boolean)
    .map((path) => resolveAssetPath(path));

  return {
    ...product,
    index,
    slug,
    slugKey: slugify(slug),
    destaque: toBoolean(product.destaque),
    ativo: toBoolean(product.ativo),
    ordem: toNumber(product.ordem) ?? index + 1,
    preco: toNumber(product.preco),
    preco_promocional: toNumber(product.preco_promocional),
    estoque: toNumber(product.estoque),
    disponivel: (toNumber(product.estoque) ?? 1) > 0,
    nome: textOrFallback(product.nome, "Produto Belluno"),
    subtitulo: textOrFallback(product.subtitulo),
    categoria: textOrFallback(product.categoria, "Coleção Belluno"),
    familia_olfativa: textOrFallback(product.familia_olfativa, "Família sensorial"),
    volume: textOrFallback(product.volume, "Sob consulta"),
    tempo_queima: textOrFallback(product.tempo_queima, "Sob consulta"),
    descricao_curta: textOrFallback(product.descricao_curta),
    descricao_completa: textOrFallback(product.descricao_completa),
    notas_topo: textOrFallback(product.notas_topo),
    notas_coracao: textOrFallback(product.notas_coracao),
    notas_base: textOrFallback(product.notas_base),
    modo_de_uso: textOrFallback(product.modo_de_uso),
    composicao: textOrFallback(product.composicao),
    sku: textOrFallback(product.sku, "Belluno"),
    selo: textOrFallback(product.selo),
    meta_title: textOrFallback(product.meta_title),
    meta_description: textOrFallback(product.meta_description),
    imagens: images.length ? images : [SITE_CONFIG.fallbackImage]
  };
}

function resolveAssetPath(path) {
  if (!path) {
    return SITE_CONFIG.fallbackImage;
  }

  if (/^(https?:)?\/\//i.test(path) || path.startsWith("assets/")) {
    return path;
  }

  return `assets/produtos/${path}`;
}

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  return ["sim", "s", "true", "1", "yes", "y"].includes(normalized);
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function textOrFallback(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

const LOOKALIKE_CHARACTER_MAP = {
  "а": "a",
  "А": "A",
  "е": "e",
  "Е": "E",
  "о": "o",
  "О": "O",
  "р": "p",
  "Р": "P",
  "с": "c",
  "С": "C",
  "у": "y",
  "У": "Y",
  "х": "x",
  "Х": "X",
  "і": "i",
  "І": "I",
  "ј": "j",
  "Ј": "J",
  "к": "k",
  "К": "K",
  "м": "m",
  "М": "M",
  "т": "t",
  "Т": "T",
  "в": "b",
  "В": "B"
};

function normalizeLookalikeCharacters(value) {
  return Array.from(String(value ?? ""))
    .map((character) => LOOKALIKE_CHARACTER_MAP[character] || character)
    .join("");
}

function slugify(value) {
  return normalizeLookalikeCharacters(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value) {
  return value == null ? "Sob consulta" : currencyFormatter.format(value);
}

function getCurrentPrice(product) {
  if (product.preco_promocional != null && product.preco != null && product.preco_promocional < product.preco) {
    return product.preco_promocional;
  }

  return product.preco;
}

function getProductUrl(product) {
  return `produto.html?slug=${encodeURIComponent(product.slug)}`;
}

function setupImageFallbacks(root = document) {
  root.querySelectorAll("img[data-fallback-src]:not([data-fallback-bound])").forEach((image) => {
    image.dataset.fallbackBound = "true";
    image.addEventListener("error", () => {
      const fallbackSrc = image.dataset.fallbackSrc;
      if (fallbackSrc && image.getAttribute("src") !== fallbackSrc) {
        image.setAttribute("src", fallbackSrc);
      }
    });
  });
}

function buildWhatsAppLink(message) {
  const encoded = encodeURIComponent(message);

  if (SITE_CONFIG.whatsappNumber) {
    return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encoded}`;
  }

  return `https://wa.me/?text=${encoded}`;
}

function buildProductCard(product) {
  const currentPrice = getCurrentPrice(product);
  const oldPrice = product.preco_promocional != null && product.preco_promocional < product.preco
    ? `<span class="price-old">${formatCurrency(product.preco)}</span>`
    : "";
  const badge = product.selo
    ? `<span class="badge">${escapeHtml(product.selo)}</span>`
    : product.destaque
      ? `<span class="badge">Destaque</span>`
      : "";

  return `
    <article class="product-card">
      <a class="product-card-media" href="${getProductUrl(product)}" aria-label="Ver detalhes de ${escapeHtml(product.nome)}">
        <img
          src="${escapeHtml(product.imagens[0] || SITE_CONFIG.fallbackImage)}"
          alt="${escapeHtml(`Produto ${product.nome} da Belluno Essenza`)}"
          loading="lazy"
          data-fallback-src="${escapeHtml(SITE_CONFIG.fallbackImage)}"
        >
      </a>
      <div class="product-card-body">
        <div class="product-card-top">
          <span class="product-category">${escapeHtml(product.categoria)}</span>
          ${badge}
        </div>
        <div>
          <h3>${escapeHtml(product.nome)}</h3>
          <p class="product-subtitle">${escapeHtml(product.subtitulo || product.descricao_curta)}</p>
        </div>
        <div class="product-price-row">
          <span class="price-current">${formatCurrency(currentPrice)}</span>
          ${oldPrice}
        </div>
        <div class="product-card-actions">
          <a class="button button-secondary" href="${getProductUrl(product)}">Ver detalhes</a>
          <span class="product-meta">${escapeHtml(product.volume || product.familia_olfativa)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderCards(container, products, emptyText) {
  if (!container) {
    return;
  }

  if (!products.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Nada por aqui ainda</h2>
        <p>${escapeHtml(emptyText)}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map((product) => buildProductCard(product)).join("");
  setupImageFallbacks(container);
}

async function initHome() {
  const featuredContainer = document.getElementById("featured-products");

  try {
    const products = await fetchCatalog();
    const activeProducts = products
      .filter((product) => product.ativo)
      .sort((a, b) => a.ordem - b.ordem);
    const featured = activeProducts
      .filter((product) => product.destaque)
      .sort((a, b) => a.ordem - b.ordem);

    const list = featured.length ? featured.slice(0, 4) : activeProducts.slice(0, 4);
    renderCards(featuredContainer, list, "Adicione produtos na planilha para popular esta seção.");
  } catch (error) {
    renderError(featuredContainer, "Não foi possível carregar os produtos em destaque.");
  }
}

async function initCatalog() {
  const grid = document.getElementById("catalog-grid");
  const emptyState = document.getElementById("catalog-empty");
  const resultCount = document.getElementById("catalog-result-count");
  const searchInput = document.getElementById("search-product");
  const categorySelect = document.getElementById("filter-category");
  const familySelect = document.getElementById("filter-family");
  const sortSelect = document.getElementById("sort-products");
  const clearButton = document.getElementById("clear-filters");

  if (!grid || !searchInput || !categorySelect || !familySelect || !sortSelect) {
    return;
  }

  try {
    const products = (await fetchCatalog())
      .filter((product) => product.ativo)
      .sort((a, b) => a.ordem - b.ordem);

    populateSelect(categorySelect, uniqueValues(products.map((product) => product.categoria)));
    populateSelect(familySelect, uniqueValues(products.map((product) => product.familia_olfativa)));

    const params = new URLSearchParams(window.location.search);
    searchInput.value = params.get("busca") || "";
    categorySelect.value = params.get("categoria") || "";
    familySelect.value = params.get("familia") || "";
    sortSelect.value = params.get("ordem") || "curadoria";

    const applyFilters = () => {
      const searchTerm = slugify(searchInput.value);
      const category = categorySelect.value;
      const family = familySelect.value;
      const sort = sortSelect.value;

      let filtered = products.filter((product) => {
        const matchesSearch = !searchTerm || slugify(`${product.nome} ${product.subtitulo} ${product.descricao_curta}`).includes(searchTerm);
        const matchesCategory = !category || slugify(product.categoria) === slugify(category);
        const matchesFamily = !family || slugify(product.familia_olfativa) === slugify(family);
        return matchesSearch && matchesCategory && matchesFamily;
      });

      filtered = sortProducts(filtered, sort);
      grid.innerHTML = filtered.map((product) => buildProductCard(product)).join("");
      setupImageFallbacks(grid);

      if (resultCount) {
        resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
      }

      if (emptyState) {
        emptyState.hidden = filtered.length > 0;
      }

      const nextParams = new URLSearchParams();
      if (searchInput.value.trim()) {
        nextParams.set("busca", searchInput.value.trim());
      }
      if (category) {
        nextParams.set("categoria", category);
      }
      if (family) {
        nextParams.set("familia", family);
      }
      if (sort !== "curadoria") {
        nextParams.set("ordem", sort);
      }

      const nextUrl = nextParams.toString() ? `?${nextParams.toString()}` : window.location.pathname.split("/").pop();
      window.history.replaceState({}, "", nextUrl);
    };

    [searchInput, categorySelect, familySelect, sortSelect].forEach((element) => {
      element.addEventListener("input", applyFilters);
      element.addEventListener("change", applyFilters);
    });

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        searchInput.value = "";
        categorySelect.value = "";
        familySelect.value = "";
        sortSelect.value = "curadoria";
        applyFilters();
      });
    }

    applyFilters();
  } catch (error) {
    renderError(grid, "Não foi possível carregar o catálogo.");
    if (resultCount) {
      resultCount.textContent = "Falha ao carregar produtos.";
    }
    if (emptyState) {
      emptyState.hidden = true;
    }
  }
}

function populateSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function uniqueValues(values) {
  const map = new Map();

  values
    .filter(Boolean)
    .forEach((value) => {
      const label = String(value).trim();
      const key = slugify(label);
      if (!map.has(key)) {
        map.set(key, label);
      }
    });

  return [...map.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function sortProducts(products, sort) {
  const next = [...products];

  if (sort === "price-asc") {
    return next.sort((a, b) => (getCurrentPrice(a) ?? Number.MAX_SAFE_INTEGER) - (getCurrentPrice(b) ?? Number.MAX_SAFE_INTEGER));
  }

  if (sort === "price-desc") {
    return next.sort((a, b) => (getCurrentPrice(b) ?? 0) - (getCurrentPrice(a) ?? 0));
  }

  if (sort === "name-asc") {
    return next.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  return next.sort((a, b) => a.ordem - b.ordem);
}

async function initProduct() {
  const container = document.getElementById("product-detail");
  const relatedContainer = document.getElementById("related-products");
  const relatedSection = document.getElementById("related-products-section") || (relatedContainer ? relatedContainer.closest("section") : null);
  const breadcrumbCurrent = document.getElementById("product-breadcrumb-current");
  const requestedSlug = textOrFallback(new URLSearchParams(window.location.search).get("slug"));
  const requestedSlugKey = slugify(requestedSlug);

  if (!container) {
    return;
  }

  if (!requestedSlug) {
    renderError(container, "Selecione um produto a partir do catálogo para ver os detalhes.");
    if (relatedSection) {
      relatedSection.hidden = true;
    }
    return;
  }

  try {
    const products = (await fetchCatalog()).filter((product) => product.ativo);
    const product = products.find((item) => item.slug === requestedSlug || item.slugKey === requestedSlugKey);

    if (!product) {
      renderError(container, "Produto não encontrado. Volte ao catálogo para escolher outra fragrância.");
      const fallbackProducts = products.slice(0, 3);
      if (relatedContainer && fallbackProducts.length) {
        if (relatedSection) {
          relatedSection.hidden = false;
        }
        renderCards(relatedContainer, fallbackProducts, "Adicione produtos relacionados.");
      } else if (relatedSection) {
        relatedSection.hidden = true;
      }
      return;
    }

    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = product.nome;
    }

    renderProductDetail(container, product);

    const related = products
      .filter((item) => item.slug !== product.slug)
      .filter((item) => slugify(item.categoria) === slugify(product.categoria) || slugify(item.familia_olfativa) === slugify(product.familia_olfativa))
      .slice(0, 3);
    const fallbackRelated = products
      .filter((item) => item.slug !== product.slug)
      .slice(0, 3);
    const relatedProducts = related.length ? related : fallbackRelated;

    if (relatedProducts.length) {
      if (relatedSection) {
        relatedSection.hidden = false;
      }
      renderCards(
        relatedContainer,
        relatedProducts,
        "Adicione outros produtos à planilha para enriquecer as sugestões."
      );
    } else if (relatedSection) {
      relatedSection.hidden = true;
      if (relatedContainer) {
        relatedContainer.innerHTML = "";
      }
    }

    updateProductMeta(product);
    setupProductGallery(container);
  } catch (error) {
    renderError(container, "Não foi possível carregar os detalhes do produto.");
    if (relatedSection) {
      relatedSection.hidden = false;
    }
    renderError(relatedContainer, "Não foi possível carregar produtos relacionados.");
  }
}

function renderProductDetail(container, product) {
  const currentPrice = getCurrentPrice(product);
  const oldPrice = product.preco_promocional != null && product.preco_promocional < product.preco
    ? `<span class="price-old">${formatCurrency(product.preco)}</span>`
    : "";
  const images = product.imagens.length ? product.imagens : [SITE_CONFIG.fallbackImage];
  const noteCards = [
    { title: "Topo", content: product.notas_topo || "Notas frescas e luminosas." },
    { title: "Coração", content: product.notas_coracao || "Corpo elegante e equilibrado." },
    { title: "Base", content: product.notas_base || "Fundo macio, confortável e duradouro." }
  ];
  const details = [
    { title: "Descrição", content: product.descricao_completa || product.descricao_curta },
    { title: "Modo de uso", content: product.modo_de_uso || "Utilize conforme a proposta do produto e mantenha em local ventilado." },
    { title: "Composição", content: product.composicao || "Informação editável na planilha de produtos." },
    { title: "Entrega e pedido", content: "A Belluno Essenza trabalha com atendimento consultivo. Use o botão abaixo para solicitar este item ou montar um kit especial." }
  ];
  const badge = product.selo
    ? `<span class="badge">${escapeHtml(product.selo)}</span>`
    : product.destaque
      ? `<span class="badge">Destaque Belluno</span>`
      : "";
  const whatsappMessage = `Olá, Belluno Essenza! Tenho interesse no produto ${product.nome} (${product.sku}). Pode me ajudar com o pedido?`;

  container.innerHTML = `
    <div class="product-detail-surface">
      <div class="product-layout">
        <div class="product-gallery">
          <div class="product-main-image">
            <img
              id="active-product-image"
              src="${escapeHtml(images[0])}"
              alt="${escapeHtml(`Imagem principal de ${product.nome}`)}"
              data-fallback-src="${escapeHtml(SITE_CONFIG.fallbackImage)}"
            >
          </div>
          <div class="product-thumbs">
            ${images.map((image, index) => `
              <button class="product-thumb ${index === 0 ? "is-active" : ""}" type="button" data-product-thumb data-image="${escapeHtml(image)}" data-alt="${escapeHtml(`Imagem ${index + 1} de ${product.nome}`)}">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(`Miniatura ${index + 1} de ${product.nome}`)}" loading="lazy" data-fallback-src="${escapeHtml(SITE_CONFIG.fallbackImage)}">
              </button>
            `).join("")}
          </div>
        </div>

        <div class="product-summary">
          ${badge}
          <p class="product-category">${escapeHtml(product.categoria)} · ${escapeHtml(product.familia_olfativa)}</p>
          <h1>${escapeHtml(product.nome)}</h1>
          <p class="product-subtitle">${escapeHtml(product.subtitulo || product.descricao_curta)}</p>
          <div class="price-stack">
            <span class="price-current">${formatCurrency(currentPrice)}</span>
            ${oldPrice}
          </div>
          <p class="product-long-copy">${escapeHtml(product.descricao_curta || product.descricao_completa)}</p>

          <div class="product-meta-grid">
            <div class="product-meta-item">
              <strong>Volume</strong>
              <span>${escapeHtml(product.volume)}</span>
            </div>
            <div class="product-meta-item">
              <strong>Tempo de queima</strong>
              <span>${escapeHtml(product.tempo_queima)}</span>
            </div>
            <div class="product-meta-item">
              <strong>SKU</strong>
              <span>${escapeHtml(product.sku)}</span>
            </div>
            <div class="product-meta-item">
              <strong>Estoque</strong>
              <span>${product.estoque != null ? `${product.estoque} unidades` : "Sob consulta"}</span>
            </div>
          </div>

          <div class="hero-actions">
            <a class="button button-primary" href="${buildWhatsAppLink(whatsappMessage)}" target="_blank" rel="noreferrer">Comprar / Falar no WhatsApp</a>
            <a class="button button-secondary" href="catalogo.html">Voltar ao catálogo</a>
          </div>
        </div>
      </div>

      <div class="notes-grid">
        ${noteCards.map((note) => `
          <article class="note-card">
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
          </article>
        `).join("")}
      </div>

      <div class="detail-grid">
        ${details.map((detail) => `
          <article class="detail-card">
            <h3>${escapeHtml(detail.title)}</h3>
            <p>${escapeHtml(detail.content)}</p>
          </article>
        `).join("")}
      </div>
    </div>
  `;
  setupImageFallbacks(container);
}

function setupProductGallery(container) {
  const mainImage = container.querySelector("#active-product-image");
  const thumbs = container.querySelectorAll("[data-product-thumb]");

  if (!mainImage || !thumbs.length) {
    return;
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((item) => item.classList.remove("is-active"));
      thumb.classList.add("is-active");
      mainImage.src = thumb.dataset.image;
      mainImage.alt = thumb.dataset.alt;
    });
  });
}

function updateProductMeta(product) {
  const title = product.meta_title || `${product.nome} | ${SITE_CONFIG.brandName}`;
  const description = product.meta_description || product.descricao_curta || product.descricao_completa;
  const image = new URL(product.imagens[0] || SITE_CONFIG.fallbackImage, `${window.location.origin}${window.location.pathname}`).href;
  const canonicalUrl = `${SITE_CONFIG.domain}/produto.html?slug=${encodeURIComponent(product.slug)}`;

  document.title = title;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonicalUrl);
  setMeta('meta[property="og:image"]', image);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute("href", canonicalUrl);
  }

  let script = document.getElementById("structured-data-product");
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "structured-data-product";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nome,
    image: product.imagens,
    description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.brandName
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: getCurrentPrice(product),
      availability: product.disponivel ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: canonicalUrl
    }
  });
}

function setMeta(selector, value) {
  const meta = document.querySelector(selector);
  if (meta && value) {
    meta.setAttribute("content", value);
  }
}

function renderError(container, message) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="empty-state">
      <h2>Ops</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function initContact() {
  const form = document.getElementById("contact-form");

  if (!form) {
    return;
  }

  const feedback = form.querySelector(".form-feedback");
  const followup = document.getElementById("contact-whatsapp-followup");
  const followupLink = document.getElementById("contact-whatsapp-link");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = textOrFallback(data.get("name"));
    const email = textOrFallback(data.get("email"));
    const phone = textOrFallback(data.get("phone"));
    const interest = textOrFallback(data.get("interest"));
    const message = textOrFallback(data.get("message"));

    const whatsappMessage = [
      `Olá, ${SITE_CONFIG.brandName}!`,
      `Meu nome é ${name}.`,
      `Interesse: ${interest}.`,
      email ? `E-mail: ${email}.` : "",
      phone ? `Telefone: ${phone}.` : "",
      `Mensagem: ${message}`
    ].filter(Boolean).join(" ");

    if (followup && followupLink) {
      followupLink.setAttribute("href", buildWhatsAppLink(whatsappMessage));
      followup.hidden = false;
    }

    if (feedback) {
      feedback.textContent = "Sua mensagem foi preparada. Clique no botao abaixo para continuar no WhatsApp.";
    }
  });
}
