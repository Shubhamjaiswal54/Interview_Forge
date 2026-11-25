import { Link } from "react-router"
import { useAuth } from "../features/auth/useAuth"
import { api } from "../api"

const Navbar = () => {
    const { user, setUser } = useAuth()

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout")
        } finally {
            setUser(null)
        }
    }

    return (
        <header className="navbar">
            <Link to="/" className="navbar__brand">
                <span className="navbar__logo">AI</span>
                <span>Interview<span className="highlight">AI</span></span>
            </Link>

            <div className="navbar__actions">
                <span className="navbar__user">{user.username}</span>
                <button onClick={handleLogout} className="button ghost-button navbar__logout">
                    Log out
                </button>
            </div>
        </header>
    )
}

export default Navbar
