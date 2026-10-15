const MENU = [
  { id: 1, name: "Beef Sukiyaki", category: "Main", price: 220 },
  { id: 2, name: "Pork Sukiyaki", category: "Main", price: 180 },
  { id: 3, name: "Chicken Sukiyaki", category: "Main", price: 160 },
  { id: 4, name: "Tofu", category: "Side", price: 40 },
  { id: 5, name: "Cabbage", category: "Side", price: 35 },
  { id: 6, name: "Green Tea", category: "Drink", price: 30 },
  { id: 7, name: "Soft Drink", category: "Drink", price: 35 },
];

const state = {
  cart: {},
  tableNumber: "",
  lastOrder: null,
};

function formatPrice(amount) {
  return "฿" + amount;
}

function findMenuItem(id) {
  return MENU.find(function (item) {
    return item.id === id;
  });
}

function renderMenu() {
  const menuEl = document.getElementById("menu");
  menuEl.innerHTML = "";

  const categories = [];
  MENU.forEach(function (item) {
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  });

  categories.forEach(function (category) {
    const heading = document.createElement("h3");
    heading.className = "menu-category";
    heading.textContent = category;
    menuEl.appendChild(heading);

    MENU.filter(function (item) {
      return item.category === category;
    }).forEach(function (item) {
      const row = document.createElement("div");
      row.className = "menu-item";

      const info = document.createElement("div");
      info.className = "info";

      const name = document.createElement("span");
      name.textContent = item.name;

      const price = document.createElement("span");
      price.className = "price";
      price.textContent = formatPrice(item.price);

      info.appendChild(name);
      info.appendChild(price);

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Add";
      button.dataset.add = item.id;

      row.appendChild(info);
      row.appendChild(button);
      menuEl.appendChild(row);
    });
  });
}

function calculateTotal() {
  let total = 0;
  Object.keys(state.cart).forEach(function (id) {
    const item = findMenuItem(Number(id));
    total += item.price * state.cart[id];
  });
  return total;
}

function renderCart() {
  const cartEl = document.getElementById("cart");
  cartEl.innerHTML = "";

  const ids = Object.keys(state.cart);

  if (ids.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Your cart is empty.";
    cartEl.appendChild(empty);
  }

  ids.forEach(function (id) {
    const item = findMenuItem(Number(id));
    const quantity = state.cart[id];

    const row = document.createElement("div");
    row.className = "cart-row";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = item.name;

    const qty = document.createElement("span");
    qty.className = "qty";
    qty.textContent = quantity + " x " + formatPrice(item.price);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Remove";
    button.dataset.remove = item.id;

    row.appendChild(name);
    row.appendChild(qty);
    row.appendChild(button);
    cartEl.appendChild(row);
  });

  document.getElementById("total").textContent = formatPrice(calculateTotal());
  updateConfirmButton();
}

function addToCart(id) {
  const key = String(id);
  if (state.cart[key]) {
    state.cart[key] += 1;
  } else {
    state.cart[key] = 1;
  }
  renderCart();
}

function removeFromCart(id) {
  const key = String(id);
  if (!state.cart[key]) {
    return;
  }
  state.cart[key] -= 1;
  if (state.cart[key] === 0) {
    delete state.cart[key];
  }
  renderCart();
}

function isTableNumberValid() {
  const value = Number(state.tableNumber);
  return Number.isInteger(value) && value > 0;
}

function readTableNumber() {
  const input = document.getElementById("table-number");
  state.tableNumber = input.value;
  document.getElementById("table-error").textContent =
    state.tableNumber && !isTableNumberValid()
      ? "Please enter a table number of 1 or more."
      : "";
  updateConfirmButton();
}

function updateConfirmButton() {
  const cartHasItems = Object.keys(state.cart).length > 0;
  document.getElementById("confirm-btn").disabled = !(
    cartHasItems && isTableNumberValid()
  );
}

function confirmOrder() {
  const items = Object.keys(state.cart).map(function (id) {
    const item = findMenuItem(Number(id));
    return {
      name: item.name,
      price: item.price,
      quantity: state.cart[id],
    };
  });

  state.lastOrder = {
    tableNumber: Number(state.tableNumber),
    items: items,
    total: calculateTotal(),
    time: new Date().toLocaleString(),
  };

  renderOrderSummary();
  document.getElementById("summary").scrollIntoView({ behavior: "smooth" });
}

function renderOrderSummary() {
  const summaryEl = document.getElementById("summary");
  const body = document.getElementById("summary-body");
  body.innerHTML = "";

  const order = state.lastOrder;

  const meta = document.createElement("p");
  meta.className = "summary-meta";
  meta.textContent = "Table " + order.tableNumber + " · " + order.time;
  body.appendChild(meta);

  order.items.forEach(function (line) {
    const row = document.createElement("div");
    row.className = "summary-line";

    const name = document.createElement("span");
    name.textContent = line.quantity + " x " + line.name;

    const price = document.createElement("span");
    price.textContent = formatPrice(line.price * line.quantity);

    row.appendChild(name);
    row.appendChild(price);
    body.appendChild(row);
  });

  const total = document.createElement("div");
  total.className = "summary-total";

  const totalLabel = document.createElement("span");
  totalLabel.textContent = "Total";

  const totalValue = document.createElement("span");
  totalValue.textContent = formatPrice(order.total);

  total.appendChild(totalLabel);
  total.appendChild(totalValue);
  body.appendChild(total);

  summaryEl.classList.remove("hidden");
}

function resetOrder() {
  state.cart = {};
  state.tableNumber = "";
  state.lastOrder = null;

  document.getElementById("table-number").value = "";
  document.getElementById("table-error").textContent = "";
  document.getElementById("summary").classList.add("hidden");

  renderCart();
}

function init() {
  renderMenu();
  renderCart();

  document.getElementById("menu").addEventListener("click", function (event) {
    if (event.target.dataset.add) {
      addToCart(Number(event.target.dataset.add));
    }
  });

  document.getElementById("cart").addEventListener("click", function (event) {
    if (event.target.dataset.remove) {
      removeFromCart(Number(event.target.dataset.remove));
    }
  });

  document.getElementById("table-number").addEventListener("input", readTableNumber);
  document.getElementById("confirm-btn").addEventListener("click", confirmOrder);
  document.getElementById("reset-btn").addEventListener("click", resetOrder);
}

init();
