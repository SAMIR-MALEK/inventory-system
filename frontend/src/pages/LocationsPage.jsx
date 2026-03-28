// LocationsPage.jsx
import { useEffect, useState } from 'react'
import { Plus, MapPin, Warehouse, Monitor, X, Loader2, Trash2, Edit2 } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const LOC_TYPES = {
  STORAGE: { label: 'مخزن', color: 'bg-blue-100 text-blue-700', icon: Warehouse },
  OFFICE: { label: 'مكتب', color: 'bg-green-100 text-green-700', icon: Monitor },
  HALL: { label: 'قاعة', color: 'bg-purple-100 text-purple-700', icon: MapPin },
}

export default function LocationsPage() {
  const { isAdmin } = useAuth()
  const [locations, setLocations] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'STORAGE', description: '' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    const r = await api.get('/locations')
    setLocations(r.data.data)
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setForm({ name: '', type: 'STORAGE', description: '' }); setEditing(null); setModal(true) }
  const openEdit = (l) => { setEditing(l); setForm({ name: l.name, type: l.type, description: l.description || '' }); setModal(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) { await api.put(`/locations/${editing.id}`, form); toast.success('تم التحديث') }
      else { await api.post('/locations', form); toast.success('تمت الإضافة') }
      setModal(false); fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا الموقع؟')) return
    try { await api.delete(`/locations/${id}`); toast.success('تم الحذف'); fetch() }
    catch { toast.error('خطأ في الحذف') }
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">المواقع</h1>
        {isAdmin && <button onClick={openAdd} className="btn-primary"><Plus size={18} /> إضافة موقع</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => {
          const T = LOC_TYPES[loc.type]
          const Icon = T.icon
          return (
            <div key={loc.id} className="card flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${T.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{loc.name}</p>
                  <span className={`badge ${T.color} text-xs`}>{T.label}</span>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(loc)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(loc.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'تعديل الموقع' : 'إضافة موقع'}</h2>
              <button onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="label">الاسم</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" /></div>
              <div><label className="label">النوع</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input">
                  {Object.entries(LOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div><label className="label">وصف</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" /></div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null} حفظ
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
