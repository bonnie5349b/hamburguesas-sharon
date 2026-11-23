/**
 * DATOS ESTRICTOS DEL MENÚ - HAMBURGUESAS SHARON
 * Extraído únicamente de las cartas oficiales:
 * 1. Menú principal (Hamburguesas, Hot-Dog, Sincronizadas, Alitas, Papas, Refrescos)
 * 2. Menú de Combos (Combos 1, 2, 3, 4, Familiar y Familiar 2)
 */

const RESTAURANT_INFO = {
  name: "Hamburguesas Sharon",
  slogan: "Servicio a Domicilio Gratis • Servicio Pickup",
  phones: [
    { display: "772 736 5672", raw: "527727365672", isWhatsapp: true, label: "WhatsApp (Pedidos)" },
    { display: "738 145 78 10", raw: "527381457810", isWhatsapp: false, label: "Teléfono 1" },
    { display: "738 145 76 11", raw: "527381457611", isWhatsapp: false, label: "Teléfono 2" }
  ],
  whatsappNumber: "527727365672"
};

// Ingredientes oficiales indicados en el menú:
// "Todas nuestras hamburguesas incluyen: Jamón, tocino, salchicha, queso oaxaca, queso amarillo, jitomate, chile, piña, mayonesa, cátsup y mostaza"
const INGREDIENTES_OFICIALES = [
  "Jamón",
  "Tocino",
  "Salchicha",
  "Queso Oaxaca",
  "Queso Amarillo",
  "Jitomate",
  "Chile",
  "Piña",
  "Mayonesa",
  "Cátsup",
  "Mostaza"
];

// Aderezos oficiales indicados en el menú:
// "Aderezos: Cátsup, queso amarillo, salsa valentina, bbq y tajín"
const ADEREZOS_OFICIALES = [
  "Cátsup",
  "Queso Amarillo",
  "Salsa Valentina",
  "BBQ",
  "Tajín"
];

const MENU_CATEGORIES = [
  { id: "all", name: "Todo el Menú", icon: "utensils" },
  { id: "hamburguesas", name: "Hamburguesas", icon: "sandwich" },
  { id: "combos", name: "Combos", icon: "sparkles" },
  { id: "hotdogs-sincronizadas", name: "Hot-Dog y Sincronizadas", icon: "flame" },
  { id: "alitas-papas", name: "Alitas y Papas", icon: "drumstick" },
  { id: "bebidas", name: "Refrescos", icon: "cup-soda" }
];

