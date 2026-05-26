const CARAPIS_KEY = 'car_qX5K5CpFEeQteqFWhudgftmtexQndmvB3xbiM_nqc2E';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, brand, model, year_from, year_to, page = 1 } = req.query;

  try {
    let url;
    const headers = {
      'Authorization': `Api-Key ${CARAPIS_KEY}`,
      'Accept': 'application/json',
    };

    if (action === 'search' || action === 'list') {
      const params = new URLSearchParams({
        page,
        page_size: 20,
        available_only: 'false',
      });

      if (brand) params.append('brand_slug', brand.toLowerCase());
      if (model) params.append('model_slug', model.toLowerCase());
      if (year_from) params.append('year_from', year_from);
      if (year_to) params.append('year_to', year_to);
      if (!brand && !model) params.append('price_from', '30000'); // luxury only $30k+

      url = `https://api.carapis.com/apix/catalog_api/vehicles/?${params.toString()}`;

    } else if (action === 'brands') {
      url = `https://api.carapis.com/apix/catalog_api/brands/?page_size=100`;

    } else if (action === 'models' && brand) {
      url = `https://api.carapis.com/apix/catalog_api/models/?brand_slug=${brand.toLowerCase()}&page_size=100`;

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Carapis API error: ${response.status}`,
        detail: text.substring(0, 300)
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
