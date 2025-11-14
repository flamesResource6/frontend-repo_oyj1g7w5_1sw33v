import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function ProductCard({ product, onAdd }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {product.image_url ? (
        <img src={product.image_url} alt={product.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-slate-100 to-slate-200" />
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800 line-clamp-1">{product.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
        <div className="mt-auto">
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <button
            onClick={() => onAdd(product)}
            disabled={product.stock <= 0}
            className="w-full mt-3 rounded-lg bg-blue-600 text-white py-2 text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

function Cart({ items, onQty, onCheckout, loading }) {
  const total = useMemo(() => items.reduce((s, it) => s + it.price * it.quantity, 0), [items])
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
      <h3 className="font-semibold text-gray-800 text-lg">Your Cart</h3>
      <div className="mt-3 space-y-3 max-h-64 overflow-auto pr-1">
        {items.length === 0 && <p className="text-sm text-gray-500">Your cart is empty.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{it.title}</p>
              <p className="text-xs text-gray-500">${it.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded bg-gray-100" onClick={() => onQty(it.id, Math.max(1, it.quantity - 1))}>-</button>
              <span className="text-sm w-6 text-center">{it.quantity}</span>
              <button className="px-2 py-1 rounded bg-gray-100" onClick={() => onQty(it.id, it.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-gray-600 text-sm">Total</span>
        <span className="font-semibold">${total.toFixed(2)}</span>
      </div>
      <button
        onClick={onCheckout}
        disabled={items.length === 0 || loading}
        className="w-full mt-3 rounded-lg bg-emerald-600 text-white py-2 text-sm font-medium disabled:opacity-40 hover:bg-emerald-700 transition"
      >
        {loading ? 'Processing...' : 'Checkout'}
      </button>
    </div>
  )
}

function AdminPanel({ onCreated, onUpdated }) {
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', stock: 0, image_url: '' })
  const [update, setUpdate] = useState({ id: '', stock: '', in_stock: true })

  const createProduct = async ()n  => {
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          price: Number(form.price),
          category: form.category || 'general',
          stock: Number(form.stock) || 0,
          image_url: form.image_url || undefined,
          in_stock: (Number(form.stock) || 0) > 0
        })
      })
      if (!res.ok) throw new Error('Failed to create')
      setForm({ title: '', description: '', price: '', category: '', stock: 0, image_url: '' })
      onCreated && onCreated()
    } catch (e) {
      alert(e.message)
    } finally {
      setCreating(false)
    }
  }

  const updateProduct = async () => {
    if (!update.id) return alert('Provide product id')
    setUpdating(true)
    try {
      const body = {}
      if (update.stock !== '') body.stock = Number(update.stock)
      body.in_stock = !!update.in_stock
      const res = await fetch(`${API_BASE}/admin/products/${update.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Failed to update')
      setUpdate({ id: '', stock: '', in_stock: true })
      onUpdated && onUpdated()
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
      <h3 className="font-semibold text-gray-800 text-lg">Admin</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Add Product</p>
          <div className="mt-2 space-y-2">
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
            <button onClick={createProduct} disabled={creating || !form.title || !form.price} className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-medium disabled:opacity-40">{creating ? 'Creating...' : 'Create Product'}</button>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Update Availability</p>
          <div className="mt-2 space-y-2">
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Product ID" value={update.id} onChange={e => setUpdate({ ...update, id: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="w-full border rounded px-3 py-2 text-sm" placeholder="New Stock" type="number" value={update.stock} onChange={e => setUpdate({ ...update, stock: e.target.value })} />
              <select className="w-full border rounded px-3 py-2 text-sm" value={update.in_stock ? 'true' : 'false'} onChange={e => setUpdate({ ...update, in_stock: e.target.value === 'true' })}>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            <button onClick={updateProduct} disabled={updating || !update.id} className="w-full rounded-lg bg-amber-600 text-white py-2 text-sm font-medium disabled:opacity-40">{updating ? 'Updating...' : 'Update Product'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [cart, setCart] = useState([]) // {id,title,price,quantity}
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [tab, setTab] = useState('shop')

  const load = async () => {
    const url = new URL(`${API_BASE}/products`)
    if (q) url.searchParams.set('q', q)
    const res = await fetch(url)
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id)
      if (existing) {
        return prev.map(i => i.id === p.id ? { ...i, quantity: Math.min(i.quantity + 1, p.stock) } : i)
      }
      return [...prev, { id: p.id, title: p.title, price: Number(p.price), quantity: 1 }]
    })
  }

  const changeQty = (id, qty) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
  }

  const checkout = async () => {
    try {
      setLoadingCheckout(true)
      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })) })
      })
      if (!res.ok) {
        const t = await res.text(); throw new Error(t || 'Checkout failed')
      }
      const data = await res.json()
      alert(`Order placed! Total: $${Number(data.total).toFixed(2)}\nOrder ID: ${data.order_id}`)
      setCart([])
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoadingCheckout(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-blue-600 inline-flex items-center justify-center text-white font-bold">S</span>
            <h1 className="text-xl font-semibold text-gray-900">Simple Shop</h1>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <button onClick={() => setTab('shop')} className={`px-3 py-1.5 rounded-lg ${tab==='shop' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>Shop</button>
            <button onClick={() => setTab('admin')} className={`px-3 py-1.5 rounded-lg ${tab==='admin' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>Admin</button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'shop' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <input value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && load()} placeholder="Search products..." className="flex-1 border rounded-lg px-3 py-2" />
                <button onClick={load} className="px-4 py-2 rounded-lg bg-gray-900 text-white">Search</button>
              </div>
              {products.length === 0 ? (
                <div className="text-center text-gray-500 py-16 bg-white rounded-xl border">No products yet. Add some in Admin.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <Cart items={cart} onQty={changeQty} onCheckout={checkout} loading={loadingCheckout} />
            </div>
          </div>
        )}

        {tab === 'admin' && (
          <AdminPanel onCreated={load} onUpdated={load} />
        )}
      </main>

      <footer className="py-8 text-center text-sm text-gray-500">Built with ❤️</footer>
    </div>
  )
}
