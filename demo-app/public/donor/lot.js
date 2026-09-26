const params = new URLSearchParams(window.location.search);
const lotId = params.get('lotId');
const guestId = params.get('guestId');

async function loadLot() {
  const res = await fetch(`/api/lots/${lotId}`);
  const lot = await res.json();
  document.getElementById('lot-summary').textContent = `${lot.name} — Buy now: $${lot.buyNowPrice}`;
}
loadLot();

document.getElementById('buy-now-button').addEventListener('click', async () => {
  const res = await fetch(`/api/lots/${lotId}/buy-now`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId }),
  });
  const errorEl = document.getElementById('buy-now-error');
  if (!res.ok) {
    const body = await res.json();
    errorEl.textContent = body.error;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  window.location.href = `/donor/lot-confirmation.html?lotId=${lotId}`;
});
