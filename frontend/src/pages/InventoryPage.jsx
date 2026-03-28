import { useEffect, useState } from 'react'
import { ClipboardList, Plus, CheckCircle, Clock } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [inventories, setInventories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/inventory')
      .then(r => setInventories(r.data.data))
      .catch(() => toast.error('خطأ في جلب الجرد'))
      .finally(() => setLoading(false))
  }, [])

  const handleComplete = async (id) => {
    try {
      await api.put(`/inventory/${id}/complete`)
      toast.success('تم إتمام الجرد')
      const r = await api.get('/inventory')
      setInventories(r.data.data)
    } catch { toast.error('خطأ') }
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الجرد</h1>
          <p className="text-slate-500 text-sm">سجل جرد المواقع والمخازن</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inventories.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400">لا توجد جرديات بعد</p>
          <p className="text-slate-300 text-sm mt-1">يمكن إنشاء الجرد من خلال API</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inventories.map(inv => (
            <div key={inv.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.status === 'COMPLETED' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {inv.status === 'COMPLETED'
                    ? <CheckCircle size={20} className="text-green-600" />
                    : <Clock size={20} className="text-yellow-600" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{inv.location?.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(inv.date).toLocaleDateString('ar-DZ')} · {inv.user?.name} · {inv._count?.items} صنف
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${inv.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {inv.status === 'COMPLETED' ? 'مكتمل' : 'مسودة'}
                </span>
                {inv.status === 'DRAFT' && (
                  <button onClick={() => handleComplete(inv.id)} className="btn-success text-xs">
                    <CheckCircle size={14} /> إتمام
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
