document.getElementById('ticket-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('ticket-name').value;
  const price = Number(document.getElementById('ticket-price').value);
  const res = await fetch('/api/admin/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price }),
  });
  const errorEl = document.getElementById('ticket-error');
  if (!res.ok) {
    const body = await res.json();
    errorEl.textContent = body.error;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  window.location.href = '/admin/checklist.html';
});
