import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CricketFight.css";
import {
  FaChevronLeft,
  FaTrophy,
  FaBookOpen,
  FaQuestionCircle,
} from "react-icons/fa";
import { FaVolumeUp } from "react-icons/fa";


const CricketFight = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [rules, setRules] = useState([]);
  const [steps, setSteps] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [loading, setLoading] = useState(true);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);


  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const res = await fetch(
          "https://zplay1.in/api/fantasycricket/get-setup-data"
        );
        const data = await res.json();
        if (data?.data) {
          setBanners(data.data.banner_images || []);
          setRules(data.data.rules || []);
          setSteps(data.data.steps || []);
          
        }
      } catch (error) {
        console.error("Error fetching setup data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSetupData();
  }, []);


  const speakRules = (text) => {
  if (!text) return;

  const synth = window.speechSynthesis;
  if (synth.speaking) {
    synth.cancel(); // Stop current speech
    setIsSpeaking(false);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);

  synth.speak(utterance);
};

  // Language mapping
  const languageMap = {
    English: "english",
    Kannada: "kannda",
    Telugu: "telugu",
    Hindi: "hindhi",
    Gujarati: "gujrati",
  };

  const currentRule = rules.find(
    (r) =>
      r.language?.toLowerCase() ===
      languageMap[selectedLanguage]?.toLowerCase()
  );

  const currentStep = steps[activeStep - 1];

  return (
    <div className="cf-page">
      {/* Header */}
      <header className="cf-header">
        <button className="backBtn" onClick={() => navigate(-1)}>
          <FaChevronLeft size={20} />
        </button>
        <h3>Cricket Fight</h3>
      </header>

      {/* Banners */}
      <div className="cf-banners">
        {banners.length > 0 ? (
          banners.map((banner) => (
            <img
              key={banner.id}
              src={banner.logo}
              alt={banner.title}
              title={banner.title}
            />
          ))
        ) : (
          <p className="loading-text">Loading banners...</p>
        )}
      </div>

      {/* All Match Title + Buttons */}
      <div className="cf-top-section">
        <h4 className="cf-title">All Match</h4>
        <div className="cf-top-buttons">
          <button className="btn">
            <FaTrophy className="btn-icon" /> My Contests
          </button>
          <button className="btn" onClick={() => setShowRulesModal(true)}>
            <FaBookOpen className="btn-icon" /> Rules
          </button>
          <button
  className="btn"
  onClick={() => {
    setShowHowToPlay(true);
    setActiveStep(1); // ✅ ensures Step 1 active
  }}
>
  <FaQuestionCircle className="btn-icon" /> How to Play
</button>
        </div>
      </div>

      {/* 🟢 Rules Modal */}
      {showRulesModal && (
        <div
          className="rules-modal-overlay"
          onClick={() => setShowRulesModal(false)}
        >
          <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rules</h3>
              <button
                className="close-btn"
                onClick={() => setShowRulesModal(false)}
              >
                ×
              </button>
            </div>

            <div className="language-tabs">
              {Object.keys(languageMap).map((lang) => (
                <button
                  key={lang}
                  className={`lang-btn ${
                    selectedLanguage === lang ? "active" : ""
                  }`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="rule-content">
              {loading ? (
                <p>Loading rules...</p>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentRule
                      ? currentRule.steps
                      : "<p>No data available</p>",
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 How to Play Modal */}
{showHowToPlay && (
  <div
    className="rules-modal-overlay"
    onClick={() => setShowHowToPlay(false)}
  >
    <div className="howto-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>How to Play</h3>
        <button
          className="close-btn"
          onClick={() => setShowHowToPlay(false)}
        >
          ×
        </button>
      </div>

      <div className="howto-body">
        <h4>How To Play</h4>

        {/* Step Navigation with connecting lines */}
<div className="stepper">
  {steps.length > 0 &&
    steps.map((step, i) => (
      <React.Fragment key={step.id || i}>
        <div
          className={`step ${activeStep === i + 1 ? "active" : ""}`}
          onClick={() => setActiveStep(i + 1)}
        >
          <div className="circle">{i + 1}</div>
          <p>{step.title}</p>
        </div>

        {/* Connector Line (except after last step) */}
        {i < steps.length - 1 && (
          <div
            className={`connector ${
              activeStep > i + 1 ? "filled" : ""
            }`}
          ></div>
        )}
      </React.Fragment>
    ))}
</div>

        {/* Step Image */}
        <div className="step-image">
          {activeStep === 1 ? (
            // ✅ Custom image for Step 1
            <img src="/images/howto_step1.png" alt="Step 1" />
          ) : steps.length > 0 && steps[activeStep - 1] ? (
            // ✅ Safe render for other steps
            <img
              src={steps[activeStep - 1].logo}
              alt={steps[activeStep - 1].title}
            />
          ) : (
            <p>Loading step...</p>
          )}
        </div>

        <p style={{ color: "#746969" }}>
          Please select a match from the provided list.
        </p>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default CricketFight;
