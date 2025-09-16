
const awsUrl = 'https://ip-ranges.amazonaws.com/ip-ranges.json';
const cfV4Url = 'https://www.cloudflare.com/ips-v4';
const cfV6Url = 'https://www.cloudflare.com/ips-v6';


document.getElementById('filterBtn').addEventListener('click', async () => {
  const provider = document.getElementById('providerInput').value;
  const tableBody = document.getElementById('ipTableBody');
  tableBody.innerHTML = '';

  // Hide/show AWS-specific filters
  document.getElementById('serviceInput').parentElement.style.display = provider === 'aws' ? '' : 'none';
  document.getElementById('regionInput').parentElement.style.display = provider === 'aws' ? '' : 'none';

  if (provider === 'aws') {
    const service = document.getElementById('serviceInput').value;
    const region = document.getElementById('regionInput').value;
    const showIPv4 = document.getElementById('showIPv4').checked;
    const showIPv6 = document.getElementById('showIPv6').checked;
    const res = await fetch(awsUrl);
    const data = await res.json();
    let filtered = [];
    if (showIPv4) {
      const ipv4 = data.prefixes.filter(item => {
        return (!service || item.service === service) &&
               (!region || item.region === region);
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
               (!region || item.region === region);
      }).map(item => ({
        service: item.service,
        region: item.region,
        prefix: item.ipv6_prefix,
        version: 'IPv6'
      }));
      filtered = filtered.concat(ipv6);
    }
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
  } else if (provider === 'cloudflare') {
    // Hide AWS-specific filters
    // Only show IP Prefix column
    // Fetch both v4 and v6 if checked
    const showIPv4 = document.getElementById('showIPv4').checked;
    const showIPv6 = document.getElementById('showIPv6').checked;
    let cfIps = [];
    if (showIPv4) {
      const res4 = await fetch(cfV4Url);
      const text4 = await res4.text();
      cfIps = cfIps.concat(text4.split('\n').filter(line => line.match(/\d+\.\d+\.\d+\.\d+/)));
    }
    if (showIPv6) {
      const res6 = await fetch(cfV6Url);
      const text6 = await res6.text();
      cfIps = cfIps.concat(text6.split('\n').filter(line => line.match(/:/)));
    }
    cfIps.forEach(prefix => {
      const row = document.createElement('tr');
      // Empty cells for Service and Region
      const tdService = document.createElement('td');
      tdService.textContent = 'Cloudflare';
      tdService.classList.add('col-service');
      row.appendChild(tdService);
      const tdRegion = document.createElement('td');
      tdRegion.textContent = '';
      tdRegion.classList.add('col-region');
      row.appendChild(tdRegion);
      const tdPrefix = document.createElement('td');
      tdPrefix.textContent = prefix;
      tdPrefix.classList.add('col-prefix');
      row.appendChild(tdPrefix);
      tableBody.appendChild(row);
    });
  }
});


// Populate dropdowns for services and regions and show last change date
async function populateDropdownsAndLastChange() {
  const res = await fetch(awsUrl);
  const data = await res.json();
    // Show last change date in UTC and relative format
    if (data.createDate) {
      const lastChangeDiv = document.getElementById('lastChange');
      // Parse AWS createDate: 'YYYY-MM-DD-HH-MM-SS'
      const parts = data.createDate.split('-');
      const date = new Date(Date.UTC(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2]),
        parseInt(parts[3]),
        parseInt(parts[4]),
        parseInt(parts[5])
      ));
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      let rel = '';
      if (diffSec < 60) rel = `${diffSec} seconds ago`;
      else if (diffSec < 3600) rel = `${Math.floor(diffSec/60)} minutes ago`;
      else if (diffSec < 86400) rel = `${Math.floor(diffSec/3600)} hours ago`;
      else rel = `${Math.floor(diffSec/86400)} days ago`;
      lastChangeDiv.innerHTML = `<b>Last Change</b><br>${data.createDate} UTC (${rel})`;
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


// Populate dropdowns and last change, then trigger initial table update
async function init() {
  await populateDropdownsAndLastChange();
  document.getElementById('filterBtn').click();
}
init();
