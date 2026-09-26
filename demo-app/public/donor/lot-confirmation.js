const params = new URLSearchParams(window.location.search);
const lotId = params.get('lotId');

async function loadConfirmation() {
  const res = await fetch(`/api/lots/${lotId}`);
  const lot = await res.json();
  document.getElementById('confirmation-message').textContent =
    `You bought "${lot.name}" for $${lot.buyNowPrice}.`;
}
loadConfirmation();
