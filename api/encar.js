export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { carid, action, brand, model, year, minprice, maxprice, page = 0 } = req.query;

  try {
    let url;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Referer': 'https://www.encar.com/',
    };

    if (action === 'search' || action === 'list') {
      let query = '(And.Hidden.N.';
      if (brand) query += `_.Manufacturer.${encodeURIComponent(brand)}.`;
      if (model) query += `_.ModelGroup.${encodeURIComponent(model)}.`;
      if (year) query += `_.Year.${year}.`;
      if (minprice) query += `_.Price.${minprice}..`;
      if (maxprice) query += `..Price.${maxprice}.`;
      if (!brand && !model) query += '_.PriceCar.3000..'; // min 3000만원 = luxury
      query += ')';

      const offset = parseInt(page) * 20;
      url = `https://api.encar.com/search/car/list/general?count=20&q=${query}&sr=%7CModifiedDate%7C${offset}%7C20`;

    } else if (action === 'detail' && carid) {
      url = `https://api.encar.com/search/car/list/general?count=1&q=(And.Hidden.N._.CarNo.${carid}.)&sr=%7CModifiedDate%7C0%7C1`;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ 
        error: `Encar API error: ${response.status}`,
        url,
        detail: text.substring(0, 200)
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
