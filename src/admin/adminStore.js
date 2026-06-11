// ─── Admin Store — all localStorage I/O in one place ─────────────────────────

export const KEYS = {
  AUTH:                  'pa_admin_auth',
  ORDERS:                'pa_orders',
  MENU_OVERRIDES:        'pa_menu_overrides',
  HIDDEN_ITEMS_MAAMOURA: 'pa_hidden_items_maamoura',
  HIDDEN_ITEMS_SHERATON: 'pa_hidden_items_sheraton',
  HIDDEN_CATS:           'pa_hidden_cats',
  CUSTOM_CATS:           'pa_custom_cats',
  CUSTOM_ITEMS:          'pa_custom_items',
  ADMIN_USERS:           'pa_admin_users',
  EXTRAS_OVERRIDES:      'pa_extras_overrides',
  CUSTOM_EXTRAS:         'pa_custom_extras',
  ITEM_ADDON_OVERRIDES:  'pa_item_addon_overrides',
};

// ── Default users ─────────────────────────────────────────────────────────────
const DEFAULT_USERS = {
  kitchen:  { username: 'kitchen',  password: 'Kitchen2017',  role: 'kitchen',  displayName: 'Kitchen',  branch: 'maamoura' },
  sheraton: { username: 'sheraton', password: 'Sheraton2017', role: 'sheraton', displayName: 'Sheraton', branch: 'sheraton' },
  manager:  { username: 'manager',  password: 'Pasta2017',    role: 'manager',  displayName: 'Manager',  branch: null },
};

export function getUsers() {
  const saved = JSON.parse(localStorage.getItem(KEYS.ADMIN_USERS) || '{}');
  const merged = { ...DEFAULT_USERS };
  Object.entries(saved).forEach(([k, v]) => { merged[k] = { ...merged[k], ...v }; });
  return merged;
}

export function saveUserField(username, fields) {
  const saved = JSON.parse(localStorage.getItem(KEYS.ADMIN_USERS) || '{}');
  saved[username] = { ...(saved[username] || {}), ...fields };
  localStorage.setItem(KEYS.ADMIN_USERS, JSON.stringify(saved));
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export function getAuth() {
  return JSON.parse(localStorage.getItem(KEYS.AUTH) || 'null');
}

export function setAuth(session) {
  localStorage.setItem(KEYS.AUTH, JSON.stringify(session));
}

export function clearAuth() {
  localStorage.removeItem(KEYS.AUTH);
}

export function login(username, password) {
  const users = getUsers();
  const user = users[username.toLowerCase()];
  if (!user || user.password !== password) return null;
  const session = {
    username:    user.username,
    role:        user.role,
    displayName: user.displayName,
    branch:      user.branch,
  };
  setAuth(session);
  return session;
}

// ── Orders — backed by MySQL via PHP API ─────────────────────────────────────
const API = '/api/orders.php';

export async function getOrders({ branch, date } = {}) {
  const params = new URLSearchParams();
  if (branch) params.set('branch', branch);
  if (date)   params.set('date', date);
  const url = params.toString() ? `${API}?${params}` : API;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function addOrder(order) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error('Failed to save order');
  window.dispatchEvent(new CustomEvent('pa_new_order', { detail: order }));
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(API, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: orderId, status }),
  });
  if (!res.ok) throw new Error('Failed to update order');
}

// ── Menu overrides ────────────────────────────────────────────────────────────
export function getMenuOverrides() {
  return JSON.parse(localStorage.getItem(KEYS.MENU_OVERRIDES) || '{}');
}

export function setItemOverride(itemId, fields) {
  const overrides = getMenuOverrides();
  overrides[itemId] = { ...(overrides[itemId] || {}), ...fields };
  localStorage.setItem(KEYS.MENU_OVERRIDES, JSON.stringify(overrides));
  window.dispatchEvent(new Event('pa_menu_update'));
}

