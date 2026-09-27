const params = new URLSearchParams(window.location.search);
const lotId = params.get('lotId');
const guestId = params.get('guestId');

document.getElementById('bid-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = Number(document.getElementById('bid-amount').value);
  const res = await fetch(`/api/lots/${lotId}/bid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId, amount }),
  });
  const errorEl = document.getElementById('bid-error');
  if (!res.ok) {
    const body = await res.json();
    errorEl.textContent = body.error;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  window.location.href = `/donor/bid-confirmation.html?lotId=${lotId}&amount=${amount}`;
});
