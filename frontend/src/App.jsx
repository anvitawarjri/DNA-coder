import React, { useState, useEffect, useRef } from "react";
import {
  Dna,
  Activity,
  FileText,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  Send,
  BookOpen,
  Search,
  Upload,
  Sparkles,
  BarChart2,
  Bookmark,
  Plus,
  Info,
  ChevronRight,
  Printer
} from "lucide-react";

// Standard Codon Table database for the interactive explorer
const CODON_GROUPS = {
  "Hydrophobic": {
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Non-polar side chains, typically bury inside the protein structure.",
    aminoAcids: ["Phe", "Leu", "Ile", "Met", "Val", "Pro", "Ala", "Trp"]
  },
  "Polar": {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Neutral polar side chains, frequently participate in hydrogen bonding.",
    aminoAcids: ["Ser", "Thr", "Tyr", "Cys", "Gln", "Asn", "Gly"]
  },
  "Basic": {
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Positively charged side chains at physiological pH.",
    aminoAcids: ["Lys", "Arg", "His"]
  },
  "Acidic": {
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    description: "Negatively charged side chains at physiological pH.",
    aminoAcids: ["Asp", "Glu"]
  },
  "Termination": {
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    description: "Stop codons signaling the end of protein translation.",
    aminoAcids: ["Stop"]
  }
};

const CODON_LIST = [
  { codon: "TTT", aa: "Phe", name: "Phenylalanine" }, { codon: "TTC", aa: "Phe", name: "Phenylalanine" },
  { codon: "TTA", aa: "Leu", name: "Leucine" }, { codon: "TTG", aa: "Leu", name: "Leucine" },
  { codon: "CTT", aa: "Leu", name: "Leucine" }, { codon: "CTC", aa: "Leu", name: "Leucine" },
  { codon: "CTA", aa: "Leu", name: "Leucine" }, { codon: "CTG", aa: "Leu", name: "Leucine" },
  { codon: "ATT", aa: "Ile", name: "Isoleucine" }, { codon: "ATC", aa: "Ile", name: "Isoleucine" },
  { codon: "ATA", aa: "Ile", name: "Isoleucine" }, { codon: "ATG", aa: "Met", name: "Methionine (Start)" },
  { codon: "GTT", aa: "Val", name: "Valine" }, { codon: "GTC", aa: "Val", name: "Valine" },
  { codon: "GTA", aa: "Val", name: "Valine" }, { codon: "GTG", aa: "Val", name: "Valine" },
  { codon: "TCT", aa: "Ser", name: "Serine" }, { codon: "TCC", aa: "Ser", name: "Serine" },
  { codon: "TCA", aa: "Ser", name: "Serine" }, { codon: "TCG", aa: "Ser", name: "Serine" },
  { codon: "CCT", aa: "Pro", name: "Proline" }, { codon: "CCC", aa: "Pro", name: "Proline" },
  { codon: "CCA", aa: "Pro", name: "Proline" }, { codon: "CCG", aa: "Pro", name: "Proline" },
  { codon: "ACT", aa: "Thr", name: "Threonine" }, { codon: "ACC", aa: "Thr", name: "Threonine" },
  { codon: "ACA", aa: "Thr", name: "Threonine" }, { codon: "ACG", aa: "Thr", name: "Threonine" },
  { codon: "GCT", aa: "Ala", name: "Alanine" }, { codon: "GCC", aa: "Ala", name: "Alanine" },
  { codon: "GCA", aa: "Ala", name: "Alanine" }, { codon: "GCG", aa: "Ala", name: "Alanine" },
  { codon: "TAT", aa: "Tyr", name: "Tyrosine" }, { codon: "TAC", aa: "Tyr", name: "Tyrosine" },
  { codon: "TAA", aa: "Stop", name: "Ochre (Stop)" }, { codon: "TAG", aa: "Stop", name: "Amber (Stop)" },
  { codon: "CAT", aa: "His", name: "Histidine" }, { codon: "CAC", aa: "His", name: "Histidine" },
  { codon: "CAA", aa: "Gln", name: "Glutamine" }, { codon: "CAG", aa: "Gln", name: "Glutamine" },
  { codon: "AAT", aa: "Asn", name: "Asparagine" }, { codon: "AAC", aa: "Asn", name: "Asparagine" },
  { codon: "AAA", aa: "Lys", name: "Lysine" }, { codon: "AAG", aa: "Lys", name: "Lysine" },
  { codon: "GAT", aa: "Asp", name: "Aspartic Acid" }, { codon: "GAC", aa: "Asp", name: "Aspartic Acid" },
  { codon: "GAA", aa: "Glu", name: "Glutamic Acid" }, { codon: "GAG", aa: "Glu", name: "Glutamic Acid" },
  { codon: "TGT", aa: "Cys", name: "Cysteine" }, { codon: "TGC", aa: "Cys", name: "Cysteine" },
  { codon: "TGA", aa: "Stop", name: "Opal (Stop)" }, { codon: "TGG", aa: "Trp", name: "Tryptophan" },
  { codon: "CGT", aa: "Arg", name: "Arginine" }, { codon: "CGC", aa: "Arg", name: "Arginine" },
  { codon: "CGA", aa: "Arg", name: "Arginine" }, { codon: "CGG", aa: "Arg", name: "Arginine" },
  { codon: "AGT", aa: "Ser", name: "Serine" }, { codon: "AGC", aa: "Ser", name: "Serine" },
  { codon: "AGA", aa: "Arg", name: "Arginine" }, { codon: "AGG", aa: "Arg", name: "Arginine" },
  { codon: "GGT", aa: "Gly", name: "Glycine" }, { codon: "GGC", aa: "Gly", name: "Glycine" },
  { codon: "GGA", aa: "Gly", name: "Glycine" }, { codon: "GGG", aa: "Gly", name: "Glycine" }
];

