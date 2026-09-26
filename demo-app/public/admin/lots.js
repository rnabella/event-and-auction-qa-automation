document.getElementById('lot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('lot-name').value;
  const startPrice = Number(document.getElementById('lot-start-price').value);
  const res = await fetch('/api/admin/lots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, startPrice }),
  });
  const errorEl = document.getElementById('lot-error');
  if (!res.ok) {
    const body = await res.json();
    errorEl.textContent = body.error;
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  window.location.href = '/admin/checklist.html';
});
