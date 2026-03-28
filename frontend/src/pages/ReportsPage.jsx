import { useEffect, useState } from 'react'
import { BarChart3, Printer, Download, Package, MapPin, ArrowLeftRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../utils/api'

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [items, setItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/items'), api.get('/transactions', { params: { limit: 100 } })])
      .then(([d, i, t]) => {
        setData(d.data.data)
        setItems(i.data.data)
        setTransactions(t.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const lowStock = items.filter(i => i.quantity <= i.minQuantity)
  const goodItems = items.filter(i => i.condition === 'GOOD').length
  const damagedItems = items.filter(i => i.condition === 'DAMAGED').length

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">التقارير والإحصائيات</h1>
          <p className="text-slate-500 text-sm">تقرير شامل لحالة المخزون</p>
        </div>
        <button onClick={handlePrint} className="btn-primary">
          <Printer size={18} /> طباعة التقرير
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الأصناف', value: items.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'في حالة جيدة', value: goodItems, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'تالفة', value: damagedItems, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'مخزون منخفض', value: lowStock.length, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">الوسائل حسب الفئة</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.categoryStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'IBM Plex Sans Arabic' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="totalQty" fill="#3b82f6" radius={[4,4,0,0]} name="الكمية" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock table */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Package size={16} className="text-orange-500" /> وسائل المخزون المنخفض
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">المخزون في مستوى جيد ✓</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lowStock.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-orange-50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.location?.name}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-orange-600 font-bold">{item.quantity}</p>
                    <p className="text-xs text-slate-400">/ {item.minQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full inventory table for print */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-700 mb-4">قائمة الجرد الكاملة</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-right px-3 py-2 text-slate-600 font-medium">الوسيلة</th>
                <th className="text-right px-3 py-2 text-slate-600 font-medium">الفئة</th>
                <th className="text-right px-3 py-2 text-slate-600 font-medium">الموقع</th>
                <th className="text-right px-3 py-2 text-slate-600 font-medium">الكمية</th>
                <th className="text-right px-3 py-2 text-slate-600 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                  <td className="px-3 py-2 text-slate-600">{item.category?.name}</td>
                  <td className="px-3 py-2 text-slate-600">{item.location?.name}</td>
                  <td className="px-3 py-2 text-slate-800">{item.quantity} {item.unit}</td>
                  <td className="px-3 py-2">
                    <span className={`badge text-xs ${
                      item.condition === 'GOOD' ? 'bg-green-100 text-green-700' :
                      item.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-700' :
                      item.condition === 'POOR' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {{ GOOD: 'جيد', FAIR: 'مقبول', POOR: 'رديء', DAMAGED: 'تالف' }[item.condition]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-slate-400 text-center">
          تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-DZ')} - نظام إدارة الوسائل - كلية الحقوق والعلوم السياسية - جامعة برج بوعريريج
        </div>
      </div>
    </div>
  )
}
