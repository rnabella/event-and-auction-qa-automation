document.getElementById('raffle-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('raffle-name').value;
  const entryPrice = Number(document.getElementById('raffle-entry-price').value);
  const res = await fetch('/api/admin/raffles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, entryPrice }),
  });
  const errorEl = document.getElementById('raffle-error');
  if (!res.ok) {
    const body = await res.json();
    errorEl.textContent = body.error;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  window.location.href = '/admin/checklist.html';
});
