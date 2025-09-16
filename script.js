const url = 'https://ip-ranges.amazonaws.com/ip-ranges.json';

document.getElementById('filterBtn').addEventListener('click', async () => {
  const service = document.getElementById('serviceInput').value;
  const region = document.getElementById('regionInput').value;

  const showIPv4 = document.getElementById('showIPv4').checked;
  const showIPv6 = document.getElementById('showIPv6').checked;

  const res = await fetch(url);
  const data = await res.json();
  let filtered = [];

  if (showIPv4) {
    const ipv4 = data.prefixes.filter(item => {
      return (!service || item.service === service) &&
             (!region || item.region === region || region === '');
    }).map(item => ({
      service: item.service,
      region: item.region,
      prefix: item.ip_prefix,
      version: 'IPv4'
    }));
    filtered = filtered.concat(ipv4);
  }

  if (showIPv6 && Array.isArray(data.ipv6_prefixes)) {
    const ipv6 = data.ipv6_prefixes.filter(item => {
      return (!service || item.service === service) &&
             (!region || item.region === region || region === '');
    }).map(item => ({
      service: item.service,
      region: item.region,
      prefix: item.ipv6_prefix,
      version: 'IPv6'
    }));
    filtered = filtered.concat(ipv6);
  }

  const tableBody = document.getElementById('ipTableBody');
  tableBody.innerHTML = '';


  filtered.forEach(item => {
    const row = document.createElement('tr');
    const tdService = document.createElement('td');
    tdService.textContent = item.service;
    tdService.classList.add('col-service');
    row.appendChild(tdService);
    const tdRegion = document.createElement('td');
    tdRegion.textContent = item.region;
    tdRegion.classList.add('col-region');
    row.appendChild(tdRegion);
    const tdPrefix = document.createElement('td');
    tdPrefix.textContent = item.prefix;
    tdPrefix.classList.add('col-prefix');
    row.appendChild(tdPrefix);
    row.setAttribute('data-version', item.version);
    tableBody.appendChild(row);
  });
});


// Populate dropdowns for services and regions and show last change date
async function populateDropdownsAndLastChange() {
  const res = await fetch(url);
  const data = await res.json();
  // Show last change date
  if (data.createDate) {
    const lastChangeDiv = document.getElementById('lastChange');
    lastChangeDiv.textContent = `Last change: ${data.createDate}`;
  }
  const servicesSet = new Set();
  const regionsSet = new Set();
  if (Array.isArray(data.prefixes)) {
    data.prefixes.forEach(item => {
      if (item.service) servicesSet.add(item.service);
      if (item.region) regionsSet.add(item.region);
    });
  }
  if (Array.isArray(data.ipv6_prefixes)) {
    data.ipv6_prefixes.forEach(item => {
      if (item.service) servicesSet.add(item.service);
      if (item.region) regionsSet.add(item.region);
    });
  }
  const serviceInput = document.getElementById('serviceInput');
  const regionInput = document.getElementById('regionInput');
  // Remove all except first option
  serviceInput.length = 1;
  regionInput.length = 1;
  Array.from(servicesSet).sort().forEach(service => {
    const opt = document.createElement('option');
    opt.value = service;
    opt.textContent = service;
    serviceInput.appendChild(opt);
  });
  Array.from(regionsSet).sort().forEach(region => {
    const opt = document.createElement('option');
    opt.value = region;
    opt.textContent = region;
    regionInput.appendChild(opt);
  });
}

populateDropdownsAndLastChange();
