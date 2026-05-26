export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { carid, action, brand, model, year, minprice, maxprice, page = 1 } = req.query;

  try {
    let url;
    let headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Referer': 'https://www.encar.com/',
      'Origin': 'https://www.encar.com',
    };

    if (action === 'detail' && carid) {
      // Single car detail
      url = `https://api.encar.com/search/car/list/premium?count=1&q=(And.Hidden.N._.CarNo.${carid}.)&sr=%7CModifiedDate%7C0%7C1`;
    } else if (action === 'search') {
      // Search cars
      let query = '(And.Hidden.N.';
      if (brand) query += `_.Manufacturer.${encodeURIComponent(brand)}.`;
      if (model) query += `_.ModelGroup.${encodeURIComponent(model)}.`;
      if (year) query += `_.Year.${year}.`;
      if (minprice) query += `_.Price.${minprice}..`;
      if (maxprice) query += `..Price.${maxprice}.`;
      query += ')';

      url = `https://api.encar.com/search/car/list/premium?count=20&page=${page}&q=${query}&sr=%7CModifiedDate%7C0%7C20`;
    } else if (action === 'list') {
      // Latest luxury cars
      url = `https://api.encar.com/search/car/list/premium?count=20&page=${page}&q=(And.Hidden.N._.PriceCar.3000.)&sr=%7CModifiedDate%7C0%7C20`;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Encar API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Encar proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
