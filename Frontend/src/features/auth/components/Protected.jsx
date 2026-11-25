import { Navigate } from "react-router"
import { useAuth } from "../useAuth"
import Navbar from "../../../components/Navbar"

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main className="loading-screen loading-screen--full">
                <div className="spinner" />
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default Protected
