const params = new URLSearchParams(window.location.search);
const donationId = params.get('donationId');

async function loadSummary() {
  const res = await fetch(`/api/donations/${donationId}`);
  const donation = await res.json();
  document.getElementById('summary').textContent = `Donation amount: $${donation.amount}`;
}
loadSummary();

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch(`/api/donations/${donationId}/pay`, { method: 'POST' });
  window.location.href = `/donor/confirmation.html?donationId=${donationId}`;
});
