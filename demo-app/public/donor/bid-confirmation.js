const params = new URLSearchParams(window.location.search);
const amount = params.get('amount');

document.getElementById('confirmation-message').textContent =
  `Your sealed bid of $${amount} has been submitted.`;
