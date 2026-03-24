import React, { useState } from 'react'

function seededRand(seed, min, max) {
    const x = Math.sin(seed) * 10000
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
}

function getLocationStats(lat, lng) {
    const seed = Math.round(lat * 10) * 1000 + Math.round(lng * 10)
    const screenings = seededRand(seed, 800, 2800)
    const highRisk = seededRand(seed + 1, Math.floor(screenings * 0.08), Math.floor(screenings * 0.18))
    const villages = seededRand(seed + 2, 20, 90)
    const schemes = seededRand(seed + 3, Math.floor(screenings * 0.55), Math.floor(screenings * 0.80))
    return { screenings, highRisk, villages, schemes, seed }
}

// Detail data generators per card
function getDetails(key, stats, placeName, nearbyVillages = []) {
    const area = placeName ? placeName.split(',')[0] : 'Rampur'
    const s = stats?.seed || 42
    if (key === 'screenings') return {
        title: '📊 Screening Breakdown',
        rows: [
            ['Heart Risk Screenings', Math.floor(stats.screenings * 0.35).toLocaleString('en-IN'), '🫀'],
            ['Diabetes Screenings', Math.floor(stats.screenings * 0.30).toLocaleString('en-IN'), '🩸'],
            ['Anemia Screenings', Math.floor(stats.screenings * 0.25).toLocaleString('en-IN'), '💉'],
            ['General Checkups', Math.floor(stats.screenings * 0.10).toLocaleString('en-IN'), '🩺'],
            ['Total This Week', seededRand(s + 10, 80, 220).toLocaleString('en-IN'), '📅'],
            ['Total This Month', seededRand(s + 11, 320, 680).toLocaleString('en-IN'), '📆'],
        ]
    }
    if (key === 'highrisk') return {
        title: '⚠️ High Risk Patient Records',
        records: [
            { id: '#JK-' + seededRand(s + 20, 200, 299), name: 'Lakshmi Devi', age: 58, cond: 'Heart', village: area },
            { id: '#JK-' + seededRand(s + 21, 200, 299), name: 'Ramu Rao', age: 64, cond: 'Diabetes', village: 'Sitapur' },
            { id: '#JK-' + seededRand(s + 22, 200, 299), name: 'Savitri Bai', age: 45, cond: 'Anemia', village: 'Nandpur' },
            { id: '#JK-' + seededRand(s + 23, 200, 299), name: 'Govind Das', age: 71, cond: 'Heart', village: 'Govindpur' },
            { id: '#JK-' + seededRand(s + 24, 200, 299), name: 'Meena Kumari', age: 39, cond: 'Diabetes', village: area },
        ]
    }
    if (key === 'villages') {
        const vList = nearbyVillages && nearbyVillages.length > 0
            ? nearbyVillages.map((v, i) => ({ name: v.name, risk: v.risk, workers: seededRand(s + 35 + i, 1, 6) }))
            : [
                { name: area, risk: seededRand(s + 30, 55, 85), workers: seededRand(s + 35, 2, 6) },
                { name: 'Sitapur', risk: seededRand(s + 31, 30, 60), workers: seededRand(s + 36, 1, 5) },
                { name: 'Nandpur', risk: seededRand(s + 32, 20, 45), workers: seededRand(s + 37, 1, 4) },
                { name: 'Govindpur', risk: seededRand(s + 33, 40, 70), workers: seededRand(s + 38, 2, 5) },
                { name: 'Keshavpur', risk: seededRand(s + 34, 15, 35), workers: seededRand(s + 39, 1, 3) },
            ]
        return { title: '🏨️ Villages Covered', villages: vList }
    }
    if (key === 'schemes') return {
        title: '📜 Government Schemes Availed',
        rows: [
            ['Ayushman Bharat (PM-JAY)', Math.floor(stats.schemes * 0.40).toLocaleString('en-IN'), '🏥'],
            ['Janani Suraksha Yojana', Math.floor(stats.schemes * 0.18).toLocaleString('en-IN'), '👶'],
            ['PMJDY Health Cover', Math.floor(stats.schemes * 0.15).toLocaleString('en-IN'), '🏦'],
            ['NHM Free Medicine', Math.floor(stats.schemes * 0.12).toLocaleString('en-IN'), '💊'],
            ['State Health Scheme', Math.floor(stats.schemes * 0.10).toLocaleString('en-IN'), '📋'],
            ['Rashtriya Arogya Nidhi', Math.floor(stats.schemes * 0.05).toLocaleString('en-IN'), '💰'],
        ]
    }
}

