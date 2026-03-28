import { useEffect, useState } from 'react'
import { Package, MapPin, Tag, ArrowLeftRight, AlertTriangle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../utils/api'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

const TX_TYPES = {
  PURCHASE: { label: 'شراء', color: 'bg-green-100 text-green-700' },
  DISTRIBUTE: { label: 'توزيع', color: 'bg-blue-100 text-blue-700' },
  TRANSFER: { label: 'تحويل', color: 'bg-purple-100 text-purple-700' },
  RETURN: { label: 'إرجاع', color: 'bg-yellow-100 text-yellow-700' },
  DISPOSAL: { label: 'إتلاف', color: 'bg-red-100 text-red-700' },
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const stats = [
    { label: 'إجمالي الوسائل (نوع)', value: data?.stats?.totalItems ?? 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'إجمالي الكميات', value: data?.stats?.totalQuantity ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'المواقع', value: data?.stats?.totalLocations ?? 0, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'الفئات', value: data?.stats?.totalCategories ?? 0, icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
        <p className="text-slate-500 text-sm mt-1">نظرة عامة على المخزون والعمليات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{s.value.toLocaleString('ar')}</p>
                <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">الوسائل حسب الفئة</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.categoryStats || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans Arabic' }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: 12, borderRadius: 8 }}
                formatter={(val, name) => [val, name === 'totalQty' ? 'الكمية' : 'عدد الأنواع']}
              />
              <Bar dataKey="totalQty" fill="#3b82f6" radius={[4, 4, 0, 0]} name="الكمية" />
              <Bar dataKey="count" fill="#93c5fd" radius={[4, 4, 0, 0]} name="الأنواع" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="text-base font-semibold text-slate-700 mb-4">توزيع الفئات</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data?.categoryStats || []}
                dataKey="totalQty"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(data?.categoryStats || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeftRight size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-slate-700">آخر العمليات</h2>
          </div>
          <div className="space-y-2">
            {(data?.recentTransactions || []).slice(0, 6).map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`badge ${TX_TYPES[tx.type]?.color}`}>{TX_TYPES[tx.type]?.label}</span>
                  <span className="text-sm text-slate-700 truncate">{tx.item?.name}</span>
                </div>
                <div className="text-left flex-shrink-0">
                  <span className="text-sm font-medium text-slate-800">{tx.quantity}</span>
                  <p className="text-xs text-slate-400">{tx.user?.name}</p>
                </div>
              </div>
            ))}
            {!data?.recentTransactions?.length && (
              <p className="text-slate-400 text-sm text-center py-4">لا توجد عمليات بعد</p>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="text-base font-semibold text-slate-700">تنبيهات المخزون</h2>
          </div>
          {(data?.lowStockItems || []).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Package size={20} className="text-green-600" />
              </div>
              <p className="text-slate-500 text-sm">المخزون في مستوى جيد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.location?.name}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-orange-600 font-bold text-sm">{item.quantity}</span>
                    <p className="text-xs text-slate-400">الحد الأدنى: {item.minQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
