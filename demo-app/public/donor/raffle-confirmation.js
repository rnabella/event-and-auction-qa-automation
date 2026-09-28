const params = new URLSearchParams(window.location.search);
const raffleId = params.get('raffleId');

async function loadConfirmation() {
  const res = await fetch(`/api/raffles/${raffleId}`);
  const raffle = await res.json();
  document.getElementById('confirmation-message').textContent =
    `You've entered "${raffle.name}". Good luck!`;
}
loadConfirmation();
