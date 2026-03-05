import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Zap, Brain, Clock, BarChart3, FileText, Settings, Download,
  CheckCircle2, XCircle, Shield, Users,
  LayoutDashboard, Fingerprint, Waves, Cpu, Plus, Minus, RefreshCw, ArrowLeft
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { EventSourcePolyfill } from 'event-source-polyfill';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import Lenis from 'lenis';
import 'hammerjs';

// Assets
import video1 from './assets/videos/1. Digital Brain Diagnostics.mp4';
import video2 from './assets/videos/Neural Interface Simulation.mp4';
import video3 from './assets/videos/Microscopic Neuronal Activity.mp4';
import video4 from './assets/videos/Brain & Neural Network Overview.mp4';
import researchPaper from './assets/Report/New_Paper___MIDAS___Final_Draft copy.pdf';

ChartJS.register(...registerables, annotationPlugin, zoomPlugin);

// CONFIG: Update this with your Ngrok URL from Colab
const API_BASE = import.meta.env.VITE_API_BASE || "https://a934-35-221-183-101.ngrok-free.app";
const api = axios.create({
  baseURL: API_BASE,
  headers: { "ngrok-skip-browser-warning": "true" }
});

const App = () => {
  const [view, setView] = useState('landing'); // landing, dashboard
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');

  // Real-time Intelligence State
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [intelligence, setIntelligence] = useState({
    state: 'IDLE',
    time: '0.0s',
    wave: new Array(150).fill(0),
    metrics: { entropy: 0, entanglement: 0, fisher_info: 0, energy_flux: 0 },
    probs: [1, 0, 0, 0] // Normal, Preictal, Ictal, Interictal
  });
  const [history, setHistory] = useState([]);
  const [syncStarting, setSyncStarting] = useState(false);

  const [zoomedChart, setZoomedChart] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);

  const sseRef = useRef(null);
  const modalChartRef = useRef(null);
  // Grid chart refs — must be declared individually (Rules of Hooks)
  const gRef0 = useRef(null); const gRef1 = useRef(null);
  const gRef2 = useRef(null); const gRef3 = useRef(null);
  const gRef4 = useRef(null); const gRef5 = useRef(null);
  const gRef6 = useRef(null); const gRef7 = useRef(null);
  const gRef8 = useRef(null); const gRef9 = useRef(null);
  const gRef10 = useRef(null); const gRef11 = useRef(null);
  const gRef12 = useRef(null); const gRef13 = useRef(null);
  const gRef14 = useRef(null); const gRef15 = useRef(null);
  const gRef16 = useRef(null); const gRef17 = useRef(null);
  const gRef18 = useRef(null); const gRef19 = useRef(null);
  const gRef20 = useRef(null); const gRef21 = useRef(null);
  const gRef22 = useRef(null); const gRef23 = useRef(null);
  const gridRefs = [
    gRef0, gRef1, gRef2, gRef3, gRef4, gRef5, gRef6, gRef7,
    gRef8, gRef9, gRef10, gRef11, gRef12, gRef13, gRef14, gRef15,
    gRef16, gRef17, gRef18, gRef19, gRef20, gRef21, gRef22, gRef23
  ];

  // Initial Sync & Smooth Scroll Setup
  useEffect(() => {
    // Lenis Smooth Scroll
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    api.get("/patients")
      .then(res => setPatients(res.data))
      .catch(() => console.log("System Offline"));

    return () => lenis.destroy();
  }, []);

  const enterDashboard = () => setView('dashboard');
  const goHome = () => setView('landing');

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setModelStatus('checking');
    setPatientDetails(null);
    setSelectedFile('');
    setIsRunning(false);
    setAnalysisData(null);

    if (sseRef.current) sseRef.current.close();

    try {
      const [modelRes, detailRes] = await Promise.all([
        api.get(`/check_model/${patient.id}`),
        api.get(`/patient_details/${patient.id}`)
      ]);

      setModelStatus(modelRes.data.exists ? 'exists' : 'missing');
      setPatientDetails(detailRes.data);
    } catch (e) {
      console.error("Patient Data Sync Failed:", e);
      setModelStatus('missing');
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisData(null);
    setAiReport(null);
    try {
      const res = await api.get(`/analysis?patient_id=${selectedPatient.id}&file_name=${selectedFile}`);
      setAnalysisData(res.data);
    } catch (e) {
      alert("Analysis failed. Check backend connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const consultAI = async () => {
    if (!analysisData) return;
    setIsConsulting(true);
    try {
      const res = await api.post('/ai_consultation', {
        patient_id: selectedPatient.id,
        file_name: selectedFile,
        features: analysisData
      });
      setAiReport(res.data.report);
    } catch (e) {
      setAiReport("Consultation channel disrupted. Ensure backend is running.");
    } finally {
      setIsConsulting(false);
    }
  };

  const startQuantumSync = () => {
    if (sseRef.current) sseRef.current.close();
    setHistory([]);
    setIntelligence(prev => ({ ...prev, state: 'INITIALIZING' }));
    setIsRunning(true);
    setSyncStarting(true);

    // Auto-hide the initial intro after 4 seconds to show predictions
    setTimeout(() => setSyncStarting(false), 4000);

    const url = `${API_BASE}/stream_inference?patient_id=${selectedPatient.id}&file_name=${selectedFile}`;
    sseRef.current = new EventSourcePolyfill(url, { headers: { "ngrok-skip-browser-warning": "true" } });

    sseRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setIntelligence(prev => ({
        ...prev,
        state: data.state,
        time: data.time,
        wave: [...prev.wave, ...data.wave].slice(-150),
        metrics: data.metrics || prev.metrics,
        probs: data.probabilities || prev.probs
      }));

      if (data.state !== 'INITIALIZING' && data.state !== history[0]?.state) {
        setHistory(prev => [{ time: data.time, state: data.state }, ...prev].slice(0, 8));
      }
    };

    sseRef.current.onerror = () => {
      setIsRunning(false);
      sseRef.current.close();
    };
  };

  // Landing Navigation State
  const [landingTab, setLandingTab] = useState('home'); // home, tech, results, impact

  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-x-hidden"
          >
            {/* Background Quantum Field / Video */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <video
                autoPlay loop muted playsInline
                className="absolute w-full h-full object-cover opacity-30 scale-110"
                style={{ filter: 'hue-rotate(0deg) brightness(0.8)' }}
              >
                <source src={video4} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
            </div>

            {/* Top Navigation */}
            <nav className="z-50 h-24 flex items-center justify-between px-6 md:px-12 sticky top-0 bg-black/50 backdrop-blur-xl border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center rotate-12">
                  <Brain size={28} className="text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase font-['Syncopate'] bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]">Epileptic Seizure Detection</span>
              </div>
              <div className="hidden md:flex gap-10 items-center">
                {['home', 'tech', 'results', 'impact'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setLandingTab(tab)}
                    className={`text-sm font-black uppercase tracking-[0.2em] transition-all relative ${landingTab === tab ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
                  >
                    {tab === 'home' ? 'Overview' : tab === 'tech' ? 'The Tech' : tab === 'results' ? 'Performance' : 'Global Impact'}
                    {landingTab === tab && (
                      <motion.div layoutId="navUnderline" className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-400" />
                    )}
                  </button>
                ))}
                <div className="h-6 w-px bg-white/10 mx-2" />
                <button
                  onClick={enterDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                >
                  <LayoutDashboard size={16} /> Portal
                </button>
              </div>
              <button className="md:hidden p-3 bg-white/5 rounded-xl text-white" onClick={enterDashboard}>
                <LayoutDashboard size={24} />
              </button>
            </nav>

            <main className="flex-1 z-10 overflow-y-auto pt-20 pb-40">
              <AnimatePresence mode="wait">
                {landingTab === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="max-w-6xl mx-auto px-12"
                  >
                    <div className="text-center space-y-12">

                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="text-6xl md:text-[10rem] font-black leading-[0.85] tracking-tighter"
                      >
                        Seizure Localization <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-serif italic pb-4 block">Using</span>
                        Quantum Algorithms
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="text-gray-400 text-xl md:text-3xl max-w-5xl mx-auto leading-relaxed font-light"
                      >
                        Enhanced preictal and ictal state classification through Quantum-Inspired feature engineering .
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                        className="flex flex-col md:flex-row gap-6 justify-center pt-12"
                      >
                        <button onClick={enterDashboard} className="bg-white text-black px-16 py-7 rounded-3xl font-black text-base uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
                          Explore the Dashboard
                        </button>
                        <a
                          href={researchPaper}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/5 border border-white/10 backdrop-blur-md px-16 py-7 rounded-3xl font-black text-base uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center text-white"
                        >
                          Read Draft Paper
                        </a>
                      </motion.div>
                    </div>

                    {/* The "Why" - Problem Section */}
                    <div className="mt-60 flex flex-col md:flex-row gap-24 items-center">
                      <div className="flex-1 space-y-10">
                        <div className="text-blue-500 font-black text-sm uppercase tracking-[0.4em]">The Challenge</div>
                        <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-tight">Beyond Classical <br />Signal Analysis</h2>
                        <p className="text-gray-400 text-2xl leading-relaxed max-w-2xl">
                          Traditional EEG analysis fails to capture global signal structure and non-linear dependencies. We are trying to solve the challenge of correctly separating Pre_ictal(before Seizure) and Ictal(During Seizure) states From EEG data.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                            <div className="text-red-400 mb-2"><XCircle size={20} /></div>
                            <div className="font-bold text-sm mb-1 uppercase tracking-tighter">Patient Locking</div>
                            <div className="text-xs text-gray-500">Models usually fail on unseen patients chb21-24.</div>
                          </div>
                          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                            <div className="text-red-400 mb-2"><Waves size={20} /></div>
                            <div className="font-bold text-sm mb-1 uppercase tracking-tighter">Local Blindness</div>
                            <div className="text-xs text-gray-500">Missing global phase-space interactions.</div>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-full">
                        <div className="h-full bg-gradient-to-br from-blue-600/10 to-indigo-900/20 border border-white/10 rounded-[4rem] p-10 overflow-hidden relative group backdrop-blur-3xl shadow-[0_0_50px_rgba(37,99,235,0.1)]">
                          <video
                            autoPlay loop muted playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen transition-transform group-hover:scale-110"
                          >
                            <source src={video3} type="video/mp4" />
                          </video>

                          <div className="relative z-10 space-y-8 h-full flex flex-col">
                            <div>
                              <div className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">The Mission</div>
                              <h3 className="text-4xl font-black leading-[0.9] text-white italic tracking-tighter uppercase">
                                Closing the <br /><span className="text-blue-400">Golden Window</span>
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-2xl font-black text-white">50M+</div>
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Global Lives Affected</div>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-2xl font-black text-blue-400">80%</div>
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">In Low-Resource Areas</div>
                              </div>
                            </div>

                            <div className="flex-1 space-y-6">
                              <div className="space-y-2">
                                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                  <Clock size={12} /> The Early Warning Mandate
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed font-bold uppercase italic">
                                  Early warning system must be able to detect subtle changes in brain activity before a seizure occurs and provide timely alerts.
                                </p>
                              </div>

                              <div className="relative pt-8 pb-4">
                                <div className="h-1 w-full bg-white/10 rounded-full flex items-center justify-between">
                                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_20px_#3b82f6]" />
                                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase mt-2 tracking-widest">
                                  <span>Normal</span>
                                  <span className="text-blue-400">QI Detection</span>
                                  <span>Seizure</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status: Monitoring Critical Manifolds</div>
                              <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {landingTab === 'tech' && (
                  <motion.div
                    key="tech"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="max-w-7xl mx-auto px-6 md:px-12"
                  >
                    <div className="mb-24 md:mb-40">
                      <div className="text-blue-500 font-black text-lg uppercase tracking-[0.4em] mb-6">Methodology & Architecture</div>
                      <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter uppercase italic leading-[0.8]">The Technical <br /><span className="text-blue-400">Foundation</span></h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
                      {/* 3.1 & 3.2: Dataset & Preprocessing */}
                      <div className="lg:col-span-4 space-y-16 md:space-y-24">
                        <section className="space-y-8">
                          <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm">
                            <div className="w-10 h-[2px] bg-blue-500" /> 3.1 Dataset & Protocol
                          </div>
                          <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            Experiments utilized the CHB–MIT Scalp EEG database, consisting of long-term recordings at 256 Hz with clinically annotated seizure transitions.
                          </p>
                          <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] space-y-6">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-500">
                              <span>Training Pool</span>
                              <span className="text-white">chb01 - chb20</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-blue-400">
                              <span>Strict Test Pool</span>
                              <span className="text-white">chb21 - chb23</span>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-8">
                          <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm">
                            <div className="w-10 h-[2px] bg-blue-500" /> 3.2 Preprocessing
                          </div>
                          <ul className="space-y-5 text-gray-500 text-sm font-bold uppercase tracking-widest">
                            <li className="flex gap-4 items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500" /> Band-pass: 1–40 Hz
                            </li>
                            <li className="flex gap-4 items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500" /> Notch filter: 50 Hz
                            </li>
                            <li className="flex gap-4 items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500" /> Artifact Removal: ICA
                            </li>
                            <li className="flex gap-4 items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500" /> 1s Windows | 2s Stride
                            </li>
                          </ul>
                        </section>
                      </div>

                      {/* 3.3: Feature Engineering */}
                      <div className="lg:col-span-8 space-y-16 md:space-y-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                          <div className="p-10 md:p-14 bg-white/5 border border-white/10 rounded-[4rem] hover:border-blue-500/30 transition-all group">
                            <Activity className="text-blue-500 mb-8 group-hover:scale-110 transition-transform" size={48} />
                            <h3 className="text-2xl font-black mb-6 uppercase italic">Time-Domain (29)</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                              Extracted to characterize amplitude dynamics and cross-channel statistics. Includes Hjorth descriptors, dispersion, and zero-crossing behavior.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {['Hjorth Complexity', 'Pearson Corr', 'Peak-to-Peak'].map(f => (
                                <span key={f} className="text-[10px] font-black bg-white/10 px-3 py-1.5 rounded-lg text-gray-300 uppercase tracking-widest">{f}</span>
                              ))}
                            </div>
                          </div>

                          <div className="p-10 md:p-14 bg-white/5 border border-white/10 rounded-[4rem] hover:border-indigo-500/30 transition-all group">
                            <Zap className="text-indigo-500 mb-8 group-hover:scale-110 transition-transform" size={48} />
                            <h3 className="text-2xl font-black mb-6 uppercase italic">Freq-Domain (17)</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                              Welch PSD estimation used to summarize rhythmic energy redistribution across canonical EEG bands.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {['Spectral Entropy', 'Band Ratios', 'Rel Power'].map(f => (
                                <span key={f} className="text-[10px] font-black bg-white/10 px-3 py-1.5 rounded-lg text-gray-300 uppercase tracking-widest">{f}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Quantum-Inspired Features Table */}
                        <section className="space-y-10">
                          <div className="flex items-center gap-6">
                            <div className="p-6 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30">
                              <Waves className="text-white" size={36} />
                            </div>
                            <div>
                              <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">Quantum-Inspired (11)</h3>
                              <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mt-3">Density Matrix-Based Global Dynamics</p>
                            </div>
                          </div>

                          <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-white/10 text-sm font-black uppercase tracking-[0.3em] text-gray-500">
                                  <th className="pb-8 pr-10">QI Feature</th>
                                  <th className="pb-8">Interpretation in EEG Context</th>
                                </tr>
                              </thead>
                              <tbody className="text-sm">
                                {[
                                  { name: 'Von Neumann Entropy', context: 'Global disorder and complexity of multichannel dynamics' },
                                  { name: 'Purity', context: 'Degree of global synchronization and source dominance' },
                                  { name: 'Linear Entropy', context: 'Approximate mixedness of multichannel EEG activity' },
                                  { name: 'Quantum Coherence', context: 'Strength of inter-channel coupling and coordinated activity' },
                                  { name: 'Quantum Fisher Info', context: 'Sensitivity of global EEG structure to perturbations' },
                                  { name: 'Entanglement Entropy', context: 'Information coupling between EEG channel subsets' },
                                  { name: 'Wigner Energy', context: 'Overall energy concentration in the time-frequency plane' },
                                  { name: 'Wigner Entropy', context: 'Time-frequency complexity and spectral dispersion' },
                                  { name: 'Wigner Variance', context: 'Spread of energy in the phase-space representation' },
                                  { name: 'Wigner Skewness', context: 'Asymmetry of transient oscillatory patterns' },
                                  { name: 'Wigner Kurtosis', context: 'Peakedness and intermittency of phase-space structure' },
                                ].map((row, idx) => (
                                  <tr key={idx} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-8 pr-10 font-black text-white italic whitespace-nowrap text-base">{row.name}</td>
                                    <td className="py-8 text-gray-400 leading-relaxed italic font-medium">{row.context}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>

                        {/* Experimental Setup Summary */}
                        <section className="bg-white/5 border border-white/10 p-14 rounded-[4rem] mb-20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                            <div className="space-y-4">
                              <h4 className="text-white font-black uppercase text-sm mb-4 italic tracking-widest">Strict Protocol</h4>
                              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                Evaluation was performed strictly on unseen patients chb21-23. Normalization parameters were learned solely from training data to ensure true generalization.
                              </p>
                            </div>
                            <div className="flex flex-col justify-center gap-6">
                              <div className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Intrinsic Capability Test</div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Database Provenance Section */}
                        <section className="space-y-16 border-t border-white/10 pt-20">
                          <div className="max-w-4xl">
                            <div className="text-blue-500 font-black text-[10px] uppercase tracking-[0.5em] mb-4">Data Provenance</div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">CHB-MIT Scalp <br /><span className="text-white">EEG Database</span></h2>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="col-span-2 space-y-10">
                              <div className="space-y-6">
                                <div className="flex items-center gap-4 text-xs font-black text-gray-500 uppercase tracking-widest">
                                  <FileText size={16} /> Open Access Disclosure
                                </div>
                                <p className="text-gray-400 leading-relaxed font-medium text-lg">
                                  The CHB-MIT Scalp EEG Database is a world-class collection of EEG recordings from 22 pediatric subjects with intractable seizures, published by PhysioNet (Version 1.0.0). Monitored at Children’s Hospital Boston, subjects were observed following anti-seizure medication withdrawal to characterize neural trajectories.
                                </p>
                              </div>

                              <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/10 space-y-6">
                                <h4 className="text-white font-black uppercase tracking-widest text-xs">Standard Citation</h4>
                                <div className="text-sm font-mono text-blue-400 bg-black/40 p-6 rounded-2xl border border-white/5 leading-relaxed">
                                  Guttag, J. (2010). CHB-MIT Scalp EEG Database (version 1.0.0). PhysioNet. RRID:SCR_007345. https://doi.org/10.13026/C2K01R
                                </div>
                                <div className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                  Goldberger, A., et al. (2000). PhysioBank, PhysioToolkit, and PhysioNet: Components of a new research resource for complex physiologic signals. Circulation. 101 (23), pp. e215–e220.
                                </div>
                              </div>

                              <div className="space-y-6">
                                <h4 className="text-white font-black uppercase tracking-[0.3em] text-xs italic">Technical Parameters</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {[
                                    { label: 'Sampling Rate', value: '256 Hz' },
                                    { label: 'Resolution', value: '16-bit' },
                                    { label: 'Subjects', value: '22 (Pediatric)' },
                                    { label: 'Annotations', value: '198 Seizures' }
                                  ].map(stat => (
                                    <div key={stat.label} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                                      <span className="text-[8px] font-black text-gray-500 uppercase">{stat.label}</span>
                                      <span className="text-sm font-black text-white">{stat.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-8 bg-blue-600/5 border border-blue-500/20 p-10 rounded-[3rem] h-fit sticky top-32">
                              <div>
                                <h4 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-4">Dataset Abstract</h4>
                                <p className="text-xs text-gray-400 leading-relaxed font-bold italic">
                                  This database consists of EEG recordings from subjects monitored for up to several days in order to assess candidacy for surgical intervention. Grouped into 23 cases, it captures the critical transition between normal and ictal states.
                                </p>
                              </div>
                              <div className="h-px bg-white/10" />
                              <div>
                                <h4 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-4">Original Publication</h4>
                                <p className="text-xs text-white leading-relaxed font-black mb-4">
                                  Ali Shoeb. PhD Thesis, Massachusetts Institute of Technology, September 2009.
                                </p>
                                <div className="text-[8px] text-gray-500 leading-tight">
                                  Patient-Specific Seizure Onset Detection. Epilepsy and Behavior. August 2004, 5(4): 483-498.
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </motion.div>
                )}

                {landingTab === 'results' && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-6xl mx-auto px-12"
                  >
                    <div className="text-center mb-16">
                      <h2 className="text-6xl font-black tracking-tighter uppercase italic">Performance Leap</h2>
                      <p className="text-gray-400 text-xl">Proven robust on unseen patients (chb21, chb22, chb23).</p>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-8 bg-white/5 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden">
                        <video
                          autoPlay loop muted playsInline
                          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
                        >
                          <source src={video1} type="video/mp4" />
                        </video>
                        <div className="relative z-10">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-10">Cross-Patient Validation Benchmarks</h3>
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                <th className="pb-6">Feature Set Configuration</th>
                                <th className="pb-6">ROC-AUC Performance</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm font-bold">
                              <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                <td className="py-6 text-gray-400">Time-domain only</td>
                                <td className="py-6 text-red-400">0.8890</td>
                              </tr>
                              <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                <td className="py-6 text-gray-400">Frequency-domain only</td>
                                <td className="py-6 text-amber-400">0.9078</td>
                              </tr>
                              <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                <td className="py-6 text-gray-400">Classical Hybrid (T + F)</td>
                                <td className="py-6 text-blue-400">0.9151</td>
                              </tr>
                              <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                <td className="py-6 font-black">Quantum-Inspired only</td>
                                <td className="py-6 text-emerald-400">0.9239</td>
                              </tr>
                              <tr className="group hover:bg-white/5 transition-colors">
                                <td className="py-6 text-blue-500 font-black italic">UNIFIED HYBRID (T+F+QI)</td>
                                <td className="py-6 text-blue-500 font-black text-2xl">0.9376</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="col-span-4 space-y-8">
                        <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white">
                          <div className="text-3xl font-black mb-2">0.90</div>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-relaxed">Ictal Event Sensitivity (Recall) reached with QI Features.</div>
                        </div>
                        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-white overflow-hidden relative group">
                          <video
                            autoPlay loop muted playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen transition-transform group-hover:scale-110"
                          >
                            <source src={video2} type="video/mp4" />
                          </video>
                          <div className="relative z-10">
                            <div className="text-lg font-black mb-2 uppercase italic tracking-tighter">Robust Testing</div>
                            <div className="text-xs text-gray-500 leading-relaxed">Achieved using strict patient-independent protocol. System is ready for real-world use on new, unseen subjects.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {landingTab === 'impact' && (
                  <motion.div
                    key="impact"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="max-w-7xl mx-auto px-12"
                  >
                    <div className="grid grid-cols-12 gap-12">
                      {/* Side Menu for Impact Content */}
                      <aside className="col-span-3 sticky top-40 h-fit space-y-4">
                        <div className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Impact Analysis</div>
                        {['Overview', 'Signs & Symptoms', 'Epidemiology', 'Causes', 'Treatment', 'Prevention', 'Social Impact'].map(item => (
                          <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="block text-sm font-bold text-gray-500 hover:text-white transition-colors py-1">
                            {item}
                          </a>
                        ))}
                      </aside>

                      <div className="col-span-9 space-y-24 text-left pb-40">
                        {/* Statistics Dashboard */}
                        <section className="grid grid-cols-2 gap-8">
                          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
                              <BarChart3 size={14} /> Treatment Gap Index
                            </h3>
                            <div className="h-64">
                              <Bar
                                data={{
                                  labels: ['Low Income', 'Lower-Mid', 'Upper-Mid', 'High Income'],
                                  datasets: [{
                                    label: 'Treatment Gap %',
                                    data: [75, 46, 28, 10],
                                    backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.2)'],
                                    borderRadius: 8
                                  }]
                                }}
                                options={{
                                  maintainAspectRatio: false,
                                  plugins: { legend: { display: false } },
                                  scales: {
                                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                                    x: { grid: { display: false }, ticks: { color: '#666' } }
                                  }
                                }}
                              />
                            </div>
                            <p className="mt-4 text-[10px] text-gray-500 font-bold uppercase italic">Source: WHO/ILAE Global Report on Epilepsy</p>
                          </div>

                          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
                              <Activity size={14} /> Annual Incidence Rate
                            </h3>
                            <div className="h-64">
                              <Doughnut
                                data={{
                                  labels: ['Low-Mid Income', 'High Income'],
                                  datasets: [{
                                    data: [139, 49],
                                    backgroundColor: ['#10b981', '#ffffff10'],
                                    borderWidth: 0,
                                    hoverOffset: 10
                                  }]
                                }}
                                options={{
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                      labels: { color: '#666', font: { weight: 'bold', size: 10 } }
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="text-center mt-4">
                              <div className="text-2xl font-black text-white">139 vs 49</div>
                              <div className="text-[10px] text-gray-500 font-bold">Cases per 100,000 population</div>
                            </div>
                          </div>
                        </section>

                        <section id="overview" className="space-y-6">
                          <h2 className="text-5xl font-black tracking-tighter italic">Overview</h2>
                          <p className="text-gray-400 text-lg leading-relaxed">
                            Epilepsy is a chronic noncommunicable disease of the brain that affects around **50 million people worldwide**. It is characterized by recurrent seizures, which are brief episodes of involuntary movement that may involve a part of the body (partial) or the entire body (generalized) and are sometimes accompanied by loss of consciousness and control of bowel or bladder function.
                          </p>
                          <p className="text-gray-400 text-lg leading-relaxed">
                            Seizure episodes are a result of **excessive electrical discharges** in a group of brain cells. Different parts of the brain can be the site of such discharges. Seizures can vary from the briefest lapses of attention or muscle jerks to severe and prolonged convulsions.
                          </p>
                          <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl mt-8">
                            <p className="text-blue-100/60 font-medium italic">
                              "One seizure does not signify epilepsy (up to 10% of people worldwide have one seizure during their lifetime). Epilepsy is defined as having two or more unprovoked seizures."
                            </p>
                          </div>
                        </section>

                        <section id="signs-&-symptoms" className="space-y-6">
                          <h2 className="text-5xl font-black tracking-tighter italic">Signs and Symptoms</h2>
                          <div className="grid grid-cols-2 gap-8">
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
                              <h4 className="text-blue-400 font-black uppercase text-xs mb-4">Physical manifestations</h4>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                Characteristics vary depending on where in the brain the disturbance starts. Symptoms include loss of awareness, disturbances of movement, sensation (vision, hearing, taste), mood, or cognitive functions.
                              </p>
                            </div>
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem]">
                              <h4 className="text-red-400 font-black uppercase text-xs mb-4">Comorbidities</h4>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                Higher rates of psychological conditions, including anxiety and depression. The risk of premature death is up to three times higher than the general population.
                              </p>
                            </div>
                          </div>
                        </section>

                        <section id="epidemiology" className="space-y-6">
                          <div className="flex justify-between items-end mb-8">
                            <h2 className="text-5xl font-black tracking-tighter italic">Epidemiology</h2>
                            <div className="text-emerald-500 font-black text-2xl">5,000,000+ <span className="text-xs uppercase text-gray-500 block">Annual New Cases</span></div>
                          </div>
                          <p className="text-gray-400 text-lg leading-relaxed">
                            Globally, an estimated 5 million people are diagnosed with epilepsy each year. In low- and middle-income countries, this figure is significantly higher—up to **139 per 100,000**. Close to **80%** of people with epilepsy live in these settings.
                          </p>
                        </section>

                        <section id="causes" className="space-y-12">
                          <h2 className="text-5xl font-black tracking-tighter italic">Pathology & Causes</h2>
                          <div className="grid grid-cols-3 gap-6">
                            {[
                              { title: 'Structural', desc: 'Brain damage from prenatal or perinatal causes, head injury, or stroke.' },
                              { title: 'Infectious', desc: 'Meningitis, encephalitis or neurocysticercosis (common in tropical areas).' },
                              { title: 'Genetic', desc: 'Congenital abnormalities or syndromes with associated brain malformations.' }
                            ].map(item => (
                              <div key={item.title} className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <h4 className="text-white font-black uppercase text-xs mb-2 italic tracking-widest">{item.title}</h4>
                                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-gray-400 text-sm italic border-l-2 border-white/10 pl-6">
                            Epilepsy is NOT contagious. However, underlying disease mechanisms remain unknown in about 50% of cases globally.
                          </p>
                        </section>

                        <section id="treatment" className="space-y-6">
                          <h2 className="text-5xl font-black tracking-tighter italic">Treatment & Care</h2>
                          <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] relative overflow-hidden">
                            <Zap size={80} className="absolute -right-8 -bottom-8 text-emerald-500/10 rotate-12" />
                            <h3 className="text-2xl font-black text-white mb-4">70% Clinical Efficacy</h3>
                            <p className="text-emerald-100/60 text-lg leading-relaxed">
                              Up to **70% of people** living with epilepsy could become seizure-free with appropriate use of antiseizure medicines. Yet, in low-income countries, three-quarters do not receive treatment—known as the **"Treatment Gap"**.
                            </p>
                          </div>
                        </section>

                        <section id="prevention" className="space-y-6">
                          <h2 className="text-5xl font-black tracking-tighter italic">Prevention Strategy</h2>
                          <ul className="grid grid-cols-1 gap-4">
                            {[
                              'Head Injury Prevention (reducing falls, traffic accidents)',
                              'Adequate Perinatal Care (reducing birth injuries)',
                              'Cardiovascular Risk Factor Reduction (stroke prevention)',
                              'Elimination of Parasites (tropical neurocysticercosis)'
                            ].map((item, idx) => (
                              <li key={idx} className="flex items-center gap-4 text-gray-400 group">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                                <span className="text-sm font-bold uppercase tracking-widest">{item}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-gray-500 text-sm italic font-medium">An estimated 25% of epilepsy cases are potentially preventable.</p>
                        </section>

                        <section id="social-impact" className="space-y-8">
                          <h2 className="text-5xl font-black tracking-tighter italic">Social & Economic impact</h2>
                          <p className="text-gray-400 text-lg leading-relaxed">
                            Epilepsy accounts for more than 0.5% of the global burden of disease. The stigma and discrimination are often more difficult to overcome than the seizures themselves, impacting access to education, employment, and human rights.
                          </p>
                          <div className="p-1 gap-2 flex flex-wrap">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-500 uppercase">Human Rights Violations</span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-500 uppercase">Employment Barriers</span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-500 uppercase">Social Stigma</span>
                          </div>
                        </section>

                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Persistent Footer */}
            <footer className="z-50 h-20 flex items-center justify-between px-12 bg-black border-t border-white/5 sticky bottom-0">


            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#0B0C10] text-[#E0E0E0] flex flex-col md:flex-row overflow-hidden"
          >
            {/* MOBILE HEADER FOR DASHBOARD */}
            <div className="md:hidden h-16 bg-[#14161F] border-b border-white/5 flex items-center justify-between px-6 z-50">
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-blue-600" />
                <span className="font-['Syncopate'] text-sm tracking-tighter">N_Q PORTAL</span>
              </div>
              <button onClick={goHome} className="p-2 text-gray-500 hover:text-white"><ArrowLeft size={18} /></button>
            </div>

            {/* LEFT SIDEBAR - PATIENT DIRECTORY */}
            <aside className="hidden md:flex w-96 bg-[#14161F] border-r border-white/5 flex-col z-20 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Brain size={18} className="text-white" />
                  </div>
                  <span className="font-['Syncopate'] font-bold text-lg tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">N_Q COMMAND</span>
                </div>
                <button onClick={goHome} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                  <ArrowLeft size={18} />
                </button>
              </div>

              <div className="p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Patients</h3>
                  <Users size={14} className="text-gray-300" />
                </div>

                <div className="space-y-2">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handlePatientSelect(p)}
                      className={`w-full text-left p-4 rounded-2xl transition-all group ${selectedPatient?.id === p.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPatient?.id === p.id ? 'bg-white/20' : 'bg-white/5'}`}>
                          <Fingerprint size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{p.id}</div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest ${selectedPatient?.id === p.id ? 'text-blue-100' : 'text-emerald-500'}`}>
                            Stable // Live
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-white/5">
                <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-500">Node Cluster: v2.4a (Online)</span>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col overflow-hidden">
              {/* TOP NAV */}
              <header className="h-20 bg-[#14161F]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 shrink-0">
                <div className="flex gap-4 items-center">
                  <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    <button className="px-4 py-2 bg-blue-600 rounded-lg shadow-sm text-xs font-bold text-white uppercase tracking-widest">Intelligence</button>
                  </div>

                  {/* Model Status Indicator */}
                  {selectedPatient && (
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${modelStatus === 'exists' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : modelStatus === 'checking' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {modelStatus === 'exists' ? (
                        <><CheckCircle2 size={12} /> Model Sync: Ready</>
                      ) : modelStatus === 'checking' ? (
                        <><Clock size={12} className="animate-spin" /> Syncing Intelligence...</>
                      ) : (
                        <><XCircle size={12} /> Network Offline</>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {patientDetails?.files && (
                    <select
                      className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer text-white"
                      onChange={e => setSelectedFile(e.target.value)}
                    >
                      <option value="" className="bg-[#14161F]">Select EEG Capture</option>
                      {patientDetails.files.map(f => <option key={f} value={f} className="bg-[#14161F]">{f}</option>)}
                    </select>
                  )}

                  {selectedFile && (
                    <div className="flex gap-2">
                      <button
                        onClick={startAnalysis}
                        disabled={isAnalyzing}
                        className={`px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${isAnalyzing ? 'bg-white/5 text-gray-600' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20'}`}
                      >
                        <BarChart3 size={14} /> {isAnalyzing ? 'ANALYZING...' : 'RUN FULL ANALYSIS'}
                      </button>

                      <button
                        onClick={startQuantumSync}
                        disabled={modelStatus !== 'exists'}
                        className={`px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${modelStatus === 'exists' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20' : 'bg-white/5 text-gray-600 cursor-not-allowed shadow-none'}`}
                      >
                        <Zap size={14} fill="currentColor" /> {isRunning ? 'RESTART SYNC' : modelStatus === 'exists' ? 'INITIATE QUANTUM SYNC' : 'OFFLINE'}
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* DIAGNOSTIC OVERLAY (ACTIVE ONLY DURING ANALYSIS/SYNC INITIALIZATION) */}
              <AnimatePresence>
                {(isAnalyzing || (isRunning && (intelligence.state === 'INITIALIZING' || syncStarting))) && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-20"
                  >
                    <div className="absolute inset-0 z-0">
                      <video autoPlay loop muted playsInline className="w-full h-full object-cover mix-blend-screen opacity-50"><source src={video1} type="video/mp4" /></video>
                    </div>
                    <div className="relative z-10 text-center space-y-12 max-w-2xl">
                      <div className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl shadow-blue-500/50" />
                      <div>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 italic">
                          {isAnalyzing ? "Quantum Analysis" : "Telemetry Handshake"}
                        </h2>
                        <p className="text-blue-400 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                          <RefreshCw size={14} className="animate-spin" /> Deep Mapping Neural Trajectories...
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">State Vector</div>
                          <div className="text-xs font-mono text-emerald-400">0x7F4A...{Math.random().toString(16).slice(2, 6)}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Entanglement</div>
                          <div className="text-xs font-mono text-blue-400">LINK: STABLE</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WORKSPACE AREA */}
              <div className="flex-1 p-10 overflow-y-auto space-y-8">
                {!selectedPatient ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden rounded-[4rem] border border-white/5 bg-[#0B0C10] p-12">
                    <div className="relative z-10 w-full max-w-5xl aspect-[16/10] overflow-hidden rounded-[3.5rem] border border-white/10 shadow-3xl bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-center p-20">
                      <video
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none scale-105"
                        style={{ objectPosition: 'center 40%' }}
                      >
                        <source src={video2} type="video/mp4" />
                      </video>
                      <div className="relative z-20 space-y-8">
                        <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40 animate-pulse">
                          <Users size={48} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none italic text-glow">Neural Selection <br /><span className="text-blue-500">Required</span></h2>
                        <p className="text-sm font-bold text-gray-400 max-w-md mx-auto uppercase tracking-[0.2em] leading-relaxed">
                          Initialize a quantum telemetry handshake by selecting a subject from the clinical database to begin analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                    {/* STATUS ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="bg-[#14161F] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span>Neural State</span>
                          <Activity size={14} />
                        </div>
                        <div className={`text-3xl font-black ${intelligence.state === 'ICTAL' ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>{intelligence.state}</div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">CONFIDENCE: {(intelligence.probs[2] * 100).toFixed(1)}%</div>
                          {intelligence.gt_state !== 'NORMAL' && (
                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${intelligence.gt_state === 'ICTAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>Expert: {intelligence.gt_state}</div>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#14161F] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span>vN Entropy</span>
                          <Waves size={14} />
                        </div>
                        <div className="text-3xl font-black text-white">{intelligence.metrics.entropy.toFixed(3)}</div>
                        <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, intelligence.metrics.entropy * 20)}%` }} />
                        </div>
                      </div>

                      <div className="bg-[#14161F] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span>Entanglement</span>
                          <Cpu size={14} />
                        </div>
                        <div className="text-3xl font-black text-white">{intelligence.metrics.entanglement.toFixed(3)}</div>
                        <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, intelligence.metrics.entanglement * 30)}%` }} />
                        </div>
                      </div>

                      <div className="bg-[#14161F] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span>Risk Factor</span>
                          <Shield size={14} />
                        </div>
                        <div className={`text-3xl font-black ${intelligence.probs[1] > 0.4 ? 'text-orange-500' : 'text-emerald-500'}`}>
                          {intelligence.probs[1] > 0.4 ? 'ELEVATED' : 'NOMINAL'}
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-gray-300">PREICTAL PROB: {(intelligence.probs[1] * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* CENTER HUB */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      {/* LIVE QUANTUM STREAM */}
                      <div className="col-span-1 lg:col-span-8 bg-[#14161F] rounded-[4rem] p-8 md:p-14 border border-white/5 shadow-2xl min-h-[500px] md:min-h-[700px] relative overflow-hidden">
                        {/* Video Watermark Background */}
                        <video
                          autoPlay loop muted playsInline
                          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${isRunning ? 'opacity-[0.07]' : 'opacity-0'}`}
                          style={{ objectPosition: 'center 40%' }}
                        >
                          <source src={video2} type="video/mp4" />
                        </video>
                        <div className="absolute top-10 left-10 flex items-center gap-4 z-10">
                          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Live EEG  Feed</span>
                          </div>
                          <div className="text-[10px] font-mono text-gray-600">OFFSET: {intelligence.time}</div>
                          {intelligence.gt_state !== 'NORMAL' && (
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg ${intelligence.gt_state === 'ICTAL' ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-amber-600 text-white shadow-amber-500/20'}`}>
                              Clinical Detection Zone
                            </div>
                          )}
                        </div>

                        <div className="h-full flex flex-col pt-12">
                          <div className="flex-1">
                            <Line
                              data={{
                                labels: intelligence.wave.map((_, i) => i),
                                datasets: [{
                                  data: intelligence.wave,
                                  borderColor: intelligence.state === 'ICTAL' ? '#EE4444' : intelligence.state === 'PREICTAL' ? '#F59E0B' : '#0071E3',
                                  borderWidth: 4,
                                  pointRadius: 0,
                                  tension: 0.45,
                                  fill: true,
                                  backgroundColor: intelligence.state === 'ICTAL' ? 'rgba(238, 68, 68, 0.1)' : intelligence.state === 'PREICTAL' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 113, 227, 0.05)'
                                }]
                              }}
                              options={{
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 400,
                                  easing: 'linear'
                                },
                                scales: {
                                  x: { display: false },
                                  y: {
                                    grid: { color: 'rgba(255,255,255,0.05)' },
                                    min: -150, max: 150,
                                    ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 16, weight: 'bold' } }
                                  }
                                },
                                plugins: {
                                  legend: { display: false },
                                  zoom: {
                                    pan: { enabled: false },
                                    zoom: { wheel: { enabled: false }, pinch: { enabled: false } }
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="mt-6 flex justify-between border-t border-gray-50 pt-6">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest"></span>
                            <button
                              onClick={consultAI}
                              disabled={isConsulting}
                              className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                              <Brain size={12} /> {isConsulting ? "Consulting..." : "Launch AI Consultant"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* PATIENT INFO & HISTORY */}
                      <div className="col-span-1 lg:col-span-4 space-y-10">
                        <div className="bg-[#14161F] rounded-[3rem] p-10 border border-white/5 shadow-2xl">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Patient Metadata</h3>
                          {patientDetails?.metadata ? (
                            <div className="space-y-6">
                              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Active Channels</span>
                                <span className="font-black text-2xl text-blue-600">{patientDetails.metadata.channels || '18'}</span>
                              </div>

                              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                  <Zap size={10} /> Documented Seizure Events
                                </div>

                                {patientDetails.metadata.seizures && patientDetails.metadata.seizures.length > 0 ? (
                                  patientDetails.metadata.seizures.map((s, idx) => (
                                    <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
                                      <div className="text-[10px] font-black text-blue-400 truncate mb-1">{s.file}</div>
                                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                        <span>START: {s.start}s</span>
                                        <span>END: {s.end}s</span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-[10px] font-bold text-gray-500 py-4 text-center bg-white/5 rounded-2xl italic border border-white/5">
                                    No specific seizure annotations found in summary.
                                  </div>
                                )}
                              </div>

                              <div className="bg-blue-500/5 p-5 rounded-3xl border border-blue-500/10">
                                <div className="flex items-center gap-2 mb-2 text-blue-400">
                                  <FileText size={14} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">System Notes</span>
                                </div>
                                <p className="text-[10px] text-blue-100/40 leading-relaxed font-bold uppercase">
                                  {patientDetails.metadata.clinical_notes}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="h-48 flex items-center justify-center text-gray-600 text-xs font-black uppercase tracking-widest animate-pulse">Awaiting Neural Handshake...</div>
                          )}
                        </div>

                        <div className="bg-[#14161F] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl min-h-[300px]">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Inference History</h3>
                          <div className="space-y-3">
                            {history.length === 0 ? (
                              <div className="text-[10px] font-bold text-gray-600 text-center py-12 uppercase tracking-[0.2em]">Listening for Events...</div>
                            ) : (
                              <AnimatePresence>
                                {history.map((item, idx) => (
                                  <motion.div
                                    key={item.time + item.state}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
                                  >
                                    <span className={`font-black text-xs ${item.state === 'ICTAL' ? 'text-red-500' : 'text-blue-400'}`}>{item.state}</span>
                                    <span className="text-[10px] font-mono font-bold text-gray-600">{item.time}</span>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ANALYSIS DASHBOARD (Static Full File Analysis) */}
                    {analysisData && (
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8 pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Deep Neural Analysis // {selectedFile}</h2>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-[10px] font-black text-purple-600">
                              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" /> FULL FILE TRACE
                            </div>
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black text-red-600">
                              ICTAL IDENTIFIED
                            </div>
                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black text-amber-600">
                              PRE-ICTAL (10-1m)
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          {[
                            {
                              title: 'Quantum Density Descriptors',
                              series: [
                                { label: 'vN Entropy', data: analysisData.quantum.vn_entropy, color: '#0071E3' },
                                { label: 'Purity', data: analysisData.quantum.purity, color: '#10B981' },
                                { label: 'Linear Entropy', data: analysisData.quantum.linear_entropy, color: '#8B5CF6' },
                                { label: 'Coherence', data: analysisData.quantum.coherence, color: '#F59E0B' },
                                { label: 'Fisher Info', data: analysisData.quantum.qfi, color: '#EF4444' },
                                { label: 'Entanglement', data: analysisData.quantum.entanglement, color: '#EC4899' }
                              ]
                            },
                            {
                              title: 'Spectral Power Dynamics (Relative)',
                              series: [
                                { label: 'Delta', data: analysisData.freq_domain.rel_delta, color: '#6366F1' },
                                { label: 'Theta', data: analysisData.freq_domain.rel_theta, color: '#10B981' },
                                { label: 'Alpha', data: analysisData.freq_domain.rel_alpha, color: '#F59E0B' },
                                { label: 'Beta', data: analysisData.freq_domain.rel_beta, color: '#EF4444' },
                                { label: 'Gamma', data: analysisData.freq_domain.rel_gamma, color: '#8B5CF6' }
                              ]
                            },
                            {
                              title: 'Clinical Spectral Indices',
                              series: [
                                { label: 'Theta/Alpha', data: analysisData.freq_domain.theta_alpha, color: '#8B5CF6' },
                                { label: 'Delta/Alpha', data: analysisData.freq_domain.delta_alpha, color: '#EF4444' },
                                { label: 'Spec Entropy', data: analysisData.freq_domain.spec_entropy, color: '#0071E3' },
                                { label: 'Edge Freq (95%)', data: analysisData.freq_domain.sef95, color: '#10B981' }
                              ]
                            },
                            {
                              title: 'Time-Domain Micro-dynamics',
                              series: [
                                { label: 'Energy', data: analysisData.time_domain.energy, color: '#0071E3' },
                                { label: 'Hjorth Activity', data: analysisData.time_domain.hjorth_act, color: '#10B981' },
                                { label: 'Mobility', data: analysisData.time_domain.hjorth_mob, color: '#F59E0B' },
                                { label: 'Complexity', data: analysisData.time_domain.hjorth_comp, color: '#8B5CF6' }
                              ]
                            },
                            {
                              title: 'Wigner-Ville Phase-Space',
                              series: [
                                { label: 'WV Energy', data: analysisData.phase_space.wv_energy, color: '#0071E3' },
                                { label: 'WV Entropy', data: analysisData.phase_space.wv_entropy, color: '#8B5CF6' },
                                { label: 'WV Variance', data: analysisData.phase_space.wv_variance, color: '#10B981' },
                                { label: 'WV Skewness', data: analysisData.phase_space.wv_skewness, color: '#EF4444' },
                                { label: 'WV Kurtosis', data: analysisData.phase_space.wv_kurtosis, color: '#F59E0B' }
                              ]
                            },
                            {
                              title: 'Synchronization & Flux',
                              series: [
                                { label: 'Zero-Crossing', data: analysisData.time_domain.zcr, color: '#10B981' },
                                { label: 'Peak-to-Peak', data: analysisData.time_domain.peak_to_peak, color: '#EF4444' },
                                { label: 'Mean Sync', data: analysisData.time_domain.inter_corr, color: '#0071E3' },
                                { label: 'Sync Variance', data: analysisData.time_domain.inter_corr_var, color: '#8B5CF6' }
                              ]
                            }
                          ].map(chart => {
                            const normalizeSeries = (data) => {
                              if (!data || data.length === 0) return [];
                              const min = Math.min(...data);
                              const max = Math.max(...data);
                              if (max === min) return data.map(() => 0.5);
                              return data.map(v => (v - min) / (max - min));
                            };
                            return { ...chart, series: chart.series.map(s => ({ ...s, data: normalizeSeries(s.data) })) };
                          }).map((chart, idx) => (
                            <div
                              key={idx}
                              className="bg-[#14161F] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all relative group"
                            >
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">{chart.title}</h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); gridRefs[idx].current.zoom(1.1); }} className="p-1.5 bg-white/5 rounded-lg hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors"><Plus size={14} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); gridRefs[idx].current.zoom(0.9); }} className="p-1.5 bg-white/5 rounded-lg hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors"><Minus size={14} /></button>
                                  <button onClick={(e) => { e.stopPropagation(); gridRefs[idx].current.resetZoom(); }} className="p-1.5 bg-white/5 rounded-lg hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-colors"><RefreshCw size={14} /></button>
                                  <button onClick={() => setZoomedChart(chart)} className="p-1.5 bg-blue-600 rounded-lg text-white transition-colors ml-1"><LayoutDashboard size={14} /></button>
                                </div>
                              </div>
                              <div className="h-64">
                                <Line
                                  ref={gridRefs[idx]}
                                  data={{
                                    labels: analysisData.time,
                                    datasets: chart.series.map(s => ({
                                      label: s.label,
                                      data: s.data,
                                      borderColor: s.color,
                                      borderWidth: 2,
                                      pointRadius: 0,
                                      tension: 0.4
                                    }))
                                  }}
                                  options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                      x: { type: 'linear', grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 16, weight: 'bold' } } },
                                      y: {
                                        grid: { color: 'rgba(255,255,255,0.05)' },
                                        ticks: {
                                          color: 'rgba(255,255,255,0.4)',
                                          font: { size: 10 },
                                          callback: (val) => `${(val * 100).toFixed(0)}%`
                                        },
                                        title: { display: true, text: 'Relative Mag', color: 'rgba(255,255,255,0.3)', font: { size: 8, weight: 'bold' } }
                                      }
                                    },
                                    plugins: {
                                      zoom: {
                                        pan: { enabled: false },
                                        zoom: { wheel: { enabled: false }, pinch: { enabled: false } }
                                      },
                                      annotation: {
                                        annotations: {
                                          ...(analysisData.markers?.seizures || []).reduce((acc, s, i) => ({
                                            ...acc,
                                            [`ictal_${i}`]: {
                                              type: 'box', xMin: s.start, xMax: s.end,
                                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                              borderWidth: 1, borderColor: '#ef4444',
                                              label: { display: true, content: 'ICTAL', position: 'start', font: { size: 10, weight: '900' }, color: '#fff', backgroundColor: '#ef4444', padding: 4 }
                                            }
                                          }), {}),
                                          ...(analysisData.markers?.preictals || []).reduce((acc, p, i) => ({
                                            ...acc,
                                            [`pre_${i}`]: {
                                              type: 'box', xMin: p.start, xMax: p.end,
                                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                              borderWidth: 1, borderColor: '#f59e0b',
                                              label: { display: true, content: 'PRE', position: 'start', font: { size: 10, weight: 'bold' }, color: '#fff', backgroundColor: '#f59e0b', padding: 4 }
                                            }
                                          }), {})
                                        }
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ZOOM MODAL */}
                    <AnimatePresence>
                      {zoomedChart && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl p-20 flex items-center justify-center"
                          onClick={() => setZoomedChart(null)}
                        >
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#14161F] w-full h-full rounded-[3rem] p-12 relative flex flex-col border border-white/10 shadow-3xl"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setZoomedChart(null)}
                              className="absolute top-10 right-10 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 text-white transition-all font-black border border-white/10"
                            >
                              <XCircle size={24} />
                            </button>

                            <div className="mb-8 flex items-end justify-between">
                              <div>
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">{zoomedChart.title}</h3>
                                <div className="text-3xl font-black text-white tracking-tighter uppercase">Detailed Neural Trace Analysis</div>
                                <p className="text-xs text-gray-400 mt-2">Use mouse wheel or the controls below to zoom, click and drag to pan.</p>
                              </div>
                              <div className="flex gap-2 bg-black/20 p-2 rounded-2xl border border-white/5">
                                <button onClick={() => modalChartRef.current.zoom(1.2)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-gray-400 hover:text-blue-400 transition-all border border-white/5"><Plus size={18} /></button>
                                <button onClick={() => modalChartRef.current.zoom(0.8)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-gray-400 hover:text-blue-400 transition-all border border-white/5"><Minus size={18} /></button>
                                <button onClick={() => modalChartRef.current.resetZoom()} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-gray-400 hover:text-blue-400 transition-all border border-white/5"><RefreshCw size={18} /></button>
                              </div>
                            </div>

                            <div className="flex-1 min-h-0">
                              <Line
                                ref={modalChartRef}
                                data={{
                                  labels: analysisData.time,
                                  datasets: zoomedChart.series.map(s => ({
                                    label: s.label,
                                    data: s.data,
                                    borderColor: s.color,
                                    borderWidth: 3,
                                    pointRadius: 0,
                                    tension: 0.4
                                  }))
                                }}
                                options={{
                                  maintainAspectRatio: false,
                                  scales: {
                                    x: { type: 'linear', grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.8)', font: { size: 18, weight: 'bold' } } },
                                    y: {
                                      grid: { color: 'rgba(255,255,255,0.1)' },
                                      ticks: {
                                        color: 'rgba(255,255,255,0.8)',
                                        font: { size: 18, weight: 'bold' },
                                        callback: (val) => `${(val * 100).toFixed(0)}%`
                                      },
                                      title: { display: true, text: 'RELATIVE FEATURE INTENSITY (0-100%)', color: 'rgba(255,255,255,0.4)', font: { size: 14, weight: '900' } }
                                    }
                                  },
                                  plugins: {
                                    zoom: {
                                      pan: { enabled: true, mode: 'x', speed: 2 },
                                      zoom: { wheel: { enabled: true, speed: 0.01 }, pinch: { enabled: true }, mode: 'x' }
                                    },
                                    annotation: {
                                      annotations: {
                                        ...(analysisData.markers?.seizures || []).reduce((acc, s, i) => ({
                                          ...acc,
                                          [`ictal_${i}`]: {
                                            type: 'box',
                                            xMin: s.start,
                                            xMax: s.end,
                                            backgroundColor: 'rgba(239, 68, 68, 0.25)',
                                            borderWidth: 2,
                                            borderColor: 'rgba(239, 68, 68, 0.5)',
                                            label: { display: true, content: 'ICTAL ZONE', position: 'center', font: { size: 12, weight: '900' }, color: '#fff', backgroundColor: '#e74c3c', padding: 8, borderRadius: 8 }
                                          }
                                        }), {}),
                                        ...(analysisData.markers?.preictals || []).reduce((acc, p, i) => ({
                                          ...acc,
                                          [`pre_${i}`]: {
                                            type: 'box',
                                            xMin: p.start,
                                            xMax: p.end,
                                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                            borderWidth: 2,
                                            borderColor: 'rgba(245, 158, 11, 0.4)',
                                            label: { display: true, content: 'PRE-ICTAL', position: 'center', font: { size: 12, weight: '900' }, color: '#fff', backgroundColor: '#f39c12', padding: 8, borderRadius: 8 }
                                          }
                                        }), {})
                                      }
                                    }
                                  }
                                }}
                              />
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* AI CONSULTANT SIDEBAR */}
                    <AnimatePresence>
                      {aiReport && (
                        <motion.div
                          initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                          className="fixed top-20 right-0 bottom-0 w-full md:w-[400px] max-w-full bg-[#14161F] border-l border-white/5 shadow-3xl z-50 flex flex-col"
                        >
                          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-blue-600 text-white">
                            <div className="flex items-center gap-3">
                              <Brain size={24} />
                              <div className="font-black uppercase tracking-tighter">QI Consultant</div>
                            </div>
                            <button onClick={() => setAiReport(null)} className="hover:bg-white/20 p-2 rounded-lg transition-colors"><XCircle size={20} /></button>
                          </div>
                          <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-6 custom-scrollbar text-sm leading-relaxed bg-black/10">
                            <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 italic text-blue-400 text-xs">
                              "Analyzing global feature trajectories for patient {selectedPatient.id}..."
                            </div>
                            <div className="whitespace-pre-wrap font-medium text-gray-400">
                              {aiReport}
                            </div>
                            {isConsulting && (
                              <div className="flex items-center gap-2 text-blue-600 animate-pulse font-black text-[10px] uppercase tracking-widest">
                                <RefreshCw size={12} className="animate-spin" /> Updating Analysis...
                              </div>
                            )}
                          </div>
                          <div className="p-6 border-t border-white/5 bg-black/20">
                            <button
                              onClick={consultAI}
                              className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10"
                            >
                              Refresh AI Report
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;