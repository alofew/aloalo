// 장바구니: localStorage에 저장해서 새로고침해도 유지
const CART_KEY = "aloalo_cart";
const Cart = {
  load() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } },
  save(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); Cart.updateBadge(); },
  add(id, size, qty = 1) {
    const items = Cart.load();
    const found = items.find((i) => i.id === id && i.size === size);
    if (found) found.qty += qty; else items.push({ id, size, qty });
    Cart.save(items);
  },
  setQty(id, size, qty) {
    let items = Cart.load();
    items = items.map((i) => (i.id === id && i.size === size ? { ...i, qty } : i)).filter((i) => i.qty > 0);
    Cart.save(items);
  },
  remove(id, size) { Cart.save(Cart.load().filter((i) => !(i.id === id && i.size === size))); },
  count() { return Cart.load().reduce((s, i) => s + i.qty, 0); },
  total() { return Cart.load().reduce((s, i) => s + PRODUCTS.find((p) => p.id === i.id).price * i.qty, 0); },
  updateBadge() { const el = document.getElementById("cart-count"); if (el) el.textContent = Cart.count(); }
};