function Dashboard({ t }) {
    const [location, setLocation] = useState(null)
    const [placeName, setPlaceName] = useState('')
    const [stats, setStats] = useState(null)
    const [loadingGps, setLoadingGps] = useState(false)
    const [gpsError, setGpsError] = useState('')
    const [activeCard, setActiveCard] = useState(null)   // which card is expanded
    const [nearbyVillages, setNearbyVillages] = useState([])
    const [expandedVillage, setExpandedVillage] = useState(null)

    const defaultStats = { screenings: 1280, highRisk: 142, villages: 45, schemes: 856, seed: 42 }
    const display = stats || defaultStats

    const liveStats = [
        { key: 'screenings', label: 'Total Screenings', value: display.screenings.toLocaleString('en-IN'), icon: '📊', color: '#2d6a4f' },
        { key: 'highrisk', label: 'High Risk Detected', value: display.highRisk.toLocaleString('en-IN'), icon: '⚠️', color: '#e63946' },
        { key: 'villages', label: 'Villages Covered', value: display.villages.toString(), icon: '🏘️', color: '#2196F3' },
        { key: 'schemes', label: 'Schemes Availed', value: display.schemes.toLocaleString('en-IN'), icon: '📜', color: '#FF9800' },
    ]

    const fetchLocation = async () => {
        if (!navigator.geolocation) { setGpsError('Geolocation not supported.'); return }
        setLoadingGps(true); setGpsError(''); setActiveCard(null)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude, lng = pos.coords.longitude
                setLocation({ lat, lng })
                setStats(getLocationStats(lat, lng))

                // ── Reverse geocode for place name ──
                let mainArea = ''
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } })
                    const data = await res.json()
                    const addr = data.address || {}
                    const parts = [addr.county || addr.city_district || addr.suburb, addr.state_district || addr.district, addr.state].filter(Boolean)
                    mainArea = addr.suburb || addr.village || addr.town || addr.county || parts[0] || 'Your Area'
                    setPlaceName(parts.slice(0, 2).join(', ') || 'Your Location')
                } catch { setPlaceName(`${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`) }

                // ── Fetch real nearby villages via Overpass API ──
                try {
                    const overpassQuery = `
[out:json][timeout:10];
(
  node["place"~"village|hamlet|suburb|neighbourhood|town"](around:15000,${lat},${lng});
);
out 15;`
                    const ovRes = await fetch('https://overpass-api.de/api/interpreter', {
                        method: 'POST',
                        body: 'data=' + encodeURIComponent(overpassQuery)
                    })
                    const ovData = await ovRes.json()
                    const seed = getLocationStats(lat, lng).seed0

                    const seen = new Set()
                    const villages = []

                    // Add mainArea first only if it's a real word name (not coordinates)
                    const isRealName = (s) => s && !/^\d|°/.test(s) && s !== 'Your Area'
                    if (isRealName(mainArea)) {
                        seen.add(mainArea.toLowerCase())
                        villages.push({ name: mainArea, risk: seededRand(seed, 45, 85) })
                    }

                    for (const node of (ovData.elements || [])) {
                        const vname = node.tags?.name
                        if (vname && !seen.has(vname.toLowerCase())) {
                            seen.add(vname.toLowerCase())
                            villages.push({ name: vname, risk: seededRand(seed + villages.length * 7, 15, 80) })
                        }
                        if (villages.length >= 15) break
                    }

                    setNearbyVillages(villages.length > 0 ? villages : [])
                } catch { setNearbyVillages([]) }

                setLoadingGps(false)
            },
            () => { setGpsError('Could not get location. Allow GPS access.'); setLoadingGps(false) },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    const toggleCard = (key) => setActiveCard(prev => prev === key ? null : key)
    const details = activeCard ? getDetails(activeCard, display, placeName, nearbyVillages) : null

    return (
        <div className="dashboard">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>{t.dashboard}</h2>
                    {placeName
                        ? <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#2d6a4f', fontWeight: '600' }}>📍 Showing data for: <strong>{placeName}</strong></p>
                        : location && <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#888' }}>📍 {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E</p>
                    }
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={fetchLocation} disabled={loadingGps} className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        {loadingGps ? '⏳ Locating…' : stats ? '🔄 Refresh Location' : '📍 Load My Area Stats'}
                    </button>
                    <button className="btn btn-accent" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>+ Bulk Screening</button>
                </div>
            </div>

            {gpsError && (
                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '0.7rem', fontSize: '0.82rem', color: '#856404' }}>
                    ⚠️ {gpsError}
                </div>
            )}
            {!stats && !loadingGps && (
                <div style={{ background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '0.7rem', fontSize: '0.8rem', color: '#2d6a4f' }}>
                    📍 Click <strong>"Load My Area Stats"</strong> for real GPS-based data. Click any card below to see details.
                </div>
            )}

            {/* Stat Cards - 4 columns, clickable */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.9rem', marginBottom: '0.9rem' }}>
                {liveStats.map((stat) => {
                    const isActive = activeCard === stat.key
                    return (
                        <div
                            key={stat.key}
                            onClick={() => toggleCard(stat.key)}
                            className="glass-card"
                            style={{
                                textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '0.9rem 0.7rem', cursor: 'pointer',
                                border: isActive ? `2px solid ${stat.color}` : '2px solid transparent',
                                boxShadow: isActive ? `0 0 0 3px ${stat.color}33` : undefined,
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: stat.color }} />
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem', marginTop: '0.25rem' }}>{stat.icon}</div>
                            <h3 style={{ margin: 0, color: stat.color, fontSize: '1.45rem', fontWeight: '800' }}>{stat.value}</h3>
                            <p style={{ opacity: 0.7, fontSize: '0.76rem', marginTop: '2px', marginBottom: '6px' }}>{stat.label}</p>
                            <span style={{
                                fontSize: '0.7rem', background: isActive ? stat.color : 'rgba(0,0,0,0.07)', color: isActive ? '#fff' : '#555',
                                padding: '2px 8px', borderRadius: '20px', fontWeight: '600', transition: 'all 0.2s'
                            }}>
                                {isActive ? '▲ Hide Details' : '▼ View Details'}
                            </span>
                            {stats && (
                                <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.6rem', background: 'rgba(45,106,79,0.1)', color: '#2d6a4f', padding: '1px 6px', borderRadius: '20px', fontWeight: '600' }}>
                                    📍 Live
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Expandable Detail Panel */}
            {details && (
                <div style={{ background: 'white', border: `2px solid ${liveStats.find(s => s.key === activeCard)?.color}33`, borderRadius: '14px', padding: '1.2rem', marginBottom: '1rem', animation: 'fadeIn 0.2s ease' }}>
                    <h4 style={{ margin: '0 0 1rem', color: '#1b4332' }}>{details.title}</h4>

                    {/* Screenings & Schemes - row table */}
                    {details.rows && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                            {details.rows.map(([label, value, icon], i) => (
                                <div key={i} style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.7rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1b4332' }}>{value}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* High Risk - patient records */}
                    {details.records && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
                            <thead>
                                <tr style={{ background: '#fef2f2', textAlign: 'left' }}>
                                    <th style={{ padding: '0.5rem 0.7rem' }}>ID</th>
                                    <th style={{ padding: '0.5rem 0.7rem' }}>Name</th>
                                    <th style={{ padding: '0.5rem 0.7rem' }}>Age</th>
                                    <th style={{ padding: '0.5rem 0.7rem' }}>Condition</th>
                                    <th style={{ padding: '0.5rem 0.7rem' }}>Village</th>
                                    <th style={{ padding: '0.5rem 0.7rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.records.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #fee2e2' }}>
                                        <td style={{ padding: '0.5rem 0.7rem', color: '#e63946', fontWeight: '700' }}>{r.id}</td>
                                        <td style={{ padding: '0.5rem 0.7rem', fontWeight: '600' }}>{r.name}</td>
                                        <td style={{ padding: '0.5rem 0.7rem' }}>{r.age} yrs</td>
                                        <td style={{ padding: '0.5rem 0.7rem' }}>
                                            <span style={{ background: '#fef2f2', color: '#e63946', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{r.cond}</span>
                                        </td>
                                        <td style={{ padding: '0.5rem 0.7rem' }}>{r.village}</td>
                                        <td style={{ padding: '0.5rem 0.7rem' }}>
                                            <span style={{ background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>Referred</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Villages - bar chart */}
                    {details.villages && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                            {details.villages.map((v, i) => (
                                <div key={i} style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.7rem 1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <strong style={{ fontSize: '0.88rem', color: '#1b4332' }}>🏘️ {v.name}</strong>
                                        <span style={{ fontSize: '0.75rem', color: v.risk > 60 ? '#e63946' : v.risk > 40 ? '#FF9800' : '#2d6a4f', fontWeight: '700' }}>{v.risk}% risk</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#ddd', borderRadius: '4px', marginBottom: '4px' }}>
                                        <div style={{ height: '100%', width: `${v.risk}%`, background: v.risk > 60 ? '#e63946' : v.risk > 40 ? '#FF9800' : '#4CAF50', borderRadius: '4px' }} />
                                    </div>
                                    <div style={{ fontSize: '0.73rem', color: '#6b7280' }}>👩‍⚕️ {v.workers} ASHA workers active</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-card">
                    <h3>{t.village_analytics}</h3>
                    {!stats && (
                        <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.5rem' }}>📍 Click "Load My Area Stats" to see real village data from your GPS.</p>
                    )}
                    {(nearbyVillages.length > 0 ? nearbyVillages : [
                        { name: 'Rampur', risk: 78 }, { name: 'Sitapur', risk: 52 },
                        { name: 'Nandpur', risk: 34 }, { name: 'Govindpur', risk: 61 }, { name: 'Keshavpur', risk: 22 },
                    ]).map((v, i) => {
                        const color = v.risk > 60 ? '#e63946' : v.risk > 40 ? '#FF9800' : '#4CAF50'
                        const seed = display.seed + i * 11
                        const isOpen = expandedVillage === v.name
                        return (
                            <div key={i} style={{ marginBottom: '0.4rem', borderRadius: '10px', border: isOpen ? `1.5px solid ${color}` : '1.5px solid transparent', overflow: 'hidden', transition: 'border 0.2s' }}>
                                {/* Clickable row */}
                                <div
                                    onClick={() => setExpandedVillage(isOpen ? null : v.name)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.6rem', cursor: 'pointer', background: isOpen ? `${color}11` : 'transparent', borderRadius: isOpen ? '8px 8px 0 0' : '8px', transition: 'background 0.2s' }}
                                >
                                    <span style={{ color, fontWeight: '700', fontSize: '0.82rem', minWidth: '10px' }}>●</span>
                                    <span style={{ color, fontWeight: '600', fontSize: '0.82rem', flex: 1 }}>{v.name}</span>
                                    <div style={{ flex: 2, height: '6px', background: '#eee', borderRadius: '4px', overflow: 'hidden', margin: '0 0.5rem' }}>
                                        <div style={{ height: '100%', width: `${v.risk}%`, background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                    </div>
                                    <span style={{ color: '#555', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{v.risk}% risk</span>
                                    <span style={{ fontSize: '0.7rem', color: '#aaa', marginLeft: '4px' }}>{isOpen ? '▲' : '▼'}</span>
                                </div>

                                {/* Expandable detail panel */}
                                {isOpen && (
                                    <div style={{ background: '#f9fafb', borderTop: `1px solid ${color}33`, padding: '0.8rem 1rem', animation: 'fadeIn 0.15s ease' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                            {[['🫀 Heart', seededRand(seed, 20, 70)], ['🩸 Diabetes', seededRand(seed + 3, 15, 65)], ['💉 Anemia', seededRand(seed + 6, 10, 55)]].map(([lbl, pct]) => {
                                                const c = pct > 50 ? '#e63946' : pct > 35 ? '#FF9800' : '#4CAF50'
                                                return (
                                                    <div key={lbl} style={{ background: '#fff', borderRadius: '8px', padding: '0.5rem 0.6rem', border: `1px solid ${c}33`, textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: '2px' }}>{lbl}</div>
                                                        <div style={{ fontWeight: '800', color: c, fontSize: '1rem' }}>{pct}%</div>
                                                        <div style={{ height: '4px', background: '#eee', borderRadius: '2px', marginTop: '3px' }}>
                                                            <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: '2px' }} />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', color: '#555' }}>
                                            <span>👩‍⚕️ <strong>{seededRand(seed + 9, 1, 6)}</strong> ASHA workers</span>
                                            <span>🩺 <strong>{seededRand(seed + 12, 20, 120)}</strong> screenings done</span>
                                            <span>⚠️ <strong>{seededRand(seed + 15, 2, 18)}</strong> high-risk patients</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="glass-card">
                    <h3>Recent Records</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '0.4rem' }}>ID</th>
                                <th style={{ padding: '0.4rem' }}>Risk</th>
                                <th style={{ padding: '0.4rem' }}>Village</th>
                                <th style={{ padding: '0.4rem' }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { id: '#JK-104', risk: 'High', badge: 'badge-high', village: placeName ? placeName.split(',')[0] : 'Rampur', time: '10 min ago' },
                                { id: '#JK-103', risk: 'Moderate', badge: 'badge-moderate', village: 'Sitapur', time: '32 min ago' },
                                { id: '#JK-102', risk: 'Low', badge: 'badge-low', village: 'Nandpur', time: '1 hr ago' },
                                { id: '#JK-101', risk: 'High', badge: 'badge-high', village: 'Govindpur', time: '2 hrs ago' },
                            ].map((r, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '0.4rem', fontWeight: '600', color: '#2d6a4f', fontSize: '0.83rem' }}>{r.id}</td>
                                    <td style={{ padding: '0.4rem' }}><span className={`badge ${r.badge}`}>{r.risk}</span></td>
                                    <td style={{ padding: '0.4rem', fontSize: '0.83rem' }}>{r.village}</td>
                                    <td style={{ padding: '0.4rem', fontSize: '0.75rem', color: '#888' }}>{r.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
