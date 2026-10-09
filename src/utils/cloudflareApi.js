const CLOUDFLARE_API_URL = 'https://mainon-qr-api.warehouse-24charge.workers.dev';

/**
 * Check connection to Cloudflare D1 via Worker API
 */
export async function checkCloudHealth() {
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === 'healthy';
  } catch (err) {
    console.warn('Cloudflare D1 is currently unreachable, using Local fallback:', err.message);
    return false;
  }
}

/**
 * Fetch all templates and bundled print data from Cloudflare D1
 */
export async function fetchCloudTemplates() {
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/templates`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.templates || [];
  } catch (err) {
    console.error('Failed to fetch templates from Cloudflare D1:', err);
    throw err;
  }
}

/**
 * Save or update a template with bundled print data in Cloudflare D1
 */
export async function saveCloudTemplate({
  id,
  name,
  description,
  layout,
  dataConfig,
  items,
}) {
  try {
    const payload = {
      id: id || `tpl-${Date.now()}`,
      name: name || 'แม่แบบสินค้า',
      description: description || '',
      layout,
      dataConfig,
      items: items || [],
      itemCount: items?.length || 0,
      startSerial: items?.[0]?.serial || dataConfig?.startNumber || '',
      endSerial: items?.[items.length - 1]?.serial || '',
    };

    const res = await fetch(`${CLOUDFLARE_API_URL}/api/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, id: payload.id, template: { ...payload, isCloud: true } };
  } catch (err) {
    console.error('Failed to save template to Cloudflare D1:', err);
    throw err;
  }
}

/**
 * Delete a template from Cloudflare D1
 */
export async function deleteCloudTemplate(templateId) {
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/templates/${encodeURIComponent(templateId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error('Failed to delete template from Cloudflare D1:', err);
    throw err;
  }
}

/**
 * Fetch saved active app settings from Cloudflare D1
 */
export async function fetchCloudSettings() {
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/settings`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.settings || null;
  } catch (err) {
    return null;
  }
}

/**
 * Save active app settings to Cloudflare D1
 */
export async function saveCloudSettings(settings) {
  try {
    await fetch(`${CLOUDFLARE_API_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return true;
  } catch (err) {
    console.warn('Could not save settings to Cloudflare:', err);
    return false;
  }
}

/**
 * Fetch master metadata (categories, products, lots) from Operation website D1
 */
export async function fetchMasterMeta() {
  try {
    const res = await fetch(`${CLOUDFLARE_API_URL}/api/master/meta`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      categories: data.categories || [],
      products: data.products || [],
      lots: data.lots || [],
    };
  } catch (err) {
    console.error('Failed to fetch master metadata:', err);
    throw err;
  }
}

/**
 * Query master serial numbers from Operation website D1
 */
export async function fetchMasterSerials({
  categoryId = null,
  productId = null,
  productType = null,
  lotNo = null,
  status = null,
  limit = 2000,
} = {}) {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (productId) params.append('productId', productId);
    if (productType) params.append('productType', productType);
    if (lotNo) params.append('lotNo', lotNo);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);

    const res = await fetch(`${CLOUDFLARE_API_URL}/api/master/serials?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      total: data.total || 0,
      serials: data.serials || [],
    };
  } catch (err) {
    console.error('Failed to fetch master serials:', err);
    throw err;
  }
}

