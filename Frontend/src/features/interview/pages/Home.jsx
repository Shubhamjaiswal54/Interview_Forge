import React, { useState, useEffect } from 'react'
import "../style/home.scss"
import { Link, useNavigate } from 'react-router'
import { api, getErrorMessage } from '../../../api'
import { getScoreLevel } from '../score'
import Aurora from '../../../components/reactbits/Aurora'
import BlurText from '../../../components/reactbits/BlurText'
import ShinyText from '../../../components/reactbits/ShinyText'
import SpotlightCard from '../../../components/reactbits/SpotlightCard'
import { spotlightProps } from '../../../components/spotlight'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_JOB_DESCRIPTION = 5000

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

const Home = () => {

    const [ reports, setReports ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState("")
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ dragging, setDragging ] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        api.get("/api/interview/")
            .then((res) => setReports(res.data.interviewReports))
            .catch((err) => setError(getErrorMessage(err)))
    }, [])

    const selectFile = (file) => {
        if (!file) return
        if (file.type !== "application/pdf") {
            return setError("Resume must be a PDF file.")
        }
        if (file.size > MAX_FILE_SIZE) {
            return setError("Resume must be smaller than 5MB.")
        }
        setError("")
        setResumeFile(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        selectFile(e.dataTransfer.files[ 0 ])
    }

    const handleGenerateReport = async () => {
        if (!jobDescription.trim()) {
            return setError("Please paste the job description.")
        }
        if (!resumeFile && !selfDescription.trim()) {
            return setError("Please upload a resume or write a self description.")
        }

        const formData = new FormData()
        formData.append("jobDescription", jobDescription)
        formData.append("selfDescription", selfDescription)
        if (resumeFile) {
            formData.append("resume", resumeFile)
        }

        setLoading(true)
        setError("")
        try {
            const res = await api.post("/api/interview/", formData)
            navigate(`/interview/${res.data.interviewReport._id}`)
        } catch (err) {
            setError(getErrorMessage(err))
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className="spinner" />
                <h1><ShinyText text="Building your interview plan..." color="#7d8590" shineColor="#ffffff" speed={2.5} /></h1>
                <p>Analyzing your profile against the job. This usually takes about 30 seconds.</p>
            </main>
        )
    }

    return (
        <div className='home-page'>
            <Aurora
                className='home-page__aurora'
                colorStops={[ '#ff2d78', '#7c3aed', '#ff2d78' ]}
                amplitude={0.9}
                speed={0.5}
                opacity={0.45}
                mouseInteraction={false}
            />

            <header className='page-header'>
                <div className='page-header__title' role='heading' aria-level={1}>
                    <BlurText text='Create Your Custom' delay={120} />
                    <BlurText text='Interview Plan' delay={120} className='highlight' />
                </div>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2><label htmlFor='jobDescription'>Target Job Description</label></h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <div className='panel__textarea-wrap'>
                            <textarea
                                id='jobDescription'
                                value={jobDescription}
                                onChange={(e) => { setJobDescription(e.target.value) }}
                                className='panel__textarea'
                                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                                maxLength={MAX_JOB_DESCRIPTION}
                            />
                            <div className='char-counter'>{jobDescription.length} / {MAX_JOB_DESCRIPTION}</div>
                        </div>
                    </div>

                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        <div className='upload-section'>
                            <span className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </span>

                            {resumeFile ? (
                                <div className='file-chip'>
                                    <span className='file-chip__icon'>PDF</span>
                                    <div className='file-chip__info'>
                                        <p className='file-chip__name'>{resumeFile.name}</p>
                                        <p className='file-chip__size'>{formatSize(resumeFile.size)}</p>
                                    </div>
                                    <button
                                        type='button'
                                        className='file-chip__remove'
                                        onClick={() => setResumeFile(null)}
                                        aria-label='Remove resume'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <label
                                    className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
                                    htmlFor='resume'
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={handleDrop}>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    </span>
                                    <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                    <p className='dropzone__subtitle'>PDF (Max 5MB)</p>
                                    <input
                                        hidden type='file' id='resume' name='resume' accept='.pdf,application/pdf'
                                        onChange={(e) => { selectFile(e.target.files[ 0 ]); e.target.value = "" }} />
                                </label>
                            )}
                        </div>

                        <div className='or-divider'><span>AND / OR</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                <div className='interview-card__footer'>
                    {error
                        ? <p className='alert alert--error' role='alert'>{error}</p>
                        : <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>}
                    <button onClick={handleGenerateReport} className='button primary-button generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id}>
                                <SpotlightCard className='report-item' spotlightSize={200} {...spotlightProps}>
                                    <Link to={`/interview/${report._id}`} className='report-item__link'>
                                        <h3>{report.title || 'Untitled Position'}</h3>
                                        <p className='report-item__meta'>{new Date(report.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        <span className={`report-item__score score--${getScoreLevel(report.matchScore).level}`}>
                                            {report.matchScore}% match
                                        </span>
                                    </Link>
                                </SpotlightCard>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

export default Home
