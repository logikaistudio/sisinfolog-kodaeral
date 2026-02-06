import { useState } from 'react'

function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Gunakan URL relatif agar lewat proxy Vite (atau full URL jika production)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login gagal');
            }

            // Login berhasil
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            onLogin(data.user); // Pass full user object to App component

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Terjadi kesalahan pada server');
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #001f3f 0%, #003366 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Branding Section (Outside Card) */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }} className="fade-in">
                <div style={{
                    width: '145px', // Diperbesar ~20%
                    height: '145px',
                    margin: '0 auto 24px auto',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}>
                    <img src="/logo.png" alt="Sisinfolog Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: '800',
                    margin: '0 0 12px 0',
                    letterSpacing: '-1px',
                    color: '#ffffff',
                    textShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                    Sisinfolog
                </h1>
                <p style={{
                    margin: 0,
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                    letterSpacing: '1px'
                }}>
                    SISTEM INFORMASI LOGISTIK<br />KODAERAL 3 JAKARTA
                </p>
            </div>

            {/* Login Card (Form) */}
            <div className="login-card slide-up" style={{
                background: 'rgba(0, 135, 189, 0.8)', // #0087BD 80%
                backdropFilter: 'blur(12px)',
                padding: '40px',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animationDelay: '0.1s'
            }}>
                <h2 style={{
                    margin: '0 0 24px 0',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: '700',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    Akses Masuk
                </h2>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '700',
                            marginBottom: '8px',
                            color: 'rgba(255, 255, 255, 1)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.15)',
                                color: 'white',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            className="input-placeholder-white"
                            onFocus={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.25)'
                                e.target.style.borderColor = 'white'
                            }}
                            onBlur={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '700',
                            marginBottom: '8px',
                            color: 'rgba(255, 255, 255, 1)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                background: 'rgba(255, 255, 255, 0.15)',
                                color: 'white',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            className="input-placeholder-white"
                            onFocus={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.25)'
                                e.target.style.borderColor = 'white'
                            }}
                            onBlur={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '13px',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontWeight: '500'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #003366 0%, #001f3f 100%)',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.8 : 1,
                            boxShadow: '0 4px 12px rgba(1, 31, 91, 0.3)'
                        }}
                    >
                        {loading ? 'Memproses...' : 'Masuk Aplikasi'}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '32px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '1px' }}>
                © 2026 LOGIKAI STUDIO
            </div>
        </div>
    )
}

export default Login