export function removeItemOverride(itemId) {
  const overrides = getMenuOverrides();
  delete overrides[itemId];
  localStorage.setItem(KEYS.MENU_OVERRIDES, JSON.stringify(overrides));
  window.dispatchEvent(new Event('pa_menu_update'));
}

// ── Branch-specific hidden items ──────────────────────────────────────────────
function hiddenKey(branch) {
  return branch === 'sheraton' ? KEYS.HIDDEN_ITEMS_SHERATON : KEYS.HIDDEN_ITEMS_MAAMOURA;
}

export function getHiddenItemsForBranch(branch) {
  return JSON.parse(localStorage.getItem(hiddenKey(branch)) || '[]');
}

export function getAllHiddenItems() {
  return {
    maamoura: getHiddenItemsForBranch('maamoura'),
    sheraton:  getHiddenItemsForBranch('sheraton'),
  };
}

// branch = 'maamoura' | 'sheraton' → affects only that branch
// branch = null → affects both branches (manager action)
export function setItemHiddenForBranch(itemId, hidden, branch) {
  const branches = branch ? [branch] : ['maamoura', 'sheraton'];
  branches.forEach(b => {
    const list = getHiddenItemsForBranch(b);
    const next = hidden
      ? [...new Set([...list, itemId])]
      : list.filter(id => id !== itemId);
    localStorage.setItem(hiddenKey(b), JSON.stringify(next));
  });
  window.dispatchEvent(new Event('pa_menu_update'));
}

// Legacy compat — hides on both branches
export function setItemHidden(itemId, hidden) {
  setItemHiddenForBranch(itemId, hidden, null);
}

// ── Hidden categories ─────────────────────────────────────────────────────────
export function getHiddenCats() {
  return JSON.parse(localStorage.getItem(KEYS.HIDDEN_CATS) || '[]');
}

export function setCatHidden(catId, hidden) {
  const list = getHiddenCats();
  const next = hidden
    ? [...new Set([...list, catId])]
    : list.filter(id => id !== catId);
  localStorage.setItem(KEYS.HIDDEN_CATS, JSON.stringify(next));
  window.dispatchEvent(new Event('pa_menu_update'));
}

// ── Custom categories ─────────────────────────────────────────────────────────
export function getCustomCats() {
  return JSON.parse(localStorage.getItem(KEYS.CUSTOM_CATS) || '[]');
}

export function saveCustomCats(cats) {
  localStorage.setItem(KEYS.CUSTOM_CATS, JSON.stringify(cats));
  window.dispatchEvent(new Event('pa_menu_update'));
}

// ── Custom items ──────────────────────────────────────────────────────────────
export function getCustomItems() {
  return JSON.parse(localStorage.getItem(KEYS.CUSTOM_ITEMS) || '[]');
}

export function saveCustomItems(items) {
  localStorage.setItem(KEYS.CUSTOM_ITEMS, JSON.stringify(items));
  window.dispatchEvent(new Event('pa_menu_update'));
}

// ── Extras (addons) management ────────────────────────────────────────────────
// extrasOverrides: { [addonId]: { hidden, price, labelEn, labelAr } }
export function getExtrasOverrides() {
  return JSON.parse(localStorage.getItem(KEYS.EXTRAS_OVERRIDES) || '{}');
}

export function setExtraOverride(addonId, fields) {
  const overrides = getExtrasOverrides();
  overrides[addonId] = { ...(overrides[addonId] || {}), ...fields };
  localStorage.setItem(KEYS.EXTRAS_OVERRIDES, JSON.stringify(overrides));
  window.dispatchEvent(new Event('pa_menu_update'));
}

export function removeExtraOverride(addonId) {
  const overrides = getExtrasOverrides();
  delete overrides[addonId];
  localStorage.setItem(KEYS.EXTRAS_OVERRIDES, JSON.stringify(overrides));
  window.dispatchEvent(new Event('pa_menu_update'));
}

