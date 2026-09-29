// 상품 데이터 (나중에 React로 옮길 때 그대로 JSON으로 재사용)
const PRODUCTS = [
  { id: 1, name: "Classic Logo Hoodie", category: "hoodie", price: 289000, sizes: ["S", "M", "L", "XL"], desc: "헤비웨이트 코튼 후드. 빈티지 워싱 처리." },
  { id: 2, name: "Distressed Tee", category: "tee", price: 129000, sizes: ["S", "M", "L", "XL"], desc: "데미지 디테일이 들어간 오버사이즈 티셔츠." },
  { id: 3, name: "Washed Denim Pants", category: "pants", price: 359000, sizes: ["28", "30", "32", "34"], desc: "와이드 핏 워싱 데님." },
  { id: 4, name: "Vintage Zip Jacket", category: "outer", price: 459000, sizes: ["M", "L", "XL"], desc: "지퍼 포켓이 있는 빈티지 자켓." },
  { id: 5, name: "Graphic Long Sleeve", category: "tee", price: 159000, sizes: ["S", "M", "L"], desc: "그래픽 프린트 롱슬리브." },
  { id: 6, name: "Wool Knit Cardigan", category: "outer", price: 389000, sizes: ["S", "M", "L"], desc: "루즈 핏 울 니트 가디건." },
  { id: 7, name: "Cargo Shorts", category: "pants", price: 189000, sizes: ["S", "M", "L"], desc: "멀티 포켓 카고 쇼츠." },
  { id: 8, name: "Panel Zip Hoodie", category: "hoodie", price: 319000, sizes: ["M", "L", "XL"], desc: "패널 스티치 지퍼 후드." }
];
const CATEGORIES = [
  { key: "all", label: "ALL" }, { key: "hoodie", label: "HOODIE" }, { key: "tee", label: "TEE" },
  { key: "outer", label: "OUTER" }, { key: "pants", label: "PANTS" }
];
const won = (n) => "₩" + n.toLocaleString("ko-KR");