const PRESETS = [
  {
    name: "BRAF V600E (Cancer)",
    ref: "TACTACGTGATTTTGGTCTAGC",
    alt: "TACTACGAGATTTTGGTCTAGC",
    desc: "Val600Glu missense substitution. Constitutively activates MAPK pathway."
  },
  {
    name: "CFTR F508del (Cystic Fibrosis)",
    ref: "ATCATCTTTGGTGTTTCCTAT",
    alt: "ATCATCGGTGTTTCCTAT",
    desc: "Inframe deletion of codon TTT (Phe). Leads to protein misfolding."
  },
  {
    name: "BRCA1 p.Y97* (Breast Cancer)",
    ref: "ATGCTATATGGCTTT",
    alt: "ATGCTATAGGGCTTT",
    desc: "Nonsense mutation introducing a premature stop codon."
  },
  {
    name: "Frameshift Deletion (CFTR)",
    ref: "ATGAAAGGCTTT",
    alt: "ATGAAAGGTTT",
    desc: "Deletion of a single base (C) causing translation reading frameshift."
  },
  {
    name: "MTHFR 677C>T (Folate Metabolism)",
    ref: "ATGAAAGGCGCG",
    alt: "ATGAAAGGCGCA",
    desc: "Synonymous mutation. Codon GCG changes to GCA, both translating to Alanine."
  }
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reference, setReference] = useState("");
  const [variant, setVariant] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  // History list
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Variant Literature Copilot. Ask me about the clinical significance, biochemical properties, or PubMed articles regarding this variant."
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [relevantArticles, setRelevantArticles] = useState([]);

  // Batch State
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");

  // Codon Table Explorer Search
  const [codonSearch, setCodonSearch] = useState("");
  const [selectedCodon, setSelectedCodon] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:8000/api/history/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyPreset = (preset) => {
    setReference(preset.ref);
    setVariant(preset.alt);
    setErrorMsg("");
  };

  const analyzeVariant = async () => {
    if (!reference.trim() || !variant.trim()) {
      setErrorMsg("Please enter both reference and variant sequences.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    setResult(null);

    // Reset Chat to default context
    setChatHistory([
      {
        role: "assistant",
        content: "I have loaded this variant. Ask me anything about its pathogenicity, impact on protein conformation, or clinical associations."
      }
    ]);
    setRelevantArticles([]);

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference: reference.toUpperCase().trim(),
          variant: variant.toUpperCase().trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Server error occurred during analysis.");
      }
      setResult(data);
      fetchHistory(); // refresh history panel
      
      // Auto-trigger literature search for the new variant
      fetchLiteratureSummary(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Connection refused. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLiteratureSummary = async (variantResult) => {
    setChatLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Summarize literature and clinical significance",
          context: {
            variant_type: variantResult.variant_type,
            protein_change: variantResult.protein_change,
            reference_protein: variantResult.reference_protein,
            variant_protein: variantResult.variant_protein,
            ref_nucleotide: variantResult.ref_nucleotide,
            alt_nucleotide: variantResult.alt_nucleotide,
            mutation_position: variantResult.mutation_position
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.response
          }
        ]);
        setRelevantArticles(data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !result) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMsg,
          context: {
            variant_type: result.variant_type,
            protein_change: result.protein_change,
            reference_protein: result.reference_protein,
            variant_protein: result.variant_protein,
            ref_nucleotide: result.ref_nucleotide,
            alt_nucleotide: result.alt_nucleotide,
            mutation_position: result.mutation_position
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
        if (data.articles && data.articles.length > 0) {
          setRelevantArticles(data.articles);
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI Copilot. Please check your backend connection." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleBatchAnalyze = async () => {
    if (!batchInput.trim()) {
      setBatchError("Please enter some variant data.");
      return;
    }
    setBatchError("");
    setBatchLoading(true);
    setBatchResults([]);

    try {
      // Parse CSV or newline text
      // Expected format: reference,variant (each on new line)
      const lines = batchInput.trim().split("\n");
      const variants = [];
      lines.forEach((line, idx) => {
        const parts = line.split(/[,\t]/);
        if (parts.length >= 2) {
          variants.push({
            reference: parts[0].toUpperCase().trim(),
            variant: parts[1].toUpperCase().trim()
          });
        }
      });

      if (variants.length === 0) {
        throw new Error("No valid variants found. Ensure columns are separated by comma or tab.");
      }

      const response = await fetch("http://localhost:8000/api/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ variants })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Batch analysis failed.");
      }

      setBatchResults(data);
      fetchHistory();
    } catch (err) {
      setBatchError(err.message || "Failed to process batch variants.");
    } finally {
      setBatchLoading(false);
    }
  };

  const loadPastAnalysis = (histItem) => {
    setReference(histItem.reference_sequence);
    setVariant(histItem.variant_sequence);
    setActiveTab("dashboard");
    // Run analysis automatically
    setTimeout(() => {
      analyzeVariant();
    }, 100);
  };

  const getVariantBadgeColor = (type) => {
    switch (type) {
      case "Nonsense":
      case "Frameshift":
        return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
      case "Missense":
      case "Stop-loss":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "Inframe Insertion":
      case "Inframe Deletion":
        return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
      case "Synonymous":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    }
  };

  // Prepares printable report
  const printReport = () => {
    window.print();
  };

  // Interactive Codon Wheel Explorer filtering
  const filteredCodons = CODON_LIST.filter(c => {
    const search = codonSearch.toLowerCase().trim();
    if (!search) return true;
    
    // Find amino acid group details
    const groupName = Object.keys(CODON_GROUPS).find(g => 
      CODON_GROUPS[g].aminoAcids.includes(c.aa) && g.toLowerCase().includes(search)
    );

    return (
      c.codon.toLowerCase().includes(search) ||
      c.aa.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search) ||
      groupName
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Top Banner / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-purple-500/20 animate-pulse">
              <Dna size={22} className="rotate-45" />
            </div>
            <div>
              <span className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
                HelixVariant
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                Variant Engine
              </span>
            </div>
          </div>

          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg font-outfit text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-slate-800 text-purple-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              Single Variant
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`px-4 py-2 rounded-lg font-outfit text-sm font-medium transition-all ${
                activeTab === "batch"
                  ? "bg-slate-800 text-purple-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              Batch Analysis
            </button>
            <button
              onClick={() => setActiveTab("codonExplorer")}
              className={`px-4 py-2 rounded-lg font-outfit text-sm font-medium transition-all ${
                activeTab === "codonExplorer"
                  ? "bg-slate-800 text-purple-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              Codon Wheel
            </button>
            <button
              onClick={() => setActiveTab("historyTab")}
              className={`px-4 py-2 rounded-lg font-outfit text-sm font-medium transition-all ${
                activeTab === "historyTab"
                  ? "bg-slate-800 text-purple-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              History Log
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input sequence panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 glow-purple">
                <h2 className="font-outfit text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-purple-400" />
                  DNA Variant Analyzer
                </h2>

                {/* Preset quick fills */}
                <div className="mb-5">
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Quick Clinical Presets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handleApplyPreset(preset)}
                        title={preset.desc}
                        className="text-xs bg-slate-800 hover:bg-slate-700/80 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-750 transition-all font-outfit cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Reference DNA (5' → 3')</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Length: {reference.length} bp
                      </span>
                    </label>
                    <textarea
                      value={reference}
                      onChange={(e) => {
                        setReference(e.target.value.replace(/[^ATGCatgc\n]/g, "").toUpperCase());
                        setErrorMsg("");
                      }}
                      rows={3}
                      placeholder="e.g. TACTACGTGATTTTGGTCTAGC"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm font-mono text-purple-300 focus:outline-none focus:border-purple-500 transition-colors uppercase placeholder:text-slate-650"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Variant DNA (5' → 3')</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Length: {variant.length} bp
                      </span>
                    </label>
                    <textarea
                      value={variant}
                      onChange={(e) => {
                        setVariant(e.target.value.replace(/[^ATGCatgc\n]/g, "").toUpperCase());
                        setErrorMsg("");
                      }}
                      rows={3}
                      placeholder="e.g. TACTACGAGATTTTGGTCTAGC"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 transition-colors uppercase placeholder:text-slate-650"
                    />
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs flex items-start gap-2 animate-shake">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    onClick={analyzeVariant}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:cursor-not-allowed text-white font-outfit font-medium text-sm py-3 px-4 rounded-xl shadow-lg shadow-purple-900/10 hover:shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Translating & Aligning...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Run Variant Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Side history quick log */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <h3 className="font-outfit text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                  <span>Recent Analyses</span>
                  <Database size={14} className="text-slate-400" />
                </h3>
                {historyLoading ? (
                  <div className="text-xs text-slate-500 text-center py-4">Loading history...</div>
                ) : history.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    No runs logged yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {history.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadPastAnalysis(item)}
                        className="bg-slate-950/40 hover:bg-slate-800/30 border border-slate-800/80 rounded-xl p-3 text-xs flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="truncate flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono text-slate-300 font-medium">
                              {item.protein_change}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium font-outfit uppercase truncate ${
                              getVariantBadgeColor(item.variant_type).split(" ")[0]
                            }`}>
                              {item.variant_type.split(" ")[0]}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono truncate block">
                            {item.reference_sequence.slice(0, 10)}... → {item.variant_sequence.slice(0, 10)}...
                          </span>
                        </div>
                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results visualization & AI interpretation panel */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {!result && !loading && (
                <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center h-full min-h-[450px]">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-500 mb-4">
                    <Dna size={36} className="text-slate-400 rotate-12" />
                  </div>
                  <h3 className="font-outfit text-lg font-semibold text-slate-200 mb-1">
                    Ready for Sequence Data
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    Enter DNA sequences or select a clinical preset to classify mutations and query the AI literature copilot.
                  </p>
                </div>
              )}

              {loading && (
                <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center h-full min-h-[450px]">
                  <RefreshCw size={36} className="text-purple-500 animate-spin mb-4" />
                  <h3 className="font-outfit text-lg font-semibold text-slate-200 mb-1">
                    Sequencing and Translating
                  </h3>
                  <p className="text-sm text-slate-500">
                    Aligning nucleotides, checking codon tables, and building physical mutation report...
                  </p>
                </div>
              )}

              {result && (
                <div className="flex flex-col gap-6 animate-fade-in printable-area">
                  
                  {/* Summary classification Card */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
                          Classification Report
                        </span>
                        <h2 className="font-outfit text-2xl font-bold text-slate-100 flex items-center gap-3">
                          {result.protein_change}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getVariantBadgeColor(result.variant_type)}`}>
                            {result.variant_type}
                          </span>
                        </h2>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={printReport}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-750 font-outfit text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Printer size={13} />
                          Print Report
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-sm leading-relaxed text-slate-300">
                      <p className="font-outfit font-semibold text-slate-200 mb-1 flex items-center gap-1.5 text-xs text-purple-400 uppercase tracking-wide">
                        <Info size={12} />
                        Molecular Impact Description
                      </p>
                      {result.impact_description}
                    </div>
                  </div>

                  {/* DNA / Protein Sequence alignment visualization */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-outfit text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <BarChart2 size={16} className="text-purple-400" />
                      Sequence Alignment & Codon Map
                    </h3>

                    {/* DNA Level Mapping */}
                    <div className="mb-6">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                        Nucleotide-Level Differences
                      </h4>
                      <div className="overflow-x-auto pb-2 font-mono text-xs">
                        <div className="min-w-max bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col gap-2.5">
                          {/* Reference Sequence */}
                          <div className="flex items-center">
                            <span className="w-10 text-[10px] text-slate-500 font-sans select-none">REF:</span>
                            <div className="flex gap-0.5">
                              {result.ref_sequence_codons.flatMap((codon, cIdx) => 
                                codon.split("").map((letter, lIdx) => {
                                  const nucleotideIndex = cIdx * 3 + lIdx;
                                  const isMismatched = result.variant_type !== "Frameshift" && 
                                    result.ref_sequence_codons[cIdx] !== result.alt_sequence_codons[cIdx] &&
                                    result.ref_sequence_codons[cIdx]?.[lIdx] !== result.alt_sequence_codons[cIdx]?.[lIdx];

                                  return (
                                    <span
                                      key={`ref-${nucleotideIndex}`}
                                      className={`w-6 h-7 inline-flex items-center justify-center rounded font-semibold transition-colors ${
                                        isMismatched
                                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/35"
                                          : "bg-slate-900 text-slate-400"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Mutation index markers */}
                          <div className="flex items-center">
                            <span className="w-10"></span>
                            <div className="flex gap-0.5">
                              {result.ref_sequence_codons.flatMap((codon, cIdx) => 
                                codon.split("").map((_, lIdx) => {
                                  const nucleotideIndex = cIdx * 3 + lIdx;
                                  const isMutPos = nucleotideIndex + 1 === result.mutation_position;

                                  return (
                                    <span
                                      key={`marker-${nucleotideIndex}`}
                                      className={`w-6 h-4 inline-flex items-center justify-center text-[9px] ${
                                        isMutPos ? "text-amber-400 font-bold" : "text-transparent"
                                      }`}
                                    >
                                      ▲
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Variant Sequence */}
                          <div className="flex items-center">
                            <span className="w-10 text-[10px] text-slate-500 font-sans select-none">ALT:</span>
                            <div className="flex gap-0.5">
                              {result.alt_sequence_codons.flatMap((codon, cIdx) => 
                                codon.split("").map((letter, lIdx) => {
                                  const nucleotideIndex = cIdx * 3 + lIdx;
                                  const isMismatched = result.variant_type !== "Frameshift" && 
                                    result.ref_sequence_codons[cIdx] !== result.alt_sequence_codons[cIdx] &&
                                    result.ref_sequence_codons[cIdx]?.[lIdx] !== result.alt_sequence_codons[cIdx]?.[lIdx];
                                  
                                  const isInserted = result.variant_type.includes("Insertion") && 
                                    nucleotideIndex + 1 >= result.mutation_position && 
                                    nucleotideIndex < result.mutation_position + (result.alt_sequence_codons.join("").length - result.ref_sequence_codons.join("").length);

                                  return (
                                    <span
                                      key={`alt-${nucleotideIndex}`}
                                      className={`w-6 h-7 inline-flex items-center justify-center rounded font-semibold transition-colors ${
                                        isMismatched
                                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/35"
                                          : isInserted
                                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/35"
                                          : "bg-slate-900 text-slate-400"
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Protein / Translation Codon Mapping */}
                    <div>
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                        Protein / Translation Block Map
                      </h4>
                      <div className="overflow-x-auto pb-2 font-mono text-xs">
                        <div className="min-w-max bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col gap-5">
                          
                          {/* Reference Translation Block */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-slate-500 font-sans mb-1">REFERENCE TRANSLATION:</span>
                            <div className="flex items-center gap-1.5">
                              {result.ref_detailed.map((block, index) => {
                                const isMismatched = result.variant_type !== "Frameshift" && 
                                  result.alt_detailed[index] && 
                                  block.aa !== result.alt_detailed[index].aa;

                                return (
                                  <div
                                    key={`ref-block-${index}`}
                                    className={`flex flex-col items-center border p-2 rounded-lg w-18 ${
                                      isMismatched
                                        ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                                        : "bg-slate-900/60 text-slate-400 border-slate-800"
                                    }`}
                                  >
                                    <span className="text-[10px] text-slate-500 font-sans select-none uppercase tracking-wide">
                                      Codon {index + 1}
                                    </span>
                                    <span className="font-bold text-xs">{block.codon}</span>
                                    <div className="border-t border-slate-800 w-full my-1" />
                                    <span className="font-sans font-bold text-xs uppercase text-slate-200">
                                      {block.aa}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Variant Translation Block */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-slate-500 font-sans mb-1">MUTANT TRANSLATION:</span>
                            <div className="flex items-center gap-1.5">
                              {result.alt_detailed.map((block, index) => {
                                const isMismatched = result.variant_type !== "Frameshift" && 
                                  result.ref_detailed[index] && 
                                  block.aa !== result.ref_detailed[index].aa;
                                const isInserted = result.variant_type.includes("Insertion") && 
                                  !result.ref_detailed[index];

                                return (
                                  <div
                                    key={`alt-block-${index}`}
                                    className={`flex flex-col items-center border p-2 rounded-lg w-18 ${
                                      isMismatched
                                        ? "bg-rose-500/10 text-rose-300 border-rose-500/30 font-bold"
                                        : isInserted
                                        ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                        : block.type === "Termination"
                                        ? "bg-red-950/40 text-red-400 border-red-900/40"
                                        : "bg-slate-900/60 text-slate-400 border-slate-800"
                                    }`}
                                  >
                                    <span className="text-[10px] text-slate-500 font-sans select-none uppercase tracking-wide">
                                      Codon {index + 1}
                                    </span>
                                    <span className="font-bold text-xs">{block.codon}</span>
                                    <div className="border-t border-slate-800 w-full my-1" />
                                    <span className={`font-sans font-bold text-xs uppercase ${
                                      isMismatched ? "text-rose-400" : "text-slate-200"
                                    }`}>
                                      {block.aa}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Quick Alignment String View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-slate-800 pt-6">
                      <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                          Protein Alignment String
                        </span>
                        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                          {result.ref_protein_list.map((aa, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="text-slate-600">-</span>}
                              <span className={result.alt_protein_list[i] !== aa ? "text-rose-400 font-bold bg-rose-500/10 px-1 rounded" : "text-slate-300"}>
                                {aa}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                          Mutated Protein Alignment String
                        </span>
                        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                          {result.alt_protein_list.map((aa, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="text-slate-600">-</span>}
                              <span className={result.ref_protein_list[i] !== aa ? "text-rose-400 font-bold bg-rose-500/10 px-1 rounded" : "text-slate-300"}>
                                {aa}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* AI Copilot & Literature Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Chat Panel */}
                    <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-[400px]">
                      <h3 className="font-outfit text-sm font-bold text-slate-200 mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="flex items-center gap-2">
                          <Sparkles size={16} className="text-purple-400 animate-pulse" />
                          AI Variant Literature Copilot
                        </span>
                        <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide">
                          Dynamic Context
                        </span>
                      </h3>

                      {/* Chat messages */}
                      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scroll-smooth text-xs pb-3">
                        {chatHistory.map((chat, idx) => (
                          <div
                            key={idx}
                            className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed border ${
                              chat.role === "user"
                                ? "bg-purple-600 text-white border-purple-500"
                                : "bg-slate-950/60 text-slate-300 border-slate-850"
                            }`}>
                              {chat.role === "assistant" ? (
                                <div className="space-y-2 whitespace-pre-wrap font-sans">
                                  {chat.content.split("\n\n").map((para, pIdx) => {
                                    if (para.startsWith("### ")) {
                                      return <h4 key={pIdx} className="font-bold text-slate-200 font-outfit text-sm pt-1">{para.replace("### ", "")}</h4>;
                                    }
                                    if (para.startsWith("**") && para.includes(":**")) {
                                      const parts = para.split(":**");
                                      return (
                                        <p key={pIdx} className="text-xs">
                                          <strong className="text-slate-100">{parts[0].replace("**", "")}:</strong>
                                          {parts.slice(1).join(":**")}
                                        </p>
                                      );
                                    }
                                    return <p key={pIdx}>{para}</p>;
                                  })}
                                </div>
                              ) : (
                                <p className="font-sans">{chat.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-950/60 text-slate-400 border border-slate-850 rounded-xl p-3 flex items-center gap-2">
                              <RefreshCw size={12} className="animate-spin text-purple-400" />
                              <span>Searching literature & ClinVar database...</span>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="mt-3 flex gap-2 border-t border-slate-800 pt-3">
                        <input
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                          placeholder="Ask: 'Is this pathogenic?' or 'What are the PMIDs?'"
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={sendChatMessage}
                          disabled={chatLoading || !chatMessage.trim()}
                          className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-850 disabled:text-slate-500 text-white p-2.5 rounded-xl cursor-pointer transition-colors"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Scientific Articles Panel */}
                    <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-[400px]">
                      <h3 className="font-outfit text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 border-b border-slate-800 pb-3">
                        <BookOpen size={16} className="text-purple-400" />
                        Relevant PubMed Literature
                      </h3>
                      
                      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                        {relevantArticles.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-center h-full py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                            <Info size={24} className="mb-2 text-slate-600" />
                            <span className="text-xs">No articles retrieved yet.</span>
                          </div>
                        ) : (
                          relevantArticles.map((article, aIdx) => (
                            <div
                              key={aIdx}
                              className="bg-slate-950/65 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 text-xs transition-colors flex flex-col gap-1.5"
                            >
                              <h4 className="font-bold text-slate-200 font-outfit leading-snug">
                                {article.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 italic">
                                {article.authors} — <span className="font-semibold text-purple-400">{article.journal}</span> ({article.year})
                              </p>
                              <div className="border-t border-slate-850 my-1 pt-1.5 text-[10.5px] text-slate-350 leading-relaxed">
                                {article.relevance}
                              </div>
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1.5 mt-1 border-t border-slate-850/50 pt-1.5 w-fit"
                              >
                                <ChevronRight size={10} />
                                PMID: {article.pmid} (PubMed Link)
                              </a>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* Batch mode container */}
        {activeTab === "batch" && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="font-outfit text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Upload size={18} className="text-purple-400" />
                Batch Sequence Analysis
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                Paste list of DNA sequence pairs (Reference, Variant) separated by commas, tabs or newlines.
              </p>

              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={6}
                placeholder="ATGAAAGGCTTT,ATGAGAGGCTTT&#10;ATGAAAGGCTTT,ATGAAAGGTTT&#10;ATGAAAGGCTTT,ATGAAAGGCGGCTTT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 placeholder:text-slate-650 focus:outline-none focus:border-purple-500 mb-4"
              />

              {batchError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs mb-4">
                  {batchError}
                </div>
              )}

              <button
                onClick={handleBatchAnalyze}
                disabled={batchLoading}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl font-outfit text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                {batchLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Analyzing Batch...
                  </>
                ) : (
                  <>
                    <Activity size={14} />
                    Run Batch Analysis
                  </>
                )}
              </button>
            </div>

            {batchResults.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-outfit text-sm font-bold text-slate-200 mb-4">
                  Batch Results ({batchResults.length})
                </h3>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                        <th className="p-3 font-mono font-medium">No.</th>
                        <th className="p-3">Ref Codons</th>
                        <th className="p-3">Alt Codons</th>
                        <th className="p-3">Variant Type</th>
                        <th className="p-3">Protein Change</th>
                        <th className="p-3">Ref Protein</th>
                        <th className="p-3">Alt Protein</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-900/20">
                      {batchResults.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-3 font-mono text-slate-500">{index + 1}</td>
                          <td className="p-3 font-mono text-purple-300 truncate max-w-[120px]">{item.ref_sequence_codons.join(" ")}</td>
                          <td className="p-3 font-mono text-indigo-300 truncate max-w-[120px]">{item.alt_sequence_codons.join(" ")}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getVariantBadgeColor(item.variant_type)}`}>
                              {item.variant_type}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-medium text-slate-200">{item.protein_change}</td>
                          <td className="p-3 font-mono text-slate-400 truncate max-w-[120px]">{item.reference_protein}</td>
                          <td className="p-3 font-mono text-slate-400 truncate max-w-[120px]">{item.variant_protein}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Codon Explorer Tab */}
        {activeTab === "codonExplorer" && (
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-outfit text-lg font-bold text-slate-100 flex items-center gap-2">
                    <BookOpen size={18} className="text-purple-400" />
                    Standard Genetic Codon Explorer
                  </h2>
                  <p className="text-xs text-slate-400">
                    Search codons, amino acids, or biochemical group names (e.g. Hydrophobic, Basic, Acidic, Polar).
                  </p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={codonSearch}
                    onChange={(e) => setCodonSearch(e.target.value)}
                    placeholder="Search amino acid or codon..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Codon Groups explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {Object.keys(CODON_GROUPS).map((group, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-xl p-3 flex flex-col justify-between ${CODON_GROUPS[group].color}`}
                  >
                    <span className="font-outfit font-bold text-xs">{group}</span>
                    <span className="text-[10px] opacity-80 mt-1 leading-snug">
                      {CODON_GROUPS[group].description}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {filteredCodons.map((item, idx) => {
                  // Find codon class group
                  const groupKey = Object.keys(CODON_GROUPS).find(g => 
                    CODON_GROUPS[g].aminoAcids.includes(item.aa)
                  ) || "Termination";
                  
                  const activeColor = CODON_GROUPS[groupKey].color;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCodon(item)}
                      className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 text-center ${
                        selectedCodon?.codon === item.codon
                          ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
                          : "bg-slate-950/65 border-slate-850 hover:bg-slate-850"
                      }`}
                    >
                      <span className="font-mono font-bold text-sm tracking-wide">{item.codon}</span>
                      <span className="text-xs uppercase font-outfit mt-1 font-semibold text-slate-200">
                        {item.aa}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Selected codon details modal-like panel */}
              {selectedCodon && (
                <div className="mt-8 bg-slate-950 border border-slate-850 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center min-w-32 self-center md:self-auto">
                    <span className="text-[10px] text-slate-500 block mb-1">Codon Triplet</span>
                    <span className="text-3xl font-mono font-bold text-purple-400">{selectedCodon.codon}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                      Amino Acid Details
                    </span>
                    <h3 className="font-outfit text-xl font-bold text-slate-200">
                      {selectedCodon.name} ({selectedCodon.aa})
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-slate-800 text-slate-300 border border-slate-750 px-2.5 py-1 rounded-lg text-xs font-mono">
                        Group: {Object.keys(CODON_GROUPS).find(g => CODON_GROUPS[g].aminoAcids.includes(selectedCodon.aa)) || "Termination"}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Codon {selectedCodon.codon} translates to {selectedCodon.name}. During variant interpretation, substituting this codon
                      for an amino acid with opposing chemical traits often affects polypeptide folding and structure.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "historyTab" && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h2 className="font-outfit text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Database size={18} className="text-purple-400" />
                    Variant Analysis Archive
                  </h2>
                  <p className="text-xs text-slate-400">
                    Full persistent search history of single and batch analysis runs in the SQLite database.
                  </p>
                </div>
                <button
                  onClick={fetchHistory}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl border border-slate-750 cursor-pointer transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {historyLoading ? (
                <div className="text-center py-12 text-slate-500">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  No records stored yet. Run an analysis on the dashboard.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadPastAnalysis(item)}
                      className="bg-slate-950/65 border border-slate-850 hover:bg-slate-850/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-mono text-slate-200 font-bold text-sm bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                            {item.protein_change}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getVariantBadgeColor(item.variant_type)}`}>
                            {item.variant_type}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-450 font-mono">
                          <span className="truncate">REF: {item.reference_sequence}</span>
                          <span className="truncate">ALT: {item.variant_sequence}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        <div className="text-right text-[10px] text-slate-500 font-mono">
                          {new Date(item.created_at).toLocaleDateString()}  <br />
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-slate-500 hover:text-rose-400 p-2.5 rounded-xl cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-8 text-center text-xs text-slate-500 font-sans mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 HelixVariant Engine. Developed for genetic variant classification, mutation translation, and literature exploration.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;