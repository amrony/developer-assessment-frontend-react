import { useEffect, useState } from 'react'

function OrderListPage({ onViewDetails }) {
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
                <p>
                  <strong>Items:</strong> {(order.items || []).length}
                </p>
                <button type="button" className="btn-primary" onClick={() => onViewDetails(order.id)}>
                  Order Details
                </button>
              </article>
            ))}
          </div>
        ))}
    </section>
  )
}

export default OrderListPage
