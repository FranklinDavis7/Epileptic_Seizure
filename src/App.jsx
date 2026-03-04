import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Zap, Brain, Clock, BarChart3, FileText, Settings, Download,
  CheckCircle2, XCircle, Shield, Users,
  LayoutDashboard, Fingerprint, Waves, Cpu, Plus, Minus, RefreshCw, ArrowLeft
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { EventSourcePolyfill } from 'event-source-polyfill';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'hammerjs';

// Assets
import video1 from './assets/videos/1. Digital Brain Diagnostics.mp4';
import video2 from './assets/videos/Neural Interface Simulation.mp4';
import video3 from './assets/videos/Microscopic Neuronal Activity.mp4';
import video4 from './assets/videos/Brain & Neural Network Overview.mp4';
import researchPaper from './assets/Report/New_Paper___MIDAS___Final_Draft copy.pdf';

ChartJS.register(...registerables, annotationPlugin, zoomPlugin);

// CONFIG: Update this with your Ngrok URL from Colab
const API_BASE = import.meta.env.VITE_API_BASE || "https://3563-34-55-164-123.ngrok-free.app";
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

  // Initial Sync
  useEffect(() => {
    api.get("/patients")
      .then(res => setPatients(res.data))
      .catch(() => console.log("System Offline"));
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
    setIsRunning(true);

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
            <nav className="z-50 h-24 flex items-center justify-between px-12 sticky top-0 bg-black/50 backdrop-blur-xl border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center rotate-12">
                  <Brain size={24} className="text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase font-['Syncopate'] bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.5)]">Neural_Quantum</span>
              </div>
              <div className="flex gap-8 items-center">
                {['home', 'tech', 'results', 'impact'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setLandingTab(tab)}
                    className={`text-xs font-black uppercase tracking-widest transition-all ${landingTab === tab ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
                  >
                    {tab === 'home' ? 'Overview' : tab === 'tech' ? 'The Tech' : tab === 'results' ? 'Performance' : 'Global Impact'}
                  </button>
                ))}
                <button
                  onClick={enterDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Launch Dash
                </button>
              </div>
            </nav>

            <main className="flex-1 z-10 overflow-y-auto pt-20 pb-40">
              <AnimatePresence mode="wait">
                {landingTab === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="max-w-6xl mx-auto px-12"
                  >
                    <div className="text-center space-y-8">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <Zap size={10} fill="currentColor" /> Research Publication v2.0
                      </div>
                      <h1 className="text-8xl font-black leading-[0.9] tracking-tighter">
                        Bridging Quantum <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-serif italic">Information Theory</span> <br />
                        and Epilepsy Management
                      </h1>
                      <p className="text-gray-400 text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                        Enhancing preictal and ictal state classification through Quantum-Inspired (QI) descriptors for more reliable seizure monitoring.
                      </p>
                      <div className="flex gap-6 justify-center pt-8">
                        <button onClick={enterDashboard} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
                          Explore the Dash
                        </button>
                        <a
                          href={researchPaper}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/5 border border-white/10 backdrop-blur-md px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
                        >
                          Read the Paper
                        </a>
                      </div>
                    </div>

                    {/* The "Why" - Problem Section */}
                    <div className="mt-40 grid grid-cols-2 gap-20 items-center">
                      <div className="space-y-6">
                        <div className="text-blue-500 font-black text-xs uppercase tracking-widest">The Challenge</div>
                        <h2 className="text-5xl font-black tracking-tight leading-tight">Beyond Local Signal Analysis</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                          Traditional EEG analysis often fails to capture the **global signal structure** and complex non-linear dependencies of the brain. The "Holy Grail" remains patient-independent evaluation—creating a model that works for anyone, not just the subject it was trained on.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-4">
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
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[4rem] border border-white/5 flex items-center justify-center relative overflow-hidden group">
                          <video
                            autoPlay loop muted playsInline
                            className="absolute w-full h-full object-cover opacity-40 mix-blend-screen transition-transform group-hover:scale-110"
                          >
                            <source src={video3} type="video/mp4" />
                          </video>
                          <div className="p-12 text-center relative z-10 bg-black/40 backdrop-blur-sm rounded-full aspect-square flex flex-col justify-center">
                            <div className="text-6xl font-black mb-4">0.9376</div>
                            <div className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Target Unified ROC-AUC</div>
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
                    className="max-w-6xl mx-auto px-12"
                  >
                    <div className="mb-20 text-center">
                      <h2 className="text-6xl font-black tracking-tighter uppercase mb-6 italic">The QI Advantage</h2>
                      <p className="text-gray-400 text-xl max-w-3xl mx-auto">
                        By modeling EEG windows as **density matrices ($\rho$)**, we capture system-level interactions that standard statistics miss.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-12">
                        <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:border-blue-500/40 transition-all">
                          <div className="text-blue-500 mb-6"><Activity size={32} /></div>
                          <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Density-Matrix Features</h3>
                          <ul className="space-y-4 text-gray-400 text-sm">
                            <li><span className="text-white font-bold">von Neumann Entropy:</span> Measures global disorder and complexity of multichannel brain dynamics.</li>
                            <li><span className="text-white font-bold">Purity:</span> Indicates global synchronization; rises when a source dominates brain activity.</li>
                            <li><span className="text-white font-bold">Quantum Coherence:</span> Specifically quantifies strength of inter-channel coupling.</li>
                            <li><span className="text-white font-bold">Entanglement Entropy:</span> Analyzes information coupling between brain hemispheres.</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-12">
                        <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:border-purple-500/40 transition-all">
                          <div className="text-purple-500 mb-6"><Waves size={32} /></div>
                          <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Wigner-Ville Descriptors</h3>
                          <ul className="space-y-4 text-gray-400 text-sm">
                            <li><span className="text-white font-bold">Wigner Energy:</span> Total time-frequency localization of energy bursts.</li>
                            <li><span className="text-white font-bold">Wigner Entropy:</span> Measures complexity in the time-frequency plane.</li>
                            <li><span className="text-white font-bold">Skewness & Kurtosis:</span> Identifies transient "peakedness" characteristic of seizure onset.</li>
                          </ul>
                        </div>
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
                    className="max-w-4xl mx-auto px-12 text-center"
                  >
                    <div className="space-y-12">
                      <div className="inline-block p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-400">
                        <Shield size={48} />
                      </div>
                      <h2 className="text-6xl font-black tracking-tighter uppercase italic">Socio-Economic Mission</h2>
                      <div className="grid grid-cols-1 gap-8 text-left">
                        <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem]">
                          <h4 className="text-blue-500 font-black uppercase tracking-widest text-xs mb-4">The Global Burden</h4>
                          <p className="text-gray-400 text-xl leading-relaxed">
                            Epilepsy affects over <span className="text-white font-bold">50 million people</span> worldwide. The accurate discrimination between "preictal" and "ictal" states is the "Holy Grail" of early warning systems.
                          </p>
                        </div>
                        <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem]">
                          <h4 className="text-purple-500 font-black uppercase tracking-widest text-xs mb-4">Patient Independence</h4>
                          <p className="text-gray-400 text-xl leading-relaxed">
                            Bridging the diagnostic gap impacts patient safety, vocational independence, and overall quality of life by providing reliable, low-latency monitoring.
                          </p>
                        </div>
                      </div>
                      <button onClick={enterDashboard} className="mt-8 bg-emerald-500 text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95">
                        Launch Patient Portal
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Persistent Footer */}
            <footer className="z-50 h-20 flex items-center justify-between px-12 bg-black border-t border-white/5 sticky bottom-0">
              <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                NODE_QUANTUM SYSTEM // FRANKLINDAVIS7 // DBMSMS
              </div>
              <div className="flex gap-6">
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Privacy Node</button>
                <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Contact Intelligence</button>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#0B0C10] text-[#E0E0E0] flex overflow-hidden"
          >
            {/* LEFT SIDEBAR - PATIENT DIRECTORY */}
            <aside className="w-80 bg-[#14161F] border-r border-white/5 flex flex-col z-20 shadow-2xl">
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

              <div className="p-6 flex-1 overflow-y-auto">
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

              {/* DIAGNOSTIC OVERLAY (ACTIVE ONLY DURING ANALYSIS/SYNC) */}
              <AnimatePresence>
                {(isAnalyzing || isRunning) && (
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
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden rounded-[4rem] border border-white/5 bg-[#0B0C10]">
                    <video
                      autoPlay loop muted playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                    >
                      <source src={video2} type="video/mp4" />
                    </video>
                    <div className="relative z-10 bg-black/40 backdrop-blur-md p-12 rounded-[3.5rem] border border-white/10 shadow-2xl shadow-blue-500/5">
                      <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                        <Users size={40} className="text-white" />
                      </div>
                      <h2 className="text-4xl font-black uppercase tracking-tighter text-white leading-none mb-4 italic text-glow">Neural Selection <br /><span className="text-blue-500">Required</span></h2>
                      <p className="text-sm font-bold text-gray-400 max-w-md mx-auto uppercase tracking-widest leading-relaxed">
                        Navigate the patient directory on the left to initiate a quantum telemetry handshake and begin neural state analysis.
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    {/* STATUS ROW */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="bg-[#14161F] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <span>Neural State</span>
                          <Activity size={14} />
                        </div>
                        <div className={`text-3xl font-black ${intelligence.state === 'ICTAL' ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>{intelligence.state}</div>
                        <div className="mt-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">CONFIDENCE: {(intelligence.probs[2] * 100).toFixed(1)}%</div>
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
                    <div className="grid grid-cols-12 gap-8">
                      {/* LIVE QUANTUM STREAM */}
                      <div className="col-span-8 bg-[#14161F] rounded-[3rem] p-10 border border-white/5 shadow-2xl min-h-[500px] relative">
                        <div className="absolute top-10 left-10 flex items-center gap-4 z-10">
                          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Live Quantum Feed</span>
                          </div>
                          <div className="text-[10px] font-mono text-gray-600">OFFSET: {intelligence.time}</div>
                        </div>

                        <div className="h-full flex flex-col pt-12">
                          <div className="flex-1">
                            <Line
                              data={{
                                labels: intelligence.wave.map((_, i) => i),
                                datasets: [{
                                  data: intelligence.wave,
                                  borderColor: intelligence.state === 'ICTAL' ? '#EE4444' : '#0071E3',
                                  borderWidth: 2,
                                  pointRadius: 0,
                                  tension: 0.4,
                                  fill: true,
                                  backgroundColor: intelligence.state === 'ICTAL' ? 'rgba(238, 68, 68, 0.05)' : 'rgba(0, 113, 227, 0.05)'
                                }]
                              }}
                              options={{
                                maintainAspectRatio: false,
                                animation: false,
                                scales: {
                                  x: { display: false },
                                  y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: -150, max: 150, ticks: { color: '#444' } }
                                },
                                plugins: {
                                  legend: { display: false },
                                  zoom: {
                                    pan: { enabled: true, mode: 'x', speed: 10 },
                                    zoom: { wheel: { enabled: true, speed: 0.05 }, pinch: { enabled: true }, mode: 'x' }
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="mt-6 flex justify-between border-t border-gray-50 pt-6">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quantum State Analytics</span>
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
                      <div className="col-span-4 space-y-8">
                        <div className="bg-[#14161F] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Quantum Profile // Metadata</h3>
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
                          ].map((chart, idx) => (
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
                                    plugins: {
                                      zoom: {
                                        pan: { enabled: true, mode: 'x', speed: 10 },
                                        zoom: { wheel: { enabled: true, speed: 0.05 }, pinch: { enabled: true }, mode: 'x' }
                                      },
                                      annotation: {
                                        annotations: {
                                          ...(analysisData.markers.ictal ? {
                                            ictal: { type: 'box', xMin: analysisData.markers.ictal[0], xMax: analysisData.markers.ictal[1], backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 0, label: { display: true, content: 'ICTAL', position: 'start', font: { size: 8 } } },
                                            preictal: analysisData.markers.preictal ? { type: 'box', xMin: analysisData.markers.preictal[0], xMax: analysisData.markers.preictal[1], backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 0, label: { display: true, content: 'PRE', position: 'start', font: { size: 8 } } } : {}
                                          } : {})
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
                                  plugins: {
                                    zoom: {
                                      pan: { enabled: true, mode: 'x', speed: 10 },
                                      zoom: { wheel: { enabled: true, speed: 0.05 }, pinch: { enabled: true }, mode: 'x' }
                                    },
                                    annotation: {
                                      annotations: {
                                        ...(analysisData.markers.ictal ? {
                                          ictal: { type: 'box', xMin: analysisData.markers.ictal[0], xMax: analysisData.markers.ictal[1], backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 0, label: { display: true, content: 'ICTAL ZONE', position: 'start' } },
                                          preictal: analysisData.markers.preictal ? { type: 'box', xMin: analysisData.markers.preictal[0], xMax: analysisData.markers.preictal[1], backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 0, label: { display: true, content: 'PRE-ICTAL', position: 'start' } } : {}
                                        } : {})
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
                          className="fixed top-20 right-0 bottom-0 w-[400px] bg-[#14161F] border-l border-white/5 shadow-3xl z-50 flex flex-col"
                        >
                          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-blue-600 text-white">
                            <div className="flex items-center gap-3">
                              <Brain size={24} />
                              <div className="font-black uppercase tracking-tighter">QI Consultant</div>
                            </div>
                            <button onClick={() => setAiReport(null)} className="hover:bg-white/20 p-2 rounded-lg transition-colors"><XCircle size={20} /></button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-sm leading-relaxed">
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