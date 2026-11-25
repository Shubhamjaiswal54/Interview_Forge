import React, { useState } from 'react'
import { Navigate, Link } from 'react-router'
import { useAuth } from '../useAuth'
import { api, getErrorMessage } from '../../../api'
import AuthLayout from '../components/AuthLayout'

const Register = () => {

    const { user, setUser } = useAuth()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await api.post("/api/auth/register", { username, email, password })
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
            title="Create your account"
            subtitle="Get a personalized interview plan in under a minute."
            footer={<>Already have an account? <Link to="/login">Log in</Link></>}>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        value={username}
                        onChange={(e) => { setUsername(e.target.value) }}
                        type="text" id="username" name='username' placeholder='Choose a username'
                        autoComplete="username" required />
                </div>
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
                        type="password" id="password" name='password' placeholder='Create a password'
                        autoComplete="new-password" required />
                </div>

                {error && <p className="alert alert--error" role="alert">{error}</p>}

                <button className='button primary-button' disabled={loading}>
                    {loading && <span className="spinner spinner--small" />}
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>
        </AuthLayout>
    )
}

export default Register
