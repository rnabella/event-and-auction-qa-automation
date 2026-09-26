async function loadChecklist() {
  const res = await fetch('/api/admin/checklist');
  const items = await res.json();
  const list = document.getElementById('checklist-items');
  list.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.id = `checklist-item-${item.id}`;
    li.textContent = `${item.label}: ${item.complete ? 'Complete' : 'Incomplete'}`;
    list.appendChild(li);
  }
}

loadChecklist();
