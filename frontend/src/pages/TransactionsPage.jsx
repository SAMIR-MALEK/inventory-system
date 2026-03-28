import { useEffect, useState } from 'react'
import { Plus, ArrowLeftRight, X, Loader2 } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const TX_TYPES = {
  PURCHASE: { label: 'شراء', color: 'bg-green-100 text-green-700' },
  DISTRIBUTE: { label: 'توزيع', color: 'bg-blue-100 text-blue-700' },
  TRANSFER: { label: 'تحويل', color: 'bg-purple-100 text-purple-700' },
  RETURN: { label: 'إرجاع', color: 'bg-yellow-100 text-yellow-700' },
  DISPOSAL: { label: 'إتلاف', color: 'bg-red-100 text-red-700' },
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [items, setItems] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [form, setForm] = useState({ type: 'PURCHASE', itemId: '', quantity: 1, notes: '', fromLocationId: '', toLocationId: '' })

  const fetchAll = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterType) params.type = filterType
      const [txRes, itemsRes, locsRes] = await Promise.all([
        api.get('/transactions', { params }),
        api.get('/items'),
        api.get('/locations')
      ])
      setTransactions(txRes.data.data)
      setItems(itemsRes.data.data)
      setLocations(locsRes.data.data)
    } catch { toast.error('خطأ في جلب البيانات') }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [filterType])

  const handleSave = async () => {
    if (!form.itemId || !form.quantity) return toast.error('يرجى ملء الحقول المطلوبة')
    setSaving(true)
    try {
      await api.post('/transactions', { ...form, quantity: Number(form.quantity) })
      toast.success('تمت العملية بنجاح')
      setModal(false)
      setForm({ type: 'PURCHASE', itemId: '', quantity: 1, notes: '', fromLocationId: '', toLocationId: '' })
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في العملية')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">العمليات</h1>
          <p className="text-slate-500 text-sm">{transactions.length} عملية</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={18} /> عملية جديدة
        </button>
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterType('')} className={`badge cursor-pointer ${!filterType ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>الكل</button>
          {Object.entries(TX_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setFilterType(k)}
              className={`badge cursor-pointer ${filterType === k ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-hover">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-right px-4 py-3 text-slate-600 font-medium">النوع</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الوسيلة</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الكمية</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">المستخدم</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">التاريخ</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-400">
                  <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-30" />
                  لا توجد عمليات
                </td></tr>
              ) : transactions.map(tx => (
                <tr key={tx.id} className="border-b border-slate-50">
                  <td className="px-4 py-3">
                    <span className={`badge ${TX_TYPES[tx.type]?.color}`}>{TX_TYPES[tx.type]?.label}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{tx.item?.name}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{tx.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{tx.user?.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs" dir="ltr">
                    {new Date(tx.date).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{tx.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-slate-800">تسجيل عملية جديدة</h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">نوع العملية *</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input">
                  {Object.entries(TX_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">الوسيلة *</label>
                <select value={form.itemId} onChange={e => setForm({...form, itemId: e.target.value})} className="input">
                  <option value="">اختر الوسيلة</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} (متوفر: {i.quantity})</option>)}
                </select>
              </div>
              <div>
                <label className="label">الكمية *</label>
                <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input" />
              </div>
              {form.type === 'TRANSFER' && (
                <>
                  <div>
                    <label className="label">من موقع</label>
                    <select value={form.fromLocationId} onChange={e => setForm({...form, fromLocationId: e.target.value})} className="input">
                      <option value="">اختر الموقع</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">إلى موقع</label>
                    <select value={form.toLocationId} onChange={e => setForm({...form, toLocationId: e.target.value})} className="input">
                      <option value="">اختر الموقع</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="label">ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input" rows={2} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'جارٍ الحفظ...' : 'تأكيد العملية'}
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
