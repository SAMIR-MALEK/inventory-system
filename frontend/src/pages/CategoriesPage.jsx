import { useEffect, useState } from 'react'
import { Plus, Tag, X, Loader2, Trash2, Edit2 } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function CategoriesPage() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchCats = async () => {
    const r = await api.get('/categories')
    setCategories(r.data.data)
  }

  useEffect(() => { fetchCats() }, [])

  const openAdd = () => { setForm({ name: '', description: '' }); setEditing(null); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setModal(true) }

  const handleSave = async () => {
    if (!form.name) return toast.error('الاسم مطلوب')
    setSaving(true)
    try {
      if (editing) { await api.put(`/categories/${editing.id}`, form); toast.success('تم التحديث') }
      else { await api.post('/categories', form); toast.success('تمت الإضافة') }
      setModal(false); fetchCats()
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذه الفئة؟')) return
    try { await api.delete(`/categories/${id}`); toast.success('تم الحذف'); fetchCats() }
    catch { toast.error('لا يمكن الحذف - توجد وسائل مرتبطة') }
  }

  const COLORS = ['bg-blue-50 text-blue-600', 'bg-green-50 text-green-600', 'bg-purple-50 text-purple-600', 'bg-orange-50 text-orange-600', 'bg-pink-50 text-pink-600', 'bg-cyan-50 text-cyan-600']

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">الفئات</h1>
        {isAdmin && <button onClick={openAdd} className="btn-primary"><Plus size={18} /> إضافة فئة</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <div key={cat.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLORS[i % COLORS.length]}`}>
                <Tag size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{cat.name}</p>
                <p className="text-xs text-slate-400">{cat._count?.items || 0} وسيلة</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'تعديل الفئة' : 'إضافة فئة'}</h2>
              <button onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="label">اسم الفئة *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" /></div>
              <div><label className="label">وصف</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" rows={2} /></div>
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
