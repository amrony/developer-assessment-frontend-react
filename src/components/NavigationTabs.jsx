function NavigationTabs({ path, orderId, goTo }) {
  return (
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
        className={path === '/orders' || orderId ? 'tab active' : 'tab'}
        onClick={() => goTo('/orders')}
      >
        Order List
      </button>
    </nav>
  )
}

export default NavigationTabs
