// Replace with your actual WhatsApp business number (country code + number, no '+' or spaces)
const WHATSAPP_NUMBER = "2348038481000";

const elixirs = [
  {
    id: "nocturne-elixir",
    name: "NOCTURNE OVERNIGHT ELIXIR",
    category: "night-repair",
    potencyLabel: "98% BIO-ACTIVE",
    potencyScore: 98,
    notes: "Blue Tansy · Bakuchiol · Cold-Pressed Marula",
    prices: { "30ml": 28500, "50ml": 44000 },
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "abyssal-nectar",
    name: "ABYSSAL CELLULAR NECTAR",
    category: "night-repair",
    potencyLabel: "96% HYDRATION LOCK",
    potencyScore: 96,
    notes: "Marine Kelp · Squalane · Evening Primrose",
    prices: { "30ml": 32000, "50ml": 49500 },
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "aurelia-gold-oil",
    name: "AURELIA BOTANICAL RESERVE",
    category: "botanical-oils",
    potencyLabel: "100% COLD-PRESSED",
    potencyScore: 100,
    notes: "Prickly Pear Seed · Frankincense · Rosehip",
    prices: { "30ml": 35000, "50ml": 54000 },
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "verdant-dew-serum",
    name: "VERDANT CHLOROPHYLL DEW",
    category: "botanical-oils",
    potencyLabel: "94% CALMING COMPLEX",
    potencyScore: 94,
    notes: "Centella Asiatica · Hemp Seed · Neroli",
    prices: { "30ml": 26500, "50ml": 41000 },
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "solstice-ritual-kit",
    name: "MIDNIGHT TRIO DISCOVERY KIT",
    category: "discovery",
    potencyLabel: "3 × 15ML COFFRET",
    potencyScore: 99,
    notes: "Nocturne Elixir · Abyssal Nectar · Aurelia Reserve",
    prices: { "30ml": 45000, "50ml": 68000 },
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "obsidia-barrier-drops",
    name: "OBSIDIA BARRIER RECOVERY DROPS",
    category: "night-repair",
    potencyLabel: "95% LIPID REPAIR",
    potencyScore: 95,
    notes: "Black Cumin · Ceramide Complex · Tamanu",
    prices: { "30ml": 29500, "50ml": 46000 },
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80"
  }
];

// Track selected bottle size per card & persistent regimen cart
const selectedSizes = {};
elixirs.forEach((item) => (selectedSizes[item.id] = "30ml"));

let cart = JSON.parse(localStorage.getItem("vg_regimen_cart")) || [];
let activeCategory = "all";

// DOM References
const productGrid = document.getElementById("productGrid");
const filterBar = document.getElementById("filterBar");
const cartCountEl = document.getElementById("cartCount");
const drawerOverlay = document.getElementById("drawerOverlay");
const regimenDrawer = document.getElementById("regimenDrawer");
const openDrawerBtn = document.getElementById("openDrawerBtn");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");
const drawerItemsEl = document.getElementById("drawerItems");
const subtotalAmountEl = document.getElementById("subtotalAmount");
const whatsappCheckoutBtn = document.getElementById("whatsappCheckoutBtn");

const formatNaira = (amount) => `₦${amount.toLocaleString("en-NG")}`;

// Render Product Cards
function renderProducts() {
  const filtered =
    activeCategory === "all"
      ? elixirs
      : elixirs.filter((item) => item.category === activeCategory);

  productGrid.innerHTML = filtered
    .map((item) => {
      const currentSize = selectedSizes[item.id];
      const currentPrice = item.prices[currentSize];

      return `
        <article class="product-card" data-id="${item.id}">
          <div class="card-top">
            <span class="potency-tag">${item.potencyLabel}</span>
            <span class="stock-pill">IN STOCK</span>
          </div>
          <div class="card-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
          </div>
          <div class="card-body">
            <h3>${item.name}</h3>
            <p class="notes">${item.notes}</p>
            <div class="potency-bar"><span style="width: ${item.potencyScore}%"></span></div>
            <p class="price">${formatNaira(currentPrice)}</p>
            <div class="size-selector">
              <button class="size-btn ${currentSize === "30ml" ? "active" : ""}" data-action="size" data-size="30ml">30ml</button>
              <button class="size-btn ${currentSize === "50ml" ? "active" : ""}" data-action="size" data-size="50ml">50ml</button>
            </div>
            <button class="btn-add" data-action="add">+ ADD TO REGIMEN</button>
          </div>
        </article>
      `;
    })
    .join("");
}

