const menuCards = Array.from(
  document.querySelectorAll("#explor-menu .explor-menu-card"),
);
const basket = new Map();
const prices = [189, 229, 249, 269, 299, 279, 239, 299, 199, 229, 189, 149, 99];
const menuSection = document.querySelector("#explor-menu .explor-menu-section");
const menuGrid = menuSection.querySelector(".row");

const filters = document.createElement("div");
filters.className = "menu-filters";
filters.setAttribute("aria-label", "Filter menu");

[
  ["all", "All dishes"],
  ["veg", "Vegetarian"],
  ["non-veg", "Non-vegetarian"],
].forEach(([value, label], index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `menu-filter${index === 0 ? " active" : ""}`;
  button.dataset.filter = value;
  button.textContent = label;
  filters.append(button);
});

menuGrid.before(filters);

menuCards.forEach((card, index) => {
  const titleElement = card.querySelector(".explor-menu-titel");
  const title = titleElement.textContent.trim();
  const category = /non.?veg|chicken|mutton|fish/i.test(title)
    ? "non-veg"
    : "veg";
  const image = card.querySelector("img");
  const details = document.createElement("div");
  const price = prices[index] || 199;
  const button = document.createElement("button");

  image.alt = title;
  card.dataset.category = category;
  details.className = "menu-item-meta";

  const priceLabel = document.createElement("span");
  priceLabel.className = "menu-price";
  priceLabel.textContent = `₹${price}`;

  button.type = "button";
  button.className = "add-to-order";
  button.dataset.addItem = title;
  button.dataset.price = price;
  button.textContent = "Add to basket";

  details.append(priceLabel, button);
  titleElement.after(details);
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest(".menu-filter");
  if (!button) return;

  filters.querySelectorAll(".menu-filter").forEach((filter) => {
    filter.classList.toggle("active", filter === button);
  });

  menuCards.forEach((card) => {
    card.closest("[class*='col-']").hidden =
      button.dataset.filter !== "all" &&
      card.dataset.category !== button.dataset.filter;
  });
});

const basketItems = document.querySelector("#basket-items");
const basketTotal = document.querySelector("#basket-total");
const basketCount = document.querySelector("#basket-count");
const basketLink = document.querySelector('a[href="#basket"]');
const checkoutButton = document.querySelector(".checkout-btn");

function renderBasket() {
  basketItems.replaceChildren();
  let total = 0;
  let itemCount = 0;

  if (basket.size === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "basket-empty";
    emptyMessage.textContent =
      "Your basket is empty. Add something delicious from the menu.";
    basketItems.append(emptyMessage);
  }

  basket.forEach((item, name) => {
    total += item.price * item.quantity;
    itemCount += item.quantity;

    const row = document.createElement("div");
    row.className = "basket-row";

    const itemName = document.createElement("strong");
    itemName.textContent = name;

    const itemPrice = document.createElement("span");
    itemPrice.textContent = `₹${item.price * item.quantity}`;

    const controls = document.createElement("div");
    controls.className = "basket-controls";

    [
      ["decrease", "−"],
      ["increase", "+"],
    ].forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quantity-button";
      button.dataset.action = action;
      button.dataset.name = name;
      button.setAttribute(
        "aria-label",
        `${action === "increase" ? "Add one" : "Remove one"} ${name}`,
      );
      button.textContent = label;
      controls.append(button);
    });

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;
    controls.append(quantity);
    row.append(itemName, itemPrice, controls);
    basketItems.append(row);
  });

  basketTotal.textContent = `₹${total}`;
  basketCount.textContent = `(${itemCount})`;
  basketLink.setAttribute("aria-label", `Basket, ${itemCount} items`);
  checkoutButton.disabled = basket.size === 0;
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-item]");
  if (addButton) {
    const name = addButton.dataset.addItem;
    const item = basket.get(name) || {
      price: Number(addButton.dataset.price),
      quantity: 0,
    };
    item.quantity += 1;
    basket.set(name, item);
    renderBasket();
    return;
  }

  const quantityButton = event.target.closest("[data-action]");
  if (!quantityButton) return;

  const item = basket.get(quantityButton.dataset.name);
  if (!item) return;
  item.quantity += quantityButton.dataset.action === "increase" ? 1 : -1;

  if (item.quantity <= 0) basket.delete(quantityButton.dataset.name);
  else basket.set(quantityButton.dataset.name, item);
  renderBasket();
});

document.querySelector("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (basket.size === 0) return;

  const customerName = document.querySelector("#customer-name").value.trim();
  document.querySelector("#order-message").textContent =
    `Thanks, ${customerName}. Your order summary is ready. Connect a restaurant phone number or ordering service to submit real orders.`;
});

renderBasket();
