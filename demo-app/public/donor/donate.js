const params = new URLSearchParams(window.location.search);
const guestId = params.get('guestId');

document.getElementById('donate-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = Number(document.getElementById('amount').value);
  const res = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId, amount }),
  });
  const donation = await res.json();
  window.location.href = `/donor/checkout.html?donationId=${donation.id}`;
});
