import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye, Package, X, Loader2, AlertTriangle } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const CONDITIONS = {
  GOOD: { label: 'جيد', color: 'bg-green-100 text-green-700' },
  FAIR: { label: 'مقبول', color: 'bg-yellow-100 text-yellow-700' },
  POOR: { label: 'رديء', color: 'bg-orange-100 text-orange-700' },
  DAMAGED: { label: 'تالف', color: 'bg-red-100 text-red-700' },
}

const EMPTY_FORM = {
  name: '', description: '', serialNumber: '', quantity: 0,
  minQuantity: 1, unit: 'قطعة', condition: 'GOOD',
  categoryId: '', locationId: '', purchaseDate: '', purchasePrice: ''
}

export default function ItemsPage() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterLoc, setFilterLoc] = useState('')
  const [filterCond, setFilterCond] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'view'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterCat) params.categoryId = filterCat
      if (filterLoc) params.locationId = filterLoc
      if (filterCond) params.condition = filterCond
      const [itemsRes, catsRes, locsRes] = await Promise.all([
        api.get('/items', { params }),
        api.get('/categories'),
        api.get('/locations')
      ])
      setItems(itemsRes.data.data)
      setCategories(catsRes.data.data)
      setLocations(locsRes.data.data)
    } catch { toast.error('خطأ في جلب البيانات') }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [search, filterCat, filterLoc, filterCond])

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = (item) => {
    setSelected(item)
    setForm({
      name: item.name, description: item.description || '', serialNumber: item.serialNumber || '',
      quantity: item.quantity, minQuantity: item.minQuantity, unit: item.unit,
      condition: item.condition, categoryId: item.categoryId, locationId: item.locationId,
      purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
      purchasePrice: item.purchasePrice || ''
    })
    setModal('edit')
  }
  const openView = (item) => { setSelected(item); setModal('view') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        minQuantity: Number(form.minQuantity),
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined
      }
      if (modal === 'add') {
        await api.post('/items', payload)
        toast.success('تمت إضافة الوسيلة بنجاح')
      } else {
        await api.put(`/items/${selected.id}`, payload)
        toast.success('تم تحديث الوسيلة بنجاح')
      }
      closeModal()
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في الحفظ')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوسيلة؟')) return
    setDeleting(id)
    try {
      await api.delete(`/items/${id}`)
      toast.success('تم حذف الوسيلة')
      fetchAll()
    } catch { toast.error('خطأ في الحذف') }
    setDeleting(null)
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الوسائل والمخزون</h1>
          <p className="text-slate-500 text-sm">{items.length} وسيلة</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={18} /> إضافة وسيلة
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pr-9" placeholder="بحث باسم الوسيلة..." />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input">
            <option value="">كل الفئات</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} className="input">
            <option value="">كل المواقع</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select value={filterCond} onChange={e => setFilterCond(e.target.value)} className="input">
            <option value="">كل الحالات</option>
            {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-hover">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الوسيلة</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الفئة</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الموقع</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الكمية</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-400">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  لا توجد وسائل
                </td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      {item.serialNumber && <p className="text-xs text-slate-400">{item.serialNumber}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.category?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.location?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={`font-semibold ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-slate-800'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-slate-400">{item.unit}</span>
                      {item.quantity <= item.minQuantity && <AlertTriangle size={14} className="text-orange-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${CONDITIONS[item.condition]?.color}`}>
                      {CONDITIONS[item.condition]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(item)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                        <Eye size={15} />
                      </button>
                      {isAdmin && <>
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          {deleting === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-slate-800">
                {modal === 'add' ? 'إضافة وسيلة جديدة' : 'تعديل الوسيلة'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">اسم الوسيلة *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="مثال: حاسوب مكتبي HP" />
                </div>
                <div>
                  <label className="label">الفئة *</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="input">
                    <option value="">اختر الفئة</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الموقع *</label>
                  <select value={form.locationId} onChange={e => setForm({...form, locationId: e.target.value})} className="input">
                    <option value="">اختر الموقع</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الكمية</label>
                  <input type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">الحد الأدنى للتنبيه</label>
                  <input type="number" min="0" value={form.minQuantity} onChange={e => setForm({...form, minQuantity: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">الوحدة</label>
                  <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="input" placeholder="قطعة، جهاز، رزمة..." />
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="input">
                    {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الرقم التسلسلي</label>
                  <input value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} className="input" dir="ltr" />
                </div>
                <div>
                  <label className="label">تاريخ الشراء</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">ملاحظات</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" rows={2} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
              <button onClick={closeModal} className="btn-secondary flex-1 justify-center">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-slate-800">تفاصيل الوسيلة</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['الاسم', selected.name],
                  ['الفئة', selected.category?.name],
                  ['الموقع', selected.location?.name],
                  ['الكمية', `${selected.quantity} ${selected.unit}`],
                  ['الحالة', CONDITIONS[selected.condition]?.label],
                  ['الرقم التسلسلي', selected.serialNumber || '-'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-slate-400 text-xs">{k}</p>
                    <p className="font-medium text-slate-800 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div>
                  <p className="text-slate-400 text-xs">ملاحظات</p>
                  <p className="text-slate-700 mt-0.5">{selected.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
