import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { Link, useParams } from 'react-router'
import { api, getErrorMessage } from '../../../api'
import { getScoreLevel } from '../score'
import CountUp from '../../../components/reactbits/CountUp'
import ShinyText from '../../../components/reactbits/ShinyText'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

const PRINT_STYLES = `@page { size: A4; margin: 15mm; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`

// No allow-scripts: the HTML comes from the AI and must not run code.
const printHtml = (html, title) => {
    const iframe = document.createElement("iframe")
    iframe.setAttribute("sandbox", "allow-same-origin allow-modals")
    iframe.style.cssText = "position: fixed; width: 0; height: 0; border: 0; visibility: hidden;"
    iframe.onload = () => {
        const doc = iframe.contentDocument
        doc.title = title
        const style = doc.createElement("style")
        style.textContent = PRINT_STYLES
        doc.head.appendChild(style)

        const previousTitle = document.title
        document.title = title
        iframe.contentWindow.addEventListener("afterprint", () => {
            document.title = previousTitle
            iframe.remove()
        })
        iframe.contentWindow.print()
    }
    iframe.srcdoc = html
    document.body.appendChild(iframe)
}

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <button className='q-card__header' onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <span className='q-card__index'>Q{index + 1}</span>
                <span className='q-card__question'>{item.question}</span>
                <span className='q-card__chevron'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </button>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const QuestionSection = ({ title, questions }) => (
    <section>
        <div className='content-header'>
            <h2>{title}</h2>
            <span className='content-header__count'>{questions.length} questions</span>
        </div>
        <div className='q-list'>
            {questions.map((q, i) => (
                <QuestionCard key={i} item={q} index={i} />
            ))}
        </div>
    </section>
)

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { interviewId } = useParams()
    const [ result, setResult ] = useState({ id: null, report: null, error: "" })
    const [ downloading, setDownloading ] = useState(false)

    useEffect(() => {
        let ignore = false
        api.get(`/api/interview/report/${interviewId}`)
            .then((res) => { if (!ignore) setResult({ id: interviewId, report: res.data.interviewReport, error: "" }) })
            .catch((err) => { if (!ignore) setResult({ id: interviewId, report: null, error: getErrorMessage(err) }) })
        return () => { ignore = true }
    }, [ interviewId ])

    const downloadResume = async () => {
        setDownloading(true)
        try {
            const res = await api.post(`/api/interview/resume/${interviewId}`)
            printHtml(res.data.html, `Resume - ${result.report.title}`)
        } catch {
            alert("Could not generate the resume. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    const { report, error } = result.id === interviewId ? result : {}

    if (error) {
        return (
            <main className='loading-screen'>
                <h1>{error}</h1>
                <Link to='/' className='button ghost-button'>Back to home</Link>
            </main>
        )
    }

    if (!report) {
        return (
            <main className='loading-screen'>
                <div className='spinner' />
                <h1><ShinyText text="Loading your interview plan..." color="#7d8590" shineColor="#ffffff" speed={2.5} /></h1>
            </main>
        )
    }

    const score = getScoreLevel(report.matchScore)

    return (
        <div className='interview-page'>
            <header className='report-header'>
                <div className='report-header__info'>
                    <Link to='/' className='report-header__back'>&larr; All plans</Link>
                    <h1>{report.title}</h1>
                    <p>Generated on {new Date(report.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button onClick={downloadResume} disabled={downloading} className='button primary-button'>
                    {downloading
                        ? <span className='spinner spinner--small' />
                        : <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
                    {downloading ? "Generating resume..." : "Download Tailored Resume"}
                </button>
            </header>

            <div className='interview-layout'>

                <nav className='interview-nav' aria-label='Report sections'>
                    <p className='interview-nav__label'>Sections</p>
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                            onClick={() => setActiveNav(item.id)}
                            aria-current={activeNav === item.id}
                        >
                            <span className='interview-nav__icon'>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <QuestionSection title='Technical Questions' questions={report.technicalQuestions} />
                    )}

                    {activeNav === 'behavioral' && (
                        <QuestionSection title='Behavioral Questions' questions={report.behavioralQuestions} />
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day, i) => (
                                    <RoadMapDay key={i} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <aside className='interview-sidebar'>
                    <div className='match-score'>
                        <p className='sidebar-label'>Match Score</p>
                        <div
                            className={`match-score__ring score--${score.level}`}
                            style={{ '--score': report.matchScore }}>
                            <span className='match-score__value'>
                                <CountUp to={report.matchScore} duration={1.4} />
                                <small>%</small>
                            </span>
                        </div>
                        <p className={`match-score__sub score--${score.level}`}>{score.label}</p>
                    </div>

                    <div className='skill-gaps'>
                        <p className='sidebar-label'>Skill Gaps</p>
                        {report.skillGaps.length > 0 ? (
                            <div className='skill-gaps__list'>
                                {report.skillGaps.map((gap, i) => (
                                    <span key={i} className={`skill-tag skill-tag--${gap.severity}`} title={`${gap.severity} priority`}>
                                        {gap.skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className='skill-gaps__empty'>No major skill gaps found.</p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Interview
