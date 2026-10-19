import { useRef, useState } from "react";
import { useInterview } from "../hooks/useInterview";
import "../style/home.scss";
import { useNavigate } from "react-router";
const Home = () => {
  const { loading, generateReport, reports = [] } = useInterview();
  console.log("Reports received in Home:", reports);
  console.log("Number of reports:", reports.length);
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef();

  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0];
    const data = await generateReport({
      jobDescription,
      selfDescription,
      resumeFile,
    });
    navigate(`/interview/${data._id}`);
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <h1>Loading your interview plan..</h1>
      </main>
    );
  }

  return (
    <main className="home">
      <div className="home-container">
        {/* Header */}
        <header className="home-header">
          <h1>
            Create Your Custom <span>Interview Plan</span>
          </h1>
          <p>
            Let our AI analyze the job requirements and your unique profile to{" "}
            <br className="desktop-break" /> build a winning strategy
          </p>
          <h3>Scroll to get started</h3>
        </header>
        {/* Main Form Card */}
        <section className="interview-card">
          <div className="form-conatiner">
            {/* Left Column */}
            <div className="job-section">
              <div className="section-heading">
                <h2>
                  <span className="heading-icon">▣</span>
                  Target Job Description
                </h2>
                <span className="badge required-badge">REQUIRED</span>
              </div>
              <textarea
                onChange={(e) => setJobDescription(e.target.value)}
                className="job-description"
                name="jobDescription"
                id="jobDescription"
                maxLength={5000}
                placeholder={`Paste the full job description here...
e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
              ></textarea>
              <div className="char-count">0 / 5000</div>
            </div>
            {/* Right Column */}
            <div className="profile-section">
              <div className="section-heading profile-heading">
                <h2>
                  <span className="heading-icon">♙</span>
                  Your Profile
                </h2>
              </div>
              {/* Resume Upload */}
              <div className="resume-section">
                <div className="field-heading">
                  <label htmlFor="resume">Upload Resume</label>
                  <span className="badge best-badge">BEST RESULTS</span>
                </div>
                <label className="upload-box" htmlFor="resume">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf"
                    hidden
                  />
                  <span className="upload-icon">⇧</span>
                  <span className="upload-title">
                    Click to upload or drag &amp; drop
                  </span>
                  <span className="upload-subtitle">PDF or DOCX (Max 5MB)</span>
                </label>
              </div>
              {/* Divider */}
              <div className="or-devider">
                <span></span>
                <p>OR</p>
                <span></span>
              </div>
              {/* Self Description */}
              <div className="description-section">
                <label htmlFor="selfDescription">Quick Self-Desctription</label>
                <textarea
                  onChange={(e) => {
                    setSelfDescription(e.target.value);
                  }}
                  name="selfDescription"
                  id="selfDescription"
                  placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                ></textarea>
              </div>
              {/* Information Message */}
              <div className="info-box">
                <div className="info-icon">●</div>
                <p>
                  {" "}
                  Either a <strong>Resume</strong> or a{" "}
                  <strong>Self Description</strong> is required to generate a
                  personalized plan.
                </p>
              </div>
            </div>
          </div>
          <footer className="form-footer">
            <p>AI-Powered Strategy Generation</p>
            <button
              onClick={handleGenerateReport}
              type="button"
              className="generate-btn"
            >
              <span>★</span>
              Generate My Interview Strategy
            </button>
          </footer>
        </section>
        {/* Recent report List*/}
        {reports.length > 0 && (
          <section className="recent-reports">
            <h2>My Recent Interview Plans</h2>
            <ul className="reports-list">
              {reports.map((report) => (
                <li
                  key={report._id}
                  className="report-item"
                  onClick={() => navigate(`/interview/${report._id}`)}
                >
                  <h3>{report.title || "Untitled Position"}</h3>
                  <p className="report-meta">
                    Generated on{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  <p
                    className={`match-score ${report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low"}`}
                  >
                    Match Score: {report.matchScore}%
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* footer */}
        <footer className="page-footer">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Services</a>
          <a href="#">Help Center</a>
        </footer>
      </div>
    </main>
  );
};
export default Home;
