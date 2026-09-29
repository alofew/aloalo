// 공통 헤더/푸터를 모든 페이지에 삽입
document.getElementById("site-header").innerHTML = `
  <div class="notice">FREE SHIPPING OVER ₩300,000</div>
  <nav class="nav">
    <a href="products.html" class="nav-left">SHOP</a>
    <a href="index.html" class="logo">ALOALO</a>
    <a href="cart.html" class="nav-right">CART (<span id="cart-count">0</span>)</a>
  </nav>`;
document.getElementById("site-footer").innerHTML = `
  <div class="footer-inner">
    <p>ALOALO — 학습용 쇼핑몰 프로젝트입니다. 실제 결제·판매는 이뤄지지 않습니다.</p>
    <p>© 2026 ALOALO</p>
  </div>`;
Cart.updateBadge();

const productCard = (p) => `
  <a class="card" href="product.html?id=${p.id}">
    <div class="thumb">${p.id <= 2 ? '<em class="tag">NEW</em>' : ""}<span>${p.name}</span></div>
    <div class="card-name">${p.name}</div>
    <div class="card-price">${won(p.price)}</div>
  </a>`;
