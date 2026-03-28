import { useEffect, useState } from 'react'
import { Plus, Users, X, Loader2, Trash2, ShieldCheck, User } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    const r = await api.get('/users')
    setUsers(r.data.data)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('يرجى ملء كل الحقول')
    setSaving(true)
    try {
      await api.post('/users', form)
      toast.success('تمت إضافة المستخدم')
      setModal(false)
      setForm({ name: '', email: '', password: '', role: 'USER' })
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المستخدم؟')) return
    try { await api.delete(`/users/${id}`); toast.success('تم الحذف'); fetchUsers() }
    catch { toast.error('خطأ في الحذف') }
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">المستخدمون</h1>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> إضافة مستخدم</button>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm table-hover">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-right px-4 py-3 text-slate-600 font-medium">الاسم</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">البريد الإلكتروني</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">الدور</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">تاريخ الإنشاء</th>
              <th className="text-right px-4 py-3 text-slate-600 font-medium">حذف</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      {u.name[0]}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500" dir="ltr">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role === 'ADMIN' ? <><ShieldCheck size={12} /> مدير</> : <><User size={12} /> مستخدم</>}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString('ar-DZ')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">إضافة مستخدم جديد</h2>
              <button onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="label">الاسم الكامل</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" /></div>
              <div><label className="label">البريد الإلكتروني</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" dir="ltr" /></div>
              <div><label className="label">كلمة المرور</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" dir="ltr" /></div>
              <div><label className="label">الدور</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input">
                  <option value="USER">مستخدم عادي</option>
                  <option value="ADMIN">مدير النظام</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null} إضافة
              </button>
              <button onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
