'use client';
// components/private-ai/OrgSentimentDashboard.tsx
// Dashboard para Mtra. Esperanza — solo datos agregados, nunca individuales

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'; // npm install recharts

interface AnalyticsData {
  snapshots: any[];
  aggregated: {
    avgSentiment: number;
    totalSessions: number;
    riskTrend: 'improving' | 'stable' | 'worsening';
    topRiskArea: string;
    crisisTotal: number;
    riskDistribution: Record<string, number>;
    period: string;
  } | null;
  privacy_note?: boolean;
  message?: string;
}

const RISK_COLORS: Record<string, string> = {
  none: '#0D9488',
  stress: '#F59E0B',
  burnout: '#F97316',
  harassment: '#EF4444',
  crisis: '#7C3AED',
};

const RISK_LABELS: Record<string, string> = {
  none: 'Sin riesgo',
  stress: 'Estrés',
  burnout: 'Burnout',
  harassment: 'Acoso',
  crisis: 'Crisis',
};

const TREND_CONFIG = {
  improving: { label: 'Mejorando', color: 'text-teal-400', icon: '↗' },
  stable: { label: 'Estable', color: 'text-yellow-400', icon: '→' },
  worsening: { label: 'Deteriorando', color: 'text-red-400', icon: '↘' },
};

export function OrgSentimentDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/private-ai/analytics?days=${period}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  // Formatear datos de snapshots para LineChart
  const chartData =
    data?.snapshots?.map((s: any) => ({
      date: new Date(s.snapshot_date).toLocaleDateString('es-MX', {
        month: 'short',
        day: 'numeric',
      }),
      sentimiento: parseFloat(((s.avg_sentiment || 0) * 100).toFixed(1)),
      sesiones: s.total_sessions,
    })) || [];

  // Datos para PieChart de riesgos
  const pieData = data?.aggregated?.riskDistribution
    ? Object.entries(data.aggregated.riskDistribution)
        .filter(([, v]) => (v as number) > 0)
        .map(([k, v]) => ({
          name: RISK_LABELS[k] || k,
          value: v as number,
          color: RISK_COLORS[k] || '#6B7280',
        }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-3" />
        Cargando métricas...
      </div>
    );
  }

  if (data?.privacy_note || !data?.aggregated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h3 className="font-semibold text-white mb-2">Datos en construcción</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          {data?.message ||
            'Se necesitan al menos 5 conversaciones activas para mostrar métricas de manera anónima y segura.'}
        </p>
      </div>
    );
  }

  const { aggregated } = data;
  const trend = TREND_CONFIG[aggregated.riskTrend];
  const sentimentPercent = Math.round((aggregated.avgSentiment + 1) * 50);

  return (
    <div className="space-y-6">
      {/* ── Banner de privacidad ─────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl border border-slate-700">
        <span className="text-teal-400 text-lg">🔒</span>
        <p className="text-slate-400 text-xs">
          <span className="text-white font-medium">Privacidad garantizada:</span>{' '}
          Estas métricas son promedios grupales anónimos. Ningún dato individual es visible.
          Los grupos de menos de 5 personas no se muestran.
        </p>
      </div>

      {/* ── Selector de período ──────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Período:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setPeriod(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              period === d
                ? 'bg-teal-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {d === 7 ? 'Última semana' : d === 30 ? 'Último mes' : 'Últimos 90 días'}
          </button>
        ))}
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Clima General */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-2">Clima Organizacional</p>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-white">{sentimentPercent}%</span>
            <span className="text-slate-500 text-xs mb-1">bienestar</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
              style={{ width: `${sentimentPercent}%` }}
            />
          </div>
        </div>

        {/* Tendencia */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-2">Tendencia</p>
          <div className={`text-2xl font-bold ${trend.color}`}>
            {trend.icon} {trend.label}
          </div>
          <p className="text-slate-500 text-xs mt-1">vs período anterior</p>
        </div>

        {/* Conversaciones */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-2">Conversaciones</p>
          <span className="text-2xl font-bold text-white">{aggregated.totalSessions}</span>
          <p className="text-slate-500 text-xs mt-1">en {aggregated.period}</p>
        </div>

        {/* Mayor riesgo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-2">Área de Atención</p>
          <span
            className="text-lg font-bold capitalize"
            style={{ color: RISK_COLORS[aggregated.topRiskArea] || '#6B7280' }}
          >
            {RISK_LABELS[aggregated.topRiskArea] || aggregated.topRiskArea}
          </span>
          <p className="text-slate-500 text-xs mt-1">riesgo más frecuente</p>
        </div>
      </div>

      {/* ── Gráfica de Tendencia ─────────────────────────── */}
      {chartData.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4">
            Índice de Bienestar (últimos {period} días)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 11 }}
                domain={[-100, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#F1F5F9',
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value}%`, 'Bienestar']}
              />
              <Line
                type="monotone"
                dataKey="sentimiento"
                stroke="#0D9488"
                strokeWidth={2}
                dot={{ fill: '#0D9488', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Distribución de Riesgos ──────────────────────── */}
      {pieData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4">Distribución de Situaciones</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-300 text-sm">{entry.name}</span>
                  <span className="text-slate-500 text-sm ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Alerta de crisis si hay ───────────────────────── */}
      {aggregated.crisisTotal > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <span className="text-purple-400 text-lg">⚠️</span>
          <div>
            <p className="text-purple-300 font-medium text-sm">
              {aggregated.crisisTotal} conversación{aggregated.crisisTotal > 1 ? 'es' : ''} con señales de crisis detectada{aggregated.crisisTotal > 1 ? 's' : ''}
            </p>
            <p className="text-purple-400/70 text-xs mt-1">
              ARIA derivó a recursos de apoyo. Considera reforzar el programa de bienestar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
