import React, { useState } from 'react'

function ScreeningTool({ onPredict, loading, onCancel, t }) {
    const [formData, setFormData] = useState({
        age: '',
        weight: '',
        systolic: '',
        diastolic: '',
        glucose: '',
        hemoglobin: '',
        lat: '',
        lng: ''
    })

    const fetchLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData(prev => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(4),
                    lng: position.coords.longitude.toFixed(4)
                }))
            })
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onPredict(formData)
    }

    return (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>{t.start_screening}</h2>
            <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>{t.patient_metrics}</p>

            <form onSubmit={handleSubmit}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                        <label>{t.age}</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="Years" />
                    </div>
                    <div className="form-group">
                        <label>{t.weight || 'Weight (kg)'}</label>
                        <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} required placeholder="kg" />
                    </div>
                    <div className="form-group">
                        <label>{t.systolic}</label>
                        <input type="number" name="systolic" value={formData.systolic} onChange={handleChange} required placeholder="mmHg" />
                    </div>
                    <div className="form-group">
                        <label>{t.diastolic}</label>
                        <input type="number" name="diastolic" value={formData.diastolic} onChange={handleChange} required placeholder="mmHg" />
                    </div>
                    <div className="form-group">
                        <label>{t.glucose}</label>
                        <input type="number" name="glucose" value={formData.glucose} onChange={handleChange} required placeholder="mg/dL" />
                    </div>
                    <div className="form-group">
                        <label>{t.hemoglobin}</label>
                        <input type="number" step="0.1" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} required placeholder="g/dL" />
                    </div>
                </div>

                <div className="form-group">
                    <button type="button" onClick={fetchLocation} className="btn" style={{ background: '#6c757d', marginBottom: '1rem', width: '100%' }}>
                        📍 {formData.lat ? `Location Fixed: ${formData.lat}, ${formData.lng}` : 'Get Current GPS Location'}
                    </button>
                </div>

                <div style={{ background: 'rgba(45, 106, 79, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    🛡️ <strong>Privacy First:</strong> No Aadhaar required. Minimal patient data collected. Encrypted locally before sync.
                    <label style={{ display: 'block', marginTop: '10px', fontSize: '0.8rem' }}>
                        <input type="checkbox" /> Enable Offline Sync (SMS Alert Mode)
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn" disabled={loading} style={{ flex: 2 }}>
                        {loading ? t.analyzing : t.generate_profile}
                    </button>
                    <button type="button" onClick={onCancel} className="btn" style={{ flex: 1, background: '#ccc' }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ScreeningTool
