import { useEffect, useState } from 'react'

function OrderDetailsPage({ orderId, onBack }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadOrder = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/orders/${orderId}`, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        setOrder(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to load order details from backend API.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadOrder()

    return () => controller.abort()
  }, [orderId])

  return (
    <section>
      <div className="details-header">
        <h2 className="section-title">Order Details</h2>
        <button type="button" className="btn-secondary" onClick={onBack}>
          Back to Order List
        </button>
      </div>

      {loading && <p className="status">Loading order details...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && order ? (
        <article className="order-card">
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
      ) : null}
    </section>
  )
}

export default OrderDetailsPage
