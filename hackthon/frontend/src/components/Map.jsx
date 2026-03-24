import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

// Custom red icon for patient location
const patientIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

// Custom green icon for hospitals
const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

// Helper component to handle routing
function RoutingEngine({ start, end }) {
    const map = useMap()

    useEffect(() => {
        if (!map || !start || !end) return

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            lineOptions: {
                styles: [{ color: '#2d6a4f', weight: 4, opacity: 0.8 }]
            },
            createMarker: () => null, // Don't create extra markers
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            routeWhileDragging: false
        }).addTo(map)

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl)
            }
        }
    }, [map, start, end])

    return null
}

// Helper component to recenter map when location changes
function RecenterMap({ center }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.setView(center, 14)
        }
    }, [center, map])
    return null
}

function HospitalMap({ hospitals, patientLat, patientLng }) {
    const [detectedLat, setDetectedLat] = useState(null)
    const [detectedLng, setDetectedLng] = useState(null)
    const [gpsLoading, setGpsLoading] = useState(false)
    const [gpsError, setGpsError] = useState('')
    const [routingTo, setRoutingTo] = useState(null)

    // Try to get GPS from browser if not passed as props
    useEffect(() => {
        const hasPropsLocation = patientLat && patientLng && !isNaN(parseFloat(patientLat)) && !isNaN(parseFloat(patientLng))
        if (!hasPropsLocation && navigator.geolocation) {
            setGpsLoading(true)
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setDetectedLat(pos.coords.latitude)
                    setDetectedLng(pos.coords.longitude)
                    setGpsLoading(false)
                },
                () => {
                    setGpsError('GPS access denied - showing generic area.')
                    setGpsLoading(false)
                },
                { enableHighAccuracy: true, timeout: 8000 }
            )
        }
    }, [patientLat, patientLng])

    // Resolve which coordinates to use (priority: props > browser GPS > India center)
    const propLat = patientLat && !isNaN(parseFloat(patientLat)) ? parseFloat(patientLat) : null
    const propLng = patientLng && !isNaN(parseFloat(patientLng)) ? parseFloat(patientLng) : null

    const lat = propLat ?? detectedLat ?? 20.5937
    const lng = propLng ?? detectedLng ?? 78.9629
    const hasLocation = (propLat !== null) || (detectedLat !== null)

    const center = [lat, lng]

    // Nearby hospital offsets from patient location
    const hospitalLocations = [
        {
            name: hospitals?.[0]?.name || 'District Primary Health Centre',
            coords: [lat + 0.012, lng + 0.009],
            type: hospitals?.[0]?.type || 'Government',
            hours: '24/7',
            phone: hospitals?.[0]?.phone || '104',
            distance: hospitals?.[0]?.distance || '1.2 km',
        },
        {
            name: hospitals?.[1]?.name || 'Rural Health Center',
            coords: [lat - 0.008, lng + 0.015],
            type: hospitals?.[1]?.type || 'Government',
            hours: '8am - 6pm',
            phone: hospitals?.[1]?.phone || '108',
            distance: hospitals?.[1]?.distance || '2.5 km',
        },
        {
            name: hospitals?.[2]?.name || 'Sanjivani Speciality Clinic',
            coords: [lat + 0.005, lng - 0.012],
            type: hospitals?.[2]?.type || 'Private',
            hours: '9am - 9pm',
            phone: hospitals?.[2]?.phone || '112',
            distance: hospitals?.[2]?.distance || '4.0 km',
        },
    ]

    return (
        <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🗺️ Nearby Healthcare Map</h3>

            {gpsLoading && (
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.75rem' }}>
                    ⏳ Detecting your location…
                </p>
            )}
            {!gpsLoading && hasLocation && (
                <p style={{ fontSize: '0.8rem', color: '#2d6a4f', marginBottom: '0.75rem' }}>
                    📍 Showing hospitals near your location ({lat.toFixed(4)}°N, {lng.toFixed(4)}°E)
                </p>
            )}
            {!gpsLoading && !hasLocation && (
                <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.75rem' }}>
                    ⚠️ {gpsError || 'GPS not available - showing generic India view. Allow location access for accurate results.'}
                </p>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: '#555' }}>
                <span>🔴 Your Location</span>
                <span>🟢 Nearby Hospitals</span>
                <span style={{ color: '#2d6a4f', fontWeight: 'bold' }}>🛣️ Click 'Get Route' in Marker to view path</span>
            </div>

            <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden' }}>
                <MapContainer center={center} zoom={hasLocation ? 14 : 5} style={{ height: '100%', width: '100%' }}>
                    <RecenterMap center={center} />
                    {routingTo && (
                        <RoutingEngine start={center} end={routingTo} />
                    )}
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Patient's current location */}
                    {hasLocation && (
                        <>
                            <Marker position={center} icon={patientIcon}>
                                <Popup>
                                    <strong>📍 Patient's Location</strong><br />
                                    Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}<br />
                                    <span style={{ fontSize: '0.8rem', color: '#e63946' }}>🚨 Emergency Dispatch Point</span>
                                </Popup>
                            </Marker>
                            {!routingTo && (
                                <Circle
                                    center={center}
                                    radius={1500}
                                    pathOptions={{ color: '#2d6a4f', fillColor: '#74c69d', fillOpacity: 0.15 }}
                                />
                            )}
                        </>
                    )}

                    {/* Nearby hospitals - always shown */}
                    {hospitalLocations.map((loc, i) => (
                        <Marker key={i} position={loc.coords} icon={hospitalIcon}>
                            <Popup>
                                <div style={{ minWidth: '150px' }}>
                                    <strong style={{ fontSize: '1rem' }}>🏥 {loc.name}</strong><br />
                                    <span style={{ fontSize: '0.85rem' }}>
                                        Type: {loc.type}<br />
                                        Hours: {loc.hours}<br />
                                        Distance: {loc.distance}<br />
                                        📞 {loc.phone}
                                    </span>
                                    <div style={{ marginTop: '0.8rem' }}>
                                        <button
                                            onClick={() => setRoutingTo(loc.coords)}
                                            style={{
                                                background: '#2d6a4f',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 0.8rem',
                                                borderRadius: '6px',
                                                width: '100%',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            🚀 Show Route
                                        </button>
                                        {routingTo && routingTo === loc.coords && (
                                            <button
                                                onClick={() => setRoutingTo(null)}
                                                style={{
                                                    background: '#e63946',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '6px',
                                                    width: '100%',
                                                    marginTop: '0.4rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                ❌ Clear Route
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    )
}

export default HospitalMap
