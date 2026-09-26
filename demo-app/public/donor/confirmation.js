const params = new URLSearchParams(window.location.search);
const donationId = params.get('donationId');

async function loadConfirmation() {
  const res = await fetch(`/api/donations/${donationId}`);
  const donation = await res.json();
  document.getElementById('confirmation-message').textContent =
    `Donation ${donation.id} for $${donation.amount} is ${donation.status}.`;
}

async function loadTotal() {
  const res = await fetch('/api/totals');
  const { totalRaised } = await res.json();
  document.getElementById('total-raised').textContent = `Total raised so far: $${totalRaised}`;
}

document.getElementById('refresh-total').addEventListener('click', loadTotal);

loadConfirmation();
loadTotal();
