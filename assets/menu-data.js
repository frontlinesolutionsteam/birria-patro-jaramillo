/* ===================== SHARED OPTION SETS ===================== */
const MEAT_CHOICES = ["Birria (Lamb)", "Carne Asada", "Carnitas", "Cabeza", "Chorizo", "Shrimp"];
const STYLE_CHOICES = ["Normal (Classic Steamed)", "Revolcada (Grilled with Onions)"];
const TORTILLA_CHOICES = [
  { name: "Corn", extra: 0 },
  { name: "Flour", extra: 0 },
  { name: "Handmade Corn", extra: 1.0 },
];
const ADDONS = [
  { name: "Extra Consomé 8oz", extra: 1.5 },
  { name: "Avocado", extra: 1.0 },
  { name: "Extra Cheese", extra: 1.0 },
];

/* ===================== CATEGORIES ===================== */
const CATEGORIES = [
  { key: "tacos", emoji: "🌮", label: "Birria Tacos" },
  { key: "plates", emoji: "🍲", label: "Birria Plates" },
  { key: "burritos", emoji: "🌯", label: "Burritos" },
  { key: "quesadillas", emoji: "🧀", label: "Quesadillas" },
  { key: "tostadas", emoji: "🥙", label: "Tostadas" },
  { key: "nachos", emoji: "🍟", label: "Nachos" },
  { key: "mariscos", emoji: "🦐", label: "Mariscos" },
  { key: "breakfast", emoji: "🍳", label: "Breakfast" },
  { key: "menudo", emoji: "🍜", label: "Menudo" },
  { key: "especiales", emoji: "🎉", label: "Especiales" },
  { key: "sides", emoji: "🥗", label: "Sides" },
  { key: "kids", emoji: "👶", label: "Kids" },
  { key: "dessert", emoji: "🍮", label: "Dessert" },
  { key: "drinks", emoji: "🥤", label: "Drinks" },
];

const CATEGORY_SUBTITLES = {
  tacos: "Birria Tacos Dorados / Birria Tacos",
  plates: "Birria / Birria Plates",
  burritos: "Burritos",
  quesadillas: "Quesadillas",
  tostadas: "Tostadas",
  nachos: "Nachos",
  mariscos: "Mariscos / Seafood",
  breakfast: "Desayunos / Breakfast — weekends + Monday",
  menudo: "Weekends only",
  especiales: "Especiales / Specials",
  sides: "Acompañantes / Sides",
  kids: "Principales Para Niños / Kids",
  dessert: "Postre / Dessert",
  drinks: "Bebidas / Drinks",
};