const MENU_ITEMS = [
  // ==========================================
  // 1. HAMBURGUESAS (Foto 1)
  // ==========================================
  {
    id: "hamburguesa-res",
    name: "Hamburguesa de Res",
    category: "hamburguesas",
    hasSizes: true,
    sizes: [
      { name: "Normal", price: 50 },
      { name: "Grande", price: 60 }
    ],
    price: 50,
    badge: "⭐ Clásica",
    description: "Incluye: Jamón, tocino, salchicha, queso oaxaca, queso amarillo, jitomate, chile, piña, mayonesa, cátsup y mostaza.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    ingredients: INGREDIENTES_OFICIALES
  },
  {
    id: "hamburguesa-pollo",
    name: "Hamburguesa de Pollo",
    category: "hamburguesas",
    hasSizes: false,
    price: 65,
    badge: "🍗 Pollo",
    description: "Incluye: Jamón, tocino, salchicha, queso oaxaca, queso amarillo, jitomate, chile, piña, mayonesa, cátsup y mostaza.",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
    ingredients: INGREDIENTES_OFICIALES
  },
  {
    id: "hamburguesa-arrachera",
    name: "Hamburguesa de Arrachera",
    category: "hamburguesas",
    hasSizes: false,
    price: 70,
    badge: "🥩 Arrachera",
    description: "Incluye: Jamón, tocino, salchicha, queso oaxaca, queso amarillo, jitomate, chile, piña, mayonesa, cátsup y mostaza.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
    ingredients: INGREDIENTES_OFICIALES
  },

  // ==========================================
  // 2. COMBOS (Foto 2)
  // ==========================================
  {
    id: "combo-1",
    name: "Combo 1",
    category: "combos",
    price: 110,
    badge: "🔥 $110",
    description: "Hamburguesa de res normal, 3 alitas y porción de papas fritas.",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
    includes: [
      "Hamburguesa de res normal",
      "3 Alitas",
      "Porción de papas fritas"
    ],
    allowsCustomBurger: true,
    allowsDressingSelection: true
  },
  {
    id: "combo-2",
    name: "Combo 2",
    category: "combos",
    price: 100,
    badge: "🥤 $100",
    description: "Hamburguesa de res normal, 1 refresco y porción de papas fritas.",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80",
    includes: [
      "Hamburguesa de res normal",
      "1 Refresco",
      "Porción de papas fritas"
    ],
    allowsCustomBurger: true
  },
  {
    id: "combo-3",
    name: "Combo 3",
    category: "combos",
    price: 100,
    badge: "🌭 $100",
    description: "Hamburguesa de res normal, 1 hot – dog y porción de papas fritas.",
    image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80",
    includes: [
      "Hamburguesa de res normal",
      "1 Hot – Dog",
      "Porción de papas fritas"
    ],
    allowsCustomBurger: true
  },
  {
    id: "combo-4",
    name: "Combo 4",
    category: "combos",
    price: 120,
    badge: "👑 $120",
    description: "Hamburguesa de res normal, 1 hot – dog, 2 alitas y porción de papas fritas.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    includes: [
      "Hamburguesa de res normal",
      "1 Hot – Dog",
      "2 Alitas",
      "Porción de papas fritas"
    ],
    allowsCustomBurger: true,
    allowsDressingSelection: true
  },
  {
    id: "combo-familiar",
    name: "Combo Familiar",
    category: "combos",
    price: 310,
    badge: "👨‍👩‍👧‍👦 $310",
    description: "4 hamburguesas de res grande, 1 orden de papas a la francesa y 1 refresco de 2l.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
    includes: [
      "4 Hamburguesas de res grande",
      "1 Orden de papas a la francesa",
      "1 Refresco de 2 Litros"
    ]
  },
  {
    id: "combo-familiar-2",
    name: "Combo Familiar 2",
    category: "combos",
    price: 330,
    badge: "👨‍👩‍👧‍👦 $330",
    description: "1 hamburguesa de arrachera, 1 hamburguesa de pollo, 2 hamburguesas de res grande, 1 orden de papas a la francesa y 1 refresco de 2l.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    includes: [
      "1 Hamburguesa de arrachera",
      "1 Hamburguesa de pollo",
      "2 Hamburguesas de res grande",
      "1 Orden de papas a la francesa",
      "1 Refresco de 2 Litros"
    ]
  },

  // ==========================================
  // 3. HOT-DOG Y SINCRONIZADAS (Foto 1)
  // ==========================================
  {
    id: "hot-dog",
    name: "Hot - Dog",
    category: "hotdogs-sincronizadas",
    price: 40,
    badge: "$40",
    description: "Nuestro hot-dog especial incluye: Jamón, tocino, salchicha, queso oaxaca, queso amarillo, jitomate, chile, piña, mayonesa, cátsup y mostaza.",
    image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80",
    ingredients: INGREDIENTES_OFICIALES
  },
  {
    id: "sincronizadas",
    name: "Sincronizadas",
    category: "hotdogs-sincronizadas",
    price: 40,
    badge: "$40",
    description: "Nuestro sincronizada incluye: Jamón, queso oaxaca, queso amarillo, jitomate, chile, piña, mayonesa, cátsup y mostaza.",
    image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80",
    ingredients: [
      "Jamón",
      "Queso Oaxaca",
      "Queso Amarillo",
      "Jitomate",
      "Chile",
      "Piña",
      "Mayonesa",
      "Cátsup",
      "Mostaza"
    ]
  },

  // ==========================================
  // 4. ALITAS Y PAPAS (Foto 1)
  // ==========================================
  {
    id: "orden-alitas",
    name: "Orden de Alitas",
    category: "alitas-papas",
    price: 70,
    badge: "$70",
    description: "Incluye porción de papas. Aderezos: Cátsup, queso amarillo, salsa valentina, bbq y tajín.",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
    dressings: ADEREZOS_OFICIALES,
    allowsDressingSelection: true
  },
  {
    id: "orden-papas",
    name: "Orden de Papas",
    category: "alitas-papas",
    price: 60,
    badge: "$60",
    description: "Orden de papas a la francesa crujientes y doraditas.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    dressings: ADEREZOS_OFICIALES,
    allowsDressingSelection: true
  },

  // ==========================================
  // 5. BEBIDAS / REFRESCOS (Foto 1)
  // ==========================================
  {
    id: "refrescos",
    name: "Refrescos",
    category: "bebidas",
    price: 30,
    badge: "$30",
    description: "Refrescos fríos para acompañar tu orden.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    options: ["Coca-Cola", "Manzana", "Sprite", "Fanta", "Squirt", "Pepsi"]
  }
];
