const url = 'https://ip-ranges.amazonaws.com/ip-ranges.json';

document.getElementById('filterBtn').addEventListener('click', async () => {
  const service = document.getElementById('serviceInput').value.toUpperCase();
  const region = document.getElementById('regionInput').value;

  const showService = document.getElementById('showService').checked;
  const showRegion = document.getElementById('showRegion').checked;
  const showPrefix = document.getElementById('showPrefix').checked;

  const res = await fetch(url);
  const data = await res.json();
  const ranges = data.prefixes;

  const filtered = ranges.filter(item => {
    return (!service || item.service === service) &&
           (!region || item.region === region);
  });

  const tableBody = document.getElementById('ipTableBody');
  tableBody.innerHTML = '';

  filtered.forEach(item => {
    const row = document.createElement('tr');

    if (showService) {
      const tdService = document.createElement('td');
      tdService.textContent = item.service;
      tdService.classList.add('col-service');
      row.appendChild(tdService);
    }

    if (showRegion) {
      const tdRegion = document.createElement('td');
      tdRegion.textContent = item.region;
      tdRegion.classList.add('col-region');
      row.appendChild(tdRegion);
    }

    if (showPrefix) {
      const tdPrefix = document.createElement('td');
      tdPrefix.textContent = item.ip_prefix;
      tdPrefix.classList.add('col-prefix');
      row.appendChild(tdPrefix);
    }

    tableBody.appendChild(row);
  });
});