/* ===================== MENU ITEMS ===================== */
const MENU_ITEMS = [
  // TACOS
  {
    id: "taco-dorado-revolcada-combo",
    name: "Birria Taco Dorado Combo Revolcada (3)",
    desc: "3 grilled birria tacos with charred onions, cheese, cilantro, salsa. Includes 8oz consomé.",
    price: 17.99,
    category: "tacos",
    popular: true,
    image: "brand_assets/images/valentines-tacos.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "taco-dorado-normal-combo",
    name: "Birria Tacos Dorados Combo Normal (3)",
    desc: "3 classic birria tacos with cheese, onion, cilantro, salsa. Includes 8oz consomé.",
    price: 17.99,
    category: "tacos",
    popular: true,
    image: "brand_assets/images/valentines-tacos.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "taco-dorado-asada",
    name: "Tacos Dorados Carne Asada (3)",
    desc: "3 crispy carne asada tacos with cheese, onion, cilantro, salsa. Includes 8oz consomé. Tortillas dipped in lamb lard.",
    price: 18.99,
    category: "tacos",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "taco-suave",
    name: "Taco Suave / Soft Taco",
    desc: "Choice of meat, onions, cilantro, salsa.",
    price: 4.49,
    category: "tacos",
    options: { meat: MEAT_CHOICES, tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "taco-crispy",
    name: "Taco Crispy / Crispy Taco",
    desc: "Choice of meat, onions, cilantro, salsa, in a crispy shell.",
    price: 4.49,
    category: "tacos",
    options: { meat: MEAT_CHOICES, tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },

  // BIRRIA PLATES
  {
    id: "plato-normal",
    name: "Plato Birria Normal / Normal Birria Plate",
    desc: "Steamed birria plate. Includes 12oz consomé, 5 tortillas, onions, cilantro.",
    price: 17.99,
    category: "plates",
    popular: true,
    image: "brand_assets/images/birria-plate-closeup.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "plato-revolcada",
    name: "Plato Birria Revolcada / Grilled Lamb Plate",
    desc: "Grilled birria plate with charred onions. Includes 12oz consomé, 5 tortillas, onions, cilantro.",
    price: 17.99,
    category: "plates",
    popular: true,
    image: "brand_assets/images/hero-birria-revolcada.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "libra-normal",
    name: "Libra Normal (1lb) / Normal Pound",
    desc: "1 lb steamed birria. Includes 32oz consomé, 10 tortillas, onions, cilantro on the side.",
    price: 31.99,
    category: "plates",
    image: "brand_assets/images/birria-plate-closeup.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "libra-revolcada",
    name: "Libra Revolcada / Grilled Lamb Per Pound",
    desc: "1 lb grilled birria with charred onions. Includes 32oz broth, 10 tortillas.",
    price: 34.49,
    category: "plates",
    image: "brand_assets/images/hero-birria-revolcada.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "consome-small",
    name: "Consomé (Small)",
    desc: "Rich birria broth, served hot.",
    price: 6.49,
    category: "plates",
    options: {},
  },
  {
    id: "consome-large",
    name: "Consomé (Large, 32oz)",
    desc: "More broth than meat, plus rice and 4 tortillas.",
    price: 17.99,
    category: "plates",
    image: "brand_assets/images/birria-plate-closeup.jpg",
    options: {},
  },

  // BURRITOS
  {
    id: "super-burrito",
    name: "Super Burrito / Super Burrito",
    desc: "Choice of meat, rice, whole beans, guacamole, cheese, sour cream, pico de gallo.",
    price: 14.49,
    category: "burritos",
    options: { meat: MEAT_CHOICES, tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "burrito-regular",
    name: "Burrito Regular / Regular Burrito",
    desc: "Choice of meat, rice, whole beans, onions, cilantro, salsa.",
    price: 12.99,
    category: "burritos",
    options: { meat: MEAT_CHOICES, tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "burrito-vegetariano",
    name: "Burrito Vegetariano / Vegetarian Burrito",
    desc: "Rice, whole beans, sour cream, cheese, guacamole, lettuce, pico de gallo.",
    price: 11.99,
    category: "burritos",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },

  // QUESADILLAS
  {
    id: "quesabirria",
    name: "Quesabirria (3)",
    desc: "3 birria quesadillas, melted cheese, served with consomé for dipping.",
    price: 14.99,
    category: "quesadillas",
    popular: true,
    image: "brand_assets/images/quesabirria-tray.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },
  {
    id: "quesadilla-regular",
    name: "Quesadilla Regular",
    desc: "Choice of meat, cheese, onions, cilantro, salsa.",
    price: 10.99,
    category: "quesadillas",
    options: { meat: MEAT_CHOICES, tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },

  // TOSTADAS
  {
    id: "tostada",
    name: "Tostada",
    desc: "Choice of meat, beans, cheese, crema, lettuce, pico de gallo, avocado.",
    price: 6.49,
    category: "tostadas",
    options: { meat: MEAT_CHOICES, addons: ADDONS },
  },

  // NACHOS
  {
    id: "nachos",
    name: "Nachos",
    desc: "Crispy tortilla chips loaded with cheese, choice of meat, and all the fixings.",
    price: 13.99,
    category: "nachos",
    options: { meat: MEAT_CHOICES, addons: ADDONS },
  },
  {
    id: "nachos-fries",
    name: "Nachos Fries / Fries Nachos",
    desc: "Crispy fries loaded with cheese, choice of meat, and all the fixings.",
    price: 14.99,
    category: "nachos",
    options: { meat: MEAT_CHOICES, addons: ADDONS },
  },

  // MARISCOS
  {
    id: "ceviche-camaron",
    name: "Ceviche de Camarón / Shrimp Ceviche",
    desc: "Fresh shrimp ceviche, citrus-cured with pico de gallo.",
    price: 6.49,
    category: "mariscos",
    image: "brand_assets/images/drinks-bucket.jpg",
    options: { addons: ADDONS },
  },
  {
    id: "shrimp-burrito",
    name: "Shrimp Burrito",
    desc: "Flour coated deep fried shrimp, red cabbage, pico de gallo, cucumber, house dressing, whole beans, rice, cheese, avocado.",
    price: 14.99,
    category: "mariscos",
    image: "brand_assets/images/shrimp-fajita-plate.jpg",
    options: { tortilla: TORTILLA_CHOICES, addons: ADDONS },
  },

  // BREAKFAST
  {
    id: "huevos-chorizo",
    name: "Huevos con Chorizo / Eggs & Chorizo",
    desc: "Served with rice, beans, chorizo, tortillas, and eggs.",
    price: 10.99,
    category: "breakfast",
    options: { addons: ADDONS },
  },
  {
    id: "desayuno-huevos",
    name: "Desayuno con Huevos / Breakfast with Eggs",
    desc: "Served with 2 eggs, rice, and beans.",
    price: 9.99,
    category: "breakfast",
    options: { addons: ADDONS },
  },

  // MENUDO
  {
    id: "menudo",
    name: "Menudo",
    desc: "Traditional Mexican soup made with cow's stomach in broth with red chili pepper base. Weekends only.",
    price: 17.99,
    category: "menudo",
    options: {},
  },

  // ESPECIALES
  {
    id: "party-pack",
    name: "The Full Patro Experience (Party Pack)",
    desc: "4 handmade tortillas, birria normal, birria revolcada, flour quesadilla, 3 quesabirrias with cheese, 2 medium consomés, salsa, diced onion, cilantro, fresh limes.",
    price: null,
    category: "especiales",
    image: "brand_assets/images/plate-carne-avocado.jpg",
    options: {},
  },
  {
    id: "birria-pizza",
    name: "Birria Pizza",
    desc: "6 generous slices, perfect for two. Comes with 2 small consomés for dipping, onion, cilantro, fresh limes.",
    price: null,
    category: "especiales",
    image: "brand_assets/images/quesabirria-tray.jpg",
    options: {},
  },

  // SIDES
  { id: "arroz", name: "Arroz / Rice", desc: "Mexican-style rice.", price: 3.49, category: "sides", options: {} },
  { id: "frijoles", name: "Frijoles / Beans", desc: "Whole or refried beans.", price: 3.49, category: "sides", options: {} },
  { id: "guacamole", name: "Guacamole", desc: "Fresh house-made guacamole.", price: 3.49, category: "sides", options: {} },
  { id: "chips-salsa", name: "Chips y Salsa", desc: "Crispy tortilla chips with fresh salsa.", price: null, category: "sides", options: {} },
  { id: "extra-consome", name: "Extra Consomé 8oz", desc: "Extra cup of rich birria broth.", price: 1.5, category: "sides", options: {} },
  { id: "extra-tortillas", name: "Extra Tortillas (5)", desc: "5 additional tortillas.", price: 2.0, category: "sides", options: {} },
  { id: "avocado-side", name: "Avocado", desc: "Fresh sliced avocado.", price: 1.0, category: "sides", options: {} },

  // KIDS
  {
    id: "kids-burrito",
    name: "Kids Bean and Cheese Burrito",
    desc: "Bean and cheese burrito, comes with fries.",
    price: 7.99,
    category: "kids",
    options: {},
  },
  { id: "kids-taco", name: "Kids Taco", desc: "Choice of meat, simple and mild.", price: 4.49, category: "kids", options: { meat: MEAT_CHOICES } },
  { id: "kids-quesadilla", name: "Kids Quesadilla", desc: "Melted cheese quesadilla.", price: 5.99, category: "kids", options: {} },

  // DESSERT
  {
    id: "flan",
    name: "Flan",
    desc: 'Rich, creamy flan — customers say it tastes "almost like crème brûlée."',
    price: 4.99,
    category: "dessert",
    options: {},
  },

  // DRINKS
  { id: "horchata-grande", name: "Horchata Grande / Large Horchata", desc: "House-made horchata, large size.", price: 5.99, category: "drinks", options: {} },
  { id: "horchata-regular", name: "Horchata Regular", desc: "House-made horchata, regular size.", price: 3.99, category: "drinks", options: {} },
  { id: "agua-fresca", name: "Agua Fresca", desc: "Refreshing fruit water, ask for today's flavor.", price: 3.99, category: "drinks", options: {} },
  { id: "jarritos", name: "Jarritos", desc: "Assorted flavors, Mexican bottled soda.", price: 2.99, category: "drinks", options: {} },
  { id: "bottled-water", name: "Bottled Water", desc: "", price: 1.5, category: "drinks", options: {} },
];
