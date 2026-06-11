// ─── 80mm thermal receipt printer (black & white) ────────────────────────────
// Opens a print-optimized window sized for an 80mm thermal printer and triggers
// the browser print dialog. No colors, monospace font, narrow width.

const BRANCH_NAME = {
  sheraton: 'Sheraton Hotel Park',
  maamoura: 'Maamoura Kitchen',
};

const BRANCH_PHONE = {
  sheraton: '+974 5009 0160',
  maamoura: '+974 5009 0960',
};

const MODE_LABEL = {
  delivery: 'DELIVERY',
  takeaway: 'TAKE AWAY',
  dinein:   'DINE IN',
};

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function money(n) {
  return (Number(n) || 0).toFixed(2);
}

function fmtDateTime(iso) {
  const d = iso ? new Date(iso) : new Date();
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

// Line total mirrors the customer cart math: (size + addons + meal) * qty
function lineTotal(item) {
  const size   = item.size?.price ?? 0;
  const addons = (item.addons || []).reduce((s, a) => s + (a.price || 0), 0);
  const meal   = item.mealUpsell ? 18 : 0;
  return (size + addons + meal) * (item.qty ?? 1);
}

export function buildReceiptHtml(order) {
  const branchName  = BRANCH_NAME[order.branch] || (order.branch || '').toUpperCase();
  const branchPhone = BRANCH_PHONE[order.branch] || '';
  const mode        = MODE_LABEL[order.mode] || (order.mode || '').toUpperCase();
  const orderNo     = order.id ? String(order.id).slice(-6) : '------';
  const items       = order.items || [];

  const itemsHtml = items.map(item => {
    const qty   = item.qty ?? 1;
    const name  = esc(item.nameEn || item.nameAr || 'Item');
    const price = money(lineTotal(item));

    let sub = '';
    if (item.size && item.size.labelEn && item.size.labelEn !== 'Regular' && item.size.labelEn !== 'Full Deal') {
      sub += `<div class="sub">- ${esc(item.size.labelEn)}</div>`;
    }
    if (item.addons && item.addons.length) {
      sub += `<div class="sub">+ ${esc(item.addons.map(a => a.labelEn).join(', '))}</div>`;
    }
    if (item.mealUpsell) {
      sub += `<div class="sub">+ Meal Upgrade</div>`;
    }
    if (item.instructions) {
      sub += `<div class="sub note">* ${esc(item.instructions)}</div>`;
    }

    return `
      <div class="row item">
        <span class="qty">${qty}x</span>
        <span class="name">${name}</span>
        <span class="price">${price}</span>
      </div>
      ${sub}`;
  }).join('');

  // Address block for delivery
  let addr = '';
  if (order.mode === 'delivery') {
    if (order.manualAddr) addr += `<div class="line">Addr: ${esc(order.manualAddr)}</div>`;
    if (order.gpsCoords && order.gpsCoords.lat) {
      addr += `<div class="line">GPS: ${esc(order.gpsCoords.lat)}, ${esc(order.gpsCoords.lng)}</div>`;
    }
  }

  const payLabel = order.payMethod === 'card' ? 'CARD (link)'
                 : order.payMethod === 'cash' ? 'CASH'
                 : 'PAY AT COUNTER';

  const deliveryFee = order.deliveryFee || 0;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt ${esc(orderNo)}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: #fff; color: #000;
  }
  body {
    width: 80mm;
    padding: 3mm 4mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .big { font-size: 17px; font-weight: bold; letter-spacing: 1px; }
  .branch { font-size: 13px; font-weight: bold; margin-top: 1mm; }
  .muted { font-size: 11px; }
  .hr { border-top: 1px dashed #000; margin: 2mm 0; }
  .line { font-size: 11px; }
  .row { display: flex; width: 100%; }
  .between { justify-content: space-between; }
  .item { font-weight: bold; margin-top: 1mm; }
  .item .qty { width: 8mm; flex: 0 0 8mm; }
  .item .name { flex: 1 1 auto; padding-right: 2mm; }
  .item .price { flex: 0 0 auto; text-align: right; }
  .sub { font-size: 11px; padding-left: 8mm; }
  .note { font-style: italic; }
  .totals { margin-top: 1mm; }
  .totals .row { font-size: 12px; }
  .grand { font-size: 15px; font-weight: bold; }
  .pay { margin-top: 2mm; font-weight: bold; text-align: center; }
  .foot { margin-top: 3mm; text-align: center; font-size: 11px; }
</style>
</head>
<body>
  <div class="center big">PASTA ALFREEJ</div>
  <div class="center branch">${esc(branchName)}</div>
  ${branchPhone ? `<div class="center muted">${esc(branchPhone)}</div>` : ''}

  <div class="hr"></div>

  <div class="row between"><span>Order #</span><span><b>${esc(orderNo)}</b></span></div>
  <div class="row between"><span>Date</span><span>${esc(fmtDateTime(order.timestamp))}</span></div>
  <div class="row between"><span>Type</span><span><b>${esc(mode)}</b></span></div>

  <div class="hr"></div>

  <div class="line"><b>Customer:</b> ${esc(order.contact?.name || '-')}</div>
  <div class="line"><b>Phone:</b> ${esc(order.contact?.phone || '-')}</div>
  ${addr}

  <div class="hr"></div>

  ${itemsHtml || '<div class="line">No items</div>'}

  <div class="hr"></div>

  <div class="totals">
    <div class="row between"><span>Subtotal</span><span>${money(order.subtotal)} QAR</span></div>
    ${deliveryFee > 0 ? `<div class="row between"><span>Delivery</span><span>${money(deliveryFee)} QAR</span></div>` : ''}
    <div class="row between grand"><span>TOTAL</span><span>${money(order.total)} QAR</span></div>
  </div>

  <div class="pay">${esc(payLabel)}</div>

  <div class="hr"></div>

  <div class="foot">Thank you for your order!<br/>Pasta Alfreej Qatar</div>
</body>
</html>`;
}

export function printReceipt(order) {
  if (!order || !order.id) return;
  const html = buildReceiptHtml(order);

  // Use a hidden iframe so we don't depend on popup permissions.
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  const win = iframe.contentWindow;
  // Wait a tick so layout/styles apply before printing.
  const doPrint = () => {
    win.focus();
    win.print();
    // Remove the iframe after the print dialog is handled.
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  };

  if (doc.readyState === 'complete') {
    setTimeout(doPrint, 150);
  } else {
    win.onload = () => setTimeout(doPrint, 150);
    // Fallback in case onload doesn't fire.
    setTimeout(doPrint, 400);
  }
}
