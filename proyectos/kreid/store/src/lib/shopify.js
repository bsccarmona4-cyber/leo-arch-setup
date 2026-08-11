// 🛒 Shopify Storefront API — KREID Headless Commerce
// Conecta el frontend React con Shopify como backend

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || ''
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || ''

const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`

async function shopifyFetch(query, variables = {}) {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    console.warn('⚠️ Shopify no configurado. Usando datos locales.')
    return null
  }

  try {
    const res = await fetch(SHOPIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    })
    const json = await res.json()
    if (json.errors) {
      console.error('Shopify API errors:', json.errors)
      return null
    }
    return json.data
  } catch (err) {
    console.error('Shopify fetch error:', err)
    return null
  }
}

// ─── Product Queries ───

const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`

const PRODUCT_QUERY = `
  query Product($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

// ─── Cart Queries ───

const CREATE_CART_MUTATION = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

const CART_QUERY = `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  images(first: 1) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`

// ─── Public API ───

export async function getProducts(first = 20) {
  const data = await shopifyFetch(PRODUCTS_QUERY, { first })
  if (!data?.products?.edges) return null

  return data.products.edges.map(edge => ({
    id: edge.node.id,
    shopifyId: edge.node.id,
    handle: edge.node.handle,
    title: edge.node.title,
    description: edge.node.description,
    available: edge.node.availableForSale,
    price: parseFloat(edge.node.priceRange.minVariantPrice.amount),
    currency: edge.node.priceRange.minVariantPrice.currencyCode,
    image: edge.node.images.edges[0]?.node?.url || '',
    imageAlt: edge.node.images.edges[0]?.node?.altText || edge.node.title,
  }))
}

export async function getProductByHandle(handle) {
  const data = await shopifyFetch(PRODUCT_QUERY, { handle })
  if (!data?.productByHandle) return null

  const p = data.productByHandle
  return {
    id: p.id,
    shopifyId: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    available: p.availableForSale,
    price: parseFloat(p.priceRange.minVariantPrice.amount),
    currency: p.priceRange.minVariantPrice.currencyCode,
    images: p.images.edges.map(e => ({
      url: e.node.url,
      alt: e.node.altText || p.title,
    })),
    variants: p.variants.edges.map(e => ({
      id: e.node.id,
      title: e.node.title,
      available: e.node.availableForSale,
      price: parseFloat(e.node.price.amount),
    })),
  }
}

export async function createShopifyCart(lines = []) {
  const input = {
    lines: lines.map(l => ({
      merchandiseId: l.variantId,
      quantity: l.quantity || 1,
    })),
  }
  const data = await shopifyFetch(CREATE_CART_MUTATION, { input })
  if (!data?.cartCreate?.cart) return null

  return {
    id: data.cartCreate.cart.id,
    checkoutUrl: data.cartCreate.cart.checkoutUrl,
    totalQuantity: data.cartCreate.cart.totalQuantity,
    totalAmount: data.cartCreate.cart.cost.totalAmount,
  }
}

export async function getCart(cartId) {
  const data = await shopifyFetch(CART_QUERY, { cartId })
  if (!data?.cart) return null
  return data.cart
}

// ─── Helper: crear checkout URL de Shopify ───
export function isShopifyReady() {
  return !!(SHOPIFY_DOMAIN && STOREFRONT_TOKEN)
}
