// 📊 KREID — Tracking: Google Analytics 4 + Facebook Pixel
// Mercado México — monitoreo de conversión

export function trackPageView(page) {
  // GA4
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: page || window.location.pathname,
    })
  }
  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', 'PageView')
  }
}

export function trackViewItem(product) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_item', {
      currency: 'MXN',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: 1,
      }],
    })
  }
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'MXN',
    })
  }
}

export function trackAddToCart(product, quantity = 1) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', {
      currency: 'MXN',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity,
      }],
    })
  }
  if (typeof fbq !== 'undefined') {
    fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * quantity,
      currency: 'MXN',
    })
  }
}

export function trackBeginCheckout(items, total) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'begin_checkout', {
      currency: 'MXN',
      value: total,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  }
  if (typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout', {
      content_ids: items.map(i => i.id),
      content_type: 'product',
      value: total,
      currency: 'MXN',
    })
  }
}

export function trackPurchase(orderId, items, total, shipping = 0) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: orderId,
      currency: 'MXN',
      value: total,
      shipping,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  }
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Purchase', {
      content_ids: items.map(i => i.id),
      content_type: 'product',
      value: total,
      currency: 'MXN',
      order_id: orderId,
    })
  }
}

export function trackSearch(searchTerm) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'search', {
      search_term: searchTerm,
    })
  }
  if (typeof fbq !== 'undefined') {
    fbq('track', 'Search', { search_string: searchTerm })
  }
}

export function trackViewCart(items, total) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_cart', {
      currency: 'MXN',
      value: total,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  }
}
