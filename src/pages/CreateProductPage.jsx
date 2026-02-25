import { useState } from 'react'

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

      setSuccess('Product created successfully.')
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

export default CreateProductPage
