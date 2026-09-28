const params = new URLSearchParams(window.location.search);
const raffleId = params.get('raffleId');
const guestId = params.get('guestId');

async function loadRaffle() {
  const res = await fetch(`/api/raffles/${raffleId}`);
  const raffle = await res.json();
  document.getElementById('raffle-summary').textContent =
    `${raffle.name} — Entry: $${raffle.entryPrice}`;
}
loadRaffle();

document.getElementById('enter-raffle-button').addEventListener('click', async () => {
  const res = await fetch(`/api/raffles/${raffleId}/enter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId }),
  });
  const errorEl = document.getElementById('enter-raffle-error');
  if (!res.ok) {
    const body = await res.json();
    errorEl.textContent = body.error;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  window.location.href = `/donor/raffle-confirmation.html?raffleId=${raffleId}`;
});
