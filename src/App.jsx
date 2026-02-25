import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goTo = (nextPath) => {
    if (nextPath === path) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  return (
    <main className="page">
      <nav className="tabs" aria-label="Main navigation">
        <button type="button" className={path === '/' ? 'tab active' : 'tab'} onClick={() => goTo('/')}>
          Product List
        </button>
        <button
          type="button"
          className={path === '/products/create' ? 'tab active' : 'tab'}
          onClick={() => goTo('/products/create')}
        >
          Create Product
        </button>
        <button
          type="button"
          className={path === '/orders/create' ? 'tab active' : 'tab'}
          onClick={() => goTo('/orders/create')}
        >
          Create Order
        </button>
        <button
          type="button"
          className={path === '/orders' ? 'tab active' : 'tab'}
          onClick={() => goTo('/orders')}
        >
          Order List
        </button>
      </nav>

      {path === '/products/create' ? <CreateProductPage /> : null}
      {path === '/orders/create' ? <CreateOrderPage /> : null}
      {path === '/orders' ? <OrderListPage /> : null}
      {path === '/' ? <ProductListingPage /> : null}
      {path !== '/' && path !== '/products/create' && path !== '/orders/create' && path !== '/orders' ? (
        <ProductListingPage />
      ) : null}
    </main>
  )
}

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

function CreateProductPage() {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    setFieldErrors({})

    const payload = {
      name,
      sku,
      price: Number(price),
      stock_quantity: Number(stockQuantity),
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setFieldErrors(data.errors)
          setError('Validation failed. Please fix the highlighted fields.')
          return
        }

        throw new Error('Failed to create product')
      }

      setSuccess(`Product created successfully.`)
      setName('')
      setSku('')
      setPrice('')
      setStockQuantity('')
    } catch {
      setError('Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="section-title">Create Product</h2>

      {error && <p className="status error">{error}</p>}
      {success && <p className="status success">{success}</p>}

      <form className="order-form" onSubmit={onSubmit}>
        <label>
          Product Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" />
        </label>
        {fieldErrors.name && <p className="field-error">{fieldErrors.name[0]}</p>}

        <label>
          SKU
          <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Enter unique SKU" />
        </label>
        {fieldErrors.sku && <p className="field-error">{fieldErrors.sku[0]}</p>}

        <label>
          Price
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        {fieldErrors.price && <p className="field-error">{fieldErrors.price[0]}</p>}

        <label>
          Stock Quantity
          <input
            type="number"
            min="0"
            step="1"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
          />
        </label>
        {fieldErrors.stock_quantity && <p className="field-error">{fieldErrors.stock_quantity[0]}</p>}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </section>
  )
}

function CreateOrderPage() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [customerName, setCustomerName] = useState('')
  const [status, setStatus] = useState('pending')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    const controller = new AbortController()

    const loadProducts = async () => {
      setLoadingProducts(true)
      try {
        const response = await fetch('/api/products', { signal: controller.signal })
        if (!response.ok) throw new Error('Failed to load products')
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to load products for order form.')
        }
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [])

  const productMap = useMemo(() => {
    const map = new Map()
    products.forEach((product) => map.set(String(product.id), product))
    return map
  }, [products])

  const estimatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = productMap.get(String(item.product_id))
      if (!product) return sum
      return sum + Number(product.price || 0) * Number(item.quantity || 0)
    }, 0)
  }, [items, productMap])

  const updateItem = (index, key, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  const addItem = () => {
    setItems((prev) => [...prev, { product_id: '', quantity: 1 }])
  }

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    setFieldErrors({})

    const payload = {
      customer_name: customerName,
      status,
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setFieldErrors(data.errors)
          setError('Validation failed. Please fix the highlighted fields.')
          return
        }

        throw new Error('Failed to create order')
      }

      setSuccess(`Order created successfully. ID: ${data.id}`)
      setCustomerName('')
      setStatus('pending')
      setItems([{ product_id: '', quantity: 1 }])
    } catch {
      setError('Failed to create order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="section-title">Create Order</h2>

      {loadingProducts && <p className="status">Loading products...</p>}
      {error && <p className="status error">{error}</p>}
      {success && <p className="status success">{success}</p>}

      <form className="order-form" onSubmit={onSubmit}>
        <label>
          Customer Name
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </label>
        {fieldErrors.customer_name && <p className="field-error">{fieldErrors.customer_name[0]}</p>}

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <div className="items-header">
          <h3>Items</h3>
          <button type="button" onClick={addItem} className="btn-secondary">
            + Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="item-row">
            <label>
              Product
              <select
                value={item.product_id}
                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock_quantity})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="btn-danger"
              disabled={items.length === 1}
            >
              Remove
            </button>

            <div className="item-errors">
              {fieldErrors[`items.${index}.product_id`] && (
                <p className="field-error">{fieldErrors[`items.${index}.product_id`][0]}</p>
              )}
              {fieldErrors[`items.${index}.quantity`] && (
                <p className="field-error">{fieldErrors[`items.${index}.quantity`][0]}</p>
              )}
            </div>
          </div>
        ))}

        <p className="total">Total Amount: ${estimatedTotal.toFixed(2)}</p>

        <button type="submit" disabled={submitting || loadingProducts} className="btn-primary">
          {submitting ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </section>
  )
}

function OrderListPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  


  useEffect(() => {
    const controller = new AbortController()

    const loadOrders = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/orders', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to load orders from backend API.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadOrders()

    return () => controller.abort()
  }, [])

  return (
    <section>
      <h2 className="section-title">Order List</h2>

      {loading && <p className="status">Loading orders...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error &&
        (orders.length === 0 ? (
          <p className="status">No orders found.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-card-header">
                  <h3>Order #{order.id}</h3>
                  <span className={`order-status status-${order.status}`}>{order.status}</span>
                </div>
                <p>
                  <strong>Customer:</strong> {order.customer_name}
                </p>
                <p>
                  <strong>Total:</strong> ${Number(order.total_amount || 0).toFixed(2)}
                </p>

                <div className="order-items-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.product?.name || `Product #${item.product_id}`}</td>
                          <td>{item.quantity}</td>
                          <td>${Number(item.unit_price || 0).toFixed(2)}</td>
                          <td>${Number(item.subtotal || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        ))}
    </section>
  )
}

export default App
