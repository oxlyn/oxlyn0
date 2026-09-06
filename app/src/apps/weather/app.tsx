import { useEffect, useMemo, useState } from 'react'
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, Wind } from 'lucide-react'
import { citiesSeed } from './data'
import type { AppDefinition } from '@/system/types'
import { CloudSun as CloudSunGlyph } from 'lucide-react'

interface City { id: string; name: string; country: string; lat: number; lon: number }
const cities = citiesSeed as City[]

type Wx = {
  temp: number; code: number; wind: number; humidity: number
  hourly: { h: string; t: number; code: number }[]
  daily: { day: string; hi: number; lo: number; code: number }[]
  live: boolean
}

// wmo weather interpretation
const wxOf = (code: number): { label: string; Icon: typeof Sun } => {
  if (code === 0) return { label: 'Clear', Icon: Sun }
  if (code <= 2) return { label: code === 1 ? 'Mostly Clear' : 'Partly Cloudy', Icon: CloudSun }
  if (code === 3) return { label: 'Cloudy', Icon: Cloud }
  if (code <= 48) return { label: 'Fog', Icon: CloudFog }
  if (code <= 67) return { label: 'Rain', Icon: CloudRain }
  if (code <= 77) return { label: 'Snow', Icon: CloudSnow }
  if (code <= 82) return { label: 'Showers', Icon: CloudRain }
  return { label: 'Thunderstorm', Icon: CloudLightning }
}

const FALLBACK: Record<string, Wx> = {
  default: {
    temp: 21, code: 2, wind: 14, humidity: 62, live: false,
    hourly: Array.from({ length: 8 }, (_, i) => ({ h: `${(new Date().getHours() + i + 1) % 24}:00`, t: 19 + Math.round(3 * Math.sin(i / 2)), code: i % 4 === 0 ? 0 : 2 })),
    daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ day: d, hi: 22 + (i % 3), lo: 13 + (i % 2), code: [0, 2, 3, 61, 2, 1, 0][i] })),
  },
}

async function fetchWx(c: City): Promise<Wx> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`
  const r = await fetch(url)
  if (!r.ok) throw new Error('http')
  const j = await r.json()
  return {
    temp: Math.round(j.current.temperature_2m),
    code: j.current.weather_code,
    wind: Math.round(j.current.wind_speed_10m),
    humidity: j.current.relative_humidity_2m,
    live: true,
    hourly: j.hourly.time.slice(1, 9).map((t: string, i: number) => ({
      h: new Date(t).toLocaleTimeString('en-US', { hour: 'numeric' }),
      t: Math.round(j.hourly.temperature_2m[i + 1]),
      code: j.hourly.weather_code[i + 1],
    })),
    daily: j.daily.time.map((t: string, i: number) => ({
      day: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }),
      hi: Math.round(j.daily.temperature_2m_max[i]),
      lo: Math.round(j.daily.temperature_2m_min[i]),
      code: j.daily.weather_code[i],
    })),
  }
}

function Weather() {
  const [cityId, setCityId] = useState(cities[0]?.id)
  const [cache, setCache] = useState<Record<string, Wx>>({})

  useEffect(() => {
    let dead = false
    cities.forEach(async (c) => {
      if (cache[c.id]) return
      try {
        const wx = await fetchWx(c)
        if (!dead) setCache((m) => ({ ...m, [c.id]: wx }))
      } catch { /* keep fallback */ }
    })
    return () => { dead = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const city = cities.find((c) => c.id === cityId) ?? cities[0]
  const wx = cache[city.id] ?? FALLBACK.default
  const cur = wxOf(wx.code)
  const lo = Math.min(...wx.daily.map((d) => d.lo))
  const hi = Math.max(...wx.daily.map((d) => d.hi))

  return (
    <div className="flex h-full text-white" style={{ background: 'linear-gradient(180deg,#3a7bd5 0%,#2b5c9e 100%)' }}>
      <div className="w-44 shrink-0 space-y-1 overflow-y-auto bg-black/20 p-2">
        {cities.map((c) => {
          const w = cache[c.id] ?? FALLBACK.default
          return (
            <button
              key={c.id}
              onClick={() => setCityId(c.id)}
              className={`w-full rounded-lg p-2 text-left ${cityId === c.id ? 'bg-white/25' : 'hover:bg-white/10'}`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-[13px] font-medium">{c.name}</span>
                <span className="text-lg font-light tabular-nums">{w.temp}°</span>
              </div>
              <div className="truncate text-[10.5px] text-white/60">{w.live ? wxOf(w.code).label : 'sample · offline'}</div>
            </button>
          )
        })}
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto p-5">
        <div className="text-center">
          <div className="text-[15px] font-medium">{city.name}, {city.country}</div>
          <div className="text-[64px] leading-none font-thin tabular-nums">{wx.temp}°</div>
          <div className="mt-1 flex items-center justify-center gap-2 text-[13px]">
            <cur.Icon size={17} /> {cur.label}
          </div>
          <div className="text-[12.5px] text-white/70 tabular-nums">H:{hi}° L:{lo}° · Humidity {wx.humidity}% · Wind {wx.wind} km/h</div>
          {!wx.live && <div className="mt-1 text-[10.5px] text-white/50">offline — showing sample data</div>}
        </div>
        <div className="mt-5 rounded-xl bg-white/12 p-3 backdrop-blur">
          <div className="mb-2 text-[10.5px] tracking-wide text-white/60 uppercase">Hourly</div>
          <div className="flex justify-between gap-1">
            {wx.hourly.map((h, i) => {
              const ic = wxOf(h.code)
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10.5px] text-white/60">{h.h}</span>
                  <ic.Icon size={16} />
                  <span className="text-[12px] font-medium tabular-nums">{h.t}°</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-white/12 p-3 backdrop-blur">
          <div className="mb-1 text-[10.5px] tracking-wide text-white/60 uppercase">7-Day</div>
          {wx.daily.map((d, i) => {
            const ic = wxOf(d.code)
            return (
              <div key={i} className="flex items-center gap-3 border-b border-white/8 py-1.5 last:border-0">
                <span className="w-10 text-[12.5px]">{d.day}</span>
                <ic.Icon size={15} />
                <span className="ml-auto flex flex-1 items-center gap-2">
                  <span className="w-7 text-right text-[12px] text-white/70 tabular-nums">{d.lo}°</span>
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                    <span className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-300 to-amber-300" style={{ left: `${((d.lo - lo) / Math.max(1, hi - lo)) * 100}%`, right: `${100 - ((d.hi - lo) / Math.max(1, hi - lo)) * 100}%` }} />
                  </span>
                  <span className="w-7 text-[12px] tabular-nums">{d.hi}°</span>
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[10.5px] text-white/45">
          <Wind size={11} /> Live data by Open-Meteo (keyless)
        </div>
      </div>
    </div>
  )
}

export default {
  id: 'weather',
  name: 'Weather',
  icon: { from: '#4DA3FF', to: '#0B5ED7', Icon: CloudSunGlyph },
  component: Weather,
  defaultSize: { w: 860, h: 640 },
  minSize: { w: 480, h: 400 },
  category: 'Information & Reading',
  keywords: ['forecast', 'temperature', 'rain'],
  singleton: true,
} satisfies AppDefinition
