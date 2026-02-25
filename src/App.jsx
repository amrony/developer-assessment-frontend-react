import { useEffect, useState } from 'react'
import './App.css'
import NavigationTabs from './components/NavigationTabs'
import CreateOrderPage from './pages/CreateOrderPage'
import CreateProductPage from './pages/CreateProductPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import OrderListPage from './pages/OrderListPage'
import ProductListingPage from './pages/ProductListingPage'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const orderDetailsMatch = path.match(/^\/orders\/(\d+)$/)
  const orderId = orderDetailsMatch ? Number(orderDetailsMatch[1]) : null

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
      <NavigationTabs path={path} orderId={orderId} goTo={goTo} />

      {path === '/products/create' ? <CreateProductPage /> : null}
      {path === '/orders/create' ? <CreateOrderPage /> : null}
      {path === '/orders' ? <OrderListPage onViewDetails={(id) => goTo(`/orders/${id}`)} /> : null}
      {orderId ? <OrderDetailsPage orderId={orderId} onBack={() => goTo('/orders')} /> : null}
      {path === '/' ? <ProductListingPage /> : null}
      {path !== '/' && path !== '/products/create' && path !== '/orders/create' && path !== '/orders' && !orderId ? (
        <ProductListingPage />
      ) : null}
    </main>
  )
}

export default App
