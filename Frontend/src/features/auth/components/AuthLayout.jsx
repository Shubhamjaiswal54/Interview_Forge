import Aurora from "../../../components/reactbits/Aurora"
import SpotlightCard from "../../../components/reactbits/SpotlightCard"
import { spotlightProps } from "../../../components/spotlight"
import "../auth.form.scss"

const AuthLayout = ({ title, subtitle, footer, children }) => (
    <main className="auth-page">
        <Aurora
            className="auth-page__aurora"
            colorStops={[ '#ff2d78', '#7c3aed', '#ff2d78' ]}
            amplitude={1.1}
            speed={0.6}
            opacity={0.7}
        />
        <SpotlightCard className="auth-card" {...spotlightProps}>
            <div className="auth-card__header">
                <span className="auth-card__brand">Interview AI</span>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>
            {children}
            <p className="auth-card__footer">{footer}</p>
        </SpotlightCard>
    </main>
)

export default AuthLayout