// Category Filtering
filterBar.addEventListener("click", (e) => {
  const pill = e.target.closest(".filter-pill");
  if (!pill) return;

  document.querySelectorAll(".filter-pill").forEach((btn) => btn.classList.remove("active"));
  pill.classList.add("active");
  activeCategory = pill.dataset.category;
  renderProducts();
});

// Product Card Interactions (Size Toggle & Add to Regimen)
productGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const id = card.dataset.id;
  const action = e.target.dataset.action;

  if (action === "size") {
    selectedSizes[id] = e.target.dataset.size;
    renderProducts();
  }

  if (action === "add") {
    const product = elixirs.find((p) => p.id === id);
    const size = selectedSizes[id];
    const cartKey = `${id}-${size}`;
    const existing = cart.find((c) => c.key === cartKey);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        key: cartKey,
        id: product.id,
        name: product.name,
        size,
        price: product.prices[size],
        image: product.image,
        qty: 1
      });
    }

    saveAndRenderCart();
    openDrawer();
  }
});

// Cart Drawer Controls
function openDrawer() {
  drawerOverlay.classList.add("open");
  regimenDrawer.classList.add("open");
  regimenDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  drawerOverlay.classList.remove("open");
  regimenDrawer.classList.remove("open");
  regimenDrawer.setAttribute("aria-hidden", "true");
}

openDrawerBtn.addEventListener("click", openDrawer);
closeDrawerBtn.addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

// Save & Render Cart Items
function saveAndRenderCart() {
  localStorage.setItem("vg_regimen_cart", JSON.stringify(cart));

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = totalItems;

  if (cart.length === 0) {
    drawerItemsEl.innerHTML = `<p class="empty-msg">Your regimen is currently empty.</p>`;
    subtotalAmountEl.textContent = "₦0";
    return;
  }

  let subtotal = 0;
  drawerItemsEl.innerHTML = cart
    .map((item) => {
      const lineTotal = item.price * item.qty;
      subtotal += lineTotal;

      return `
        <div class="drawer-item" data-key="${item.key}">
          <img src="${item.image}" alt="${item.name}" />
          <div class="drawer-item-info">
            <div class="drawer-item-title">${item.name}</div>
            <div class="drawer-item-meta">Size: ${item.size}</div>
            <div class="qty-controls">
              <button class="qty-btn" data-cart-action="dec" aria-label="Decrease quantity">&minus;</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-cart-action="inc" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="drawer-item-right">
            <button class="remove-item-btn" data-cart-action="remove">Remove</button>
            <span class="drawer-item-price">${formatNaira(lineTotal)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  subtotalAmountEl.textContent = formatNaira(subtotal);
}

// Quantity & Remove Handlers inside Drawer
drawerItemsEl.addEventListener("click", (e) => {
  const action = e.target.dataset.cartAction;
  if (!action) return;

  const itemRow = e.target.closest(".drawer-item");
  const key = itemRow.dataset.key;
  const index = cart.findIndex((item) => item.key === key);
  if (index === -1) return;

  if (action === "inc") {
    cart[index].qty += 1;
  } else if (action === "dec") {
    if (cart[index].qty > 1) {
      cart[index].qty -= 1;
    } else {
      cart.splice(index, 1);
    }
  } else if (action === "remove") {
    cart.splice(index, 1);
  }

  saveAndRenderCart();
});

// WhatsApp Concierge Checkout Generator with Mandatory Field Checks
whatsappCheckoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your regimen is empty. Select an elixir first.");
    return;
  }

  const nameInput = document.getElementById("customerName");
  const cityInput = document.getElementById("deliveryCity");
  
  const name = nameInput.value.trim();
  const city = cityInput.value.trim();

  if (!name || !city) {
    alert("Please fill in your name and delivery city before checking out.");
    if (!name) nameInput.focus();
    else cityInput.focus();
    return;
  }

  let subtotal = 0;
  const itemLines = cart
    .map((item, idx) => {
      const lineTotal = item.price * item.qty;
      subtotal += lineTotal;
      return `${idx + 1}. ${item.name} (${item.size}) × ${item.qty} — ${formatNaira(lineTotal)}`;
    })
    .join("\n");

  const message =
    `Hello VERDANT & GOLD Concierge,\n\n` +
    `I would like to place an order:\n\n` +
    `${itemLines}\n\n` +
    `*Subtotal:* ${formatNaira(subtotal)}\n` +
    `*Client Name:* ${name}\n` +
    `*Delivery City:* ${city}\n\n` +
    `Please confirm bank details and dispatch timeline.`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
});

// Initialize Page
renderProducts();
saveAndRenderCart();