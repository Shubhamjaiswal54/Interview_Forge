import React, { useState } from 'react'
import { Navigate, Link } from 'react-router'
import { useAuth } from '../useAuth'
import { api, getErrorMessage } from '../../../api'
import AuthLayout from '../components/AuthLayout'

const Login = () => {

    const { user, setUser } = useAuth()
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await api.post("/api/auth/login", { email, password })
            setUser(res.data.user)
        } catch (err) {
            setError(getErrorMessage(err))
            setLoading(false)
        }
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to continue preparing for your next interview."
            footer={<>Don't have an account? <Link to="/register">Create one</Link></>}>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        value={email}
                        onChange={(e) => { setEmail(e.target.value) }}
                        type="email" id="email" name='email' placeholder='you@example.com'
                        autoComplete="email" required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }}
                        type="password" id="password" name='password' placeholder='Enter your password'
                        autoComplete="current-password" required />
                </div>

                {error && <p className="alert alert--error" role="alert">{error}</p>}

                <button className='button primary-button' disabled={loading}>
                    {loading && <span className="spinner spinner--small" />}
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </form>
        </AuthLayout>
    )
}

export default Login