// customExtras: [{ id, pool, labelEn, labelAr, price }]
// pool: 'global' | 'pizza' | 'compose' | 'drink'
export function getCustomExtras() {
  return JSON.parse(localStorage.getItem(KEYS.CUSTOM_EXTRAS) || '[]');
}

export function saveCustomExtras(extras) {
  localStorage.setItem(KEYS.CUSTOM_EXTRAS, JSON.stringify(extras));
  window.dispatchEvent(new Event('pa_menu_update'));
}

// Per-item addon overrides: { [itemId]: { added: [...addonIds], removed: [...addonIds] } }
export function getItemAddonOverrides() {
  return JSON.parse(localStorage.getItem(KEYS.ITEM_ADDON_OVERRIDES) || '{}');
}

export function setItemAddonOverride(itemId, override) {
  const all = getItemAddonOverrides();
  all[itemId] = { added: override.added || [], removed: override.removed || [] };
  localStorage.setItem(KEYS.ITEM_ADDON_OVERRIDES, JSON.stringify(all));
  window.dispatchEvent(new Event('pa_menu_update'));
}

// ── Resolve effective addons for an item ──────────────────────────────────────
// allAddonPools: flat array of all base addons (from menuData)
export function resolveItemAddons(item, allAddonPools) {
  const extrasOverrides    = getExtrasOverrides();
  const customExtras       = getCustomExtras();
  const itemAddonOverrides = getItemAddonOverrides();
  const itemOverride       = itemAddonOverrides[item.id] || { added: [], removed: [] };

  // Build lookup of all available addons by id
  const addonMap = {};
  allAddonPools.forEach(a => { addonMap[a.id] = a; });
  customExtras.forEach(a => { addonMap[a.id] = a; });

  // Start from item's base addons
  let addons = [...(item.addons || [])];

  // Remove explicitly removed ones
  addons = addons.filter(a => !itemOverride.removed.includes(a.id));

  // Add extras
  itemOverride.added.forEach(addonId => {
    const addon = addonMap[addonId];
    if (addon && !addons.find(a => a.id === addonId)) addons.push(addon);
  });

  // Apply global overrides (price/name), filter hidden
  return addons
    .map(a => {
      const ov = extrasOverrides[a.id];
      return ov ? { ...a, ...ov } : a;
    })
    .filter(a => !extrasOverrides[a.id]?.hidden);
}

// ── Build live menu (base + overrides) ───────────────────────────────────────
// admin = true  → include all items with _hiddenMaamoura / _hiddenSheraton flags
// branch = 'maamoura' | 'sheraton' → customer view, filters by branch hidden list
// branch = null → hide only items hidden on BOTH branches
export function getLiveMenu(baseItems, baseCats, admin = false, branch = null) {
  const overrides      = getMenuOverrides();
  const hiddenMaamoura = getHiddenItemsForBranch('maamoura');
  const hiddenSheraton = getHiddenItemsForBranch('sheraton');
  const hiddenCats     = getHiddenCats();
  const customItems    = getCustomItems();
  const customCats     = getCustomCats();

  const allItems = [...baseItems, ...customItems].map(item => {
    const merged = overrides[item.id] ? { ...item, ...overrides[item.id] } : item;
    return {
      ...merged,
      _hiddenMaamoura: hiddenMaamoura.includes(item.id),
      _hiddenSheraton: hiddenSheraton.includes(item.id),
      _hidden: hiddenMaamoura.includes(item.id) && hiddenSheraton.includes(item.id),
    };
  });

  const allCats = [...baseCats, ...customCats].map(cat => ({
    ...cat,
    _hidden: hiddenCats.includes(cat.id),
  }));

  if (admin) return { items: allItems, cats: allCats };

  const items = allItems.filter(i => {
    if (branch === 'maamoura') return !i._hiddenMaamoura;
    if (branch === 'sheraton') return !i._hiddenSheraton;
    return !i._hidden;
  });

  return {
    items,
    cats: allCats.filter(c => !c._hidden),
  };
}
