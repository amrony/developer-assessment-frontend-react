import { useEffect, useMemo, useState } from 'react'

function ProductListingPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadProducts = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/products', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to load products from backend API.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [])

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stock_quantity || 0), 0),
    [products],
  )

  return (
    <section>
      <h2 className="section-title">Product Listing</h2>

      {loading && <p className="status">Loading products...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <div className="table-summary">
            <span>Total products: {products.length}</span>
            <span>Total stock: {totalStock}</span>
          </div>

          {products.length === 0 ? (
            <p className="status">No products found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>${Number(product.price || 0).toFixed(2)}</td>
                    <td>{product.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  )
}

export default ProductListingPage
