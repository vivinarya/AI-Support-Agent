import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, Database, Upload, FileText, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VectorSpace from "./components/VectorSpace";

function App() {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "System Online." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [ragActive, setRagActive] = useState(false);
    const [contextData, setContextData] = useState(null);


    const [showEntryModal, setShowEntryModal] = useState(false);
    const [newEntryTitle, setNewEntryTitle] = useState("");
    const [newEntryContent, setNewEntryContent] = useState("");
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setRagActive(true);
        setContextData(null);

        try {
            const response = await axios.post("http://127.0.0.1:8000/chat", {
                message: input,
            });

            setTimeout(() => {
                setRagActive(false);
                if (response.data.context_used && response.data.context_used !== "None") {
                    setContextData(response.data.context_used);
                }
            }, 1000); // Wait for animation

            const aiMessage = {
                role: "assistant",
                content: response.data.response
            };
            setMessages((prev) => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Connection Error.", isError: true }]);
            setIsLoading(false);
            setRagActive(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setMessages(prev => [...prev, { role: "assistant", content: `Uploading ${file.name}...` }]);
            await axios.post("http://127.0.0.1:8000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessages(prev => [...prev, { role: "assistant", content: `File '${file.name}' processed and added to knowledge base.` }]);
        } catch (error) {
            console.error("Upload Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Upload failed.", isError: true }]);
        }
    };

    const handleAddEntry = async () => {
        if (!newEntryTitle.trim() || !newEntryContent.trim()) return;

        try {
            await axios.post("http://127.0.0.1:8000/add-entry", {
                title: newEntryTitle,
                content: newEntryContent
            });
            setMessages(prev => [...prev, { role: "assistant", content: `New entry '${newEntryTitle}' added to knowledge base.` }]);
            setShowEntryModal(false);
            setNewEntryTitle("");
            setNewEntryContent("");
        } catch (error) {
            console.error("Add Entry Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Failed to add entry.", isError: true }]);
        }
    };

    return (
        <div className="h-screen bg-background text-gray-200 p-6 flex gap-6 font-sans overflow-hidden relative">


            <div className="hidden lg:flex flex-col w-64 gap-6">
                <div className="bg-glass border border-glassBorder p-6 rounded-3xl backdrop-blur-md">
                    <h1 className="text-2xl font-bold text-white mb-1">Agentic<span className="text-neon"> Assistant</span></h1>
                </div>

                <div className="bg-glass border border-glassBorder p-6 rounded-3xl backdrop-blur-md flex-1 flex flex-col gap-6 justify-center">
                    <div>
                        <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Upload size={14} /> Upload Documents
                        </h3>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 transition-colors group bg-black/20"
                        >
                            <FileText className="mx-auto text-gray-500 group-hover:text-neon mb-2 transition-colors" size={24} />
                            <p className="text-[10px] text-gray-400">Click to upload document</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Database size={14} /> Knowledge Base
                        </h3>
                        <button
                            onClick={() => setShowEntryModal(true)}
                            className="w-full py-3 bg-white/5 hover:bg-neon/10 hover:text-neon hover:border-neon/30 border border-white/10 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            <Plus size={14} /> New Entry
                        </button>
                    </div>
                </div>
            </div>


            <div className="flex-1 flex flex-col bg-glass border border-glassBorder rounded-3xl backdrop-blur-md shadow-2xl overflow-hidden relative z-10">

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden group border ${msg.role === "user"
                                ? "bg-white/5 text-white border-white/10"
                                : "bg-black/60 text-gray-300 border-white/5"
                                }`}>

                                <div className="flex items-center gap-2 mb-2 opacity-40 text-[10px] uppercase tracking-widest">
                                    {msg.role === "user" ? <User size={10} /> : <Bot size={10} />}
                                    {msg.role === "user" ? "User" : "Agent"}
                                    <span className="ml-auto text-white/20">Now</span>
                                </div>
                                <p className="leading-relaxed text-sm">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-widest p-4 animate-pulse">
                            <Loader2 className="animate-spin text-neon" size={14} />
                            Processing Vector Search...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>


                <div className="p-4 border-t border-white/5 bg-black/30 backdrop-blur-xl">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Ask system..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-neon/30 focus:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all text-white placeholder-gray-600 text-sm"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            className="absolute right-2 p-2 bg-neon/90 text-black rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_10px_rgba(204,255,0,0.4)]"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>


            <div className="hidden lg:flex flex-col w-96 gap-6">


                <div className="flex-1 min-h-[300px] rounded-3xl overflow-hidden relative shadow-lg border border-glassBorder bg-black/20">
                    <VectorSpace isSearching={ragActive} />
                </div>


                <div className="h-1/3 bg-glass border border-glassBorder rounded-3xl p-6 backdrop-blur-md flex flex-col">
                    <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Database size={14} /> Retrieved Context
                    </h3>

                    <div className="flex-1 bg-black/30 rounded-xl p-4 border border-white/5 overflow-y-auto custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                            {contextData ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-neon rounded-full animate-ping" />
                                    <p className="text-sm text-gray-300 italic font-light leading-relaxed">"{contextData}"</p>
                                    <div className="mt-4 flex gap-2 flex-wrap">
                                        <span className="text-[10px] bg-neon/10 text-neon border border-neon/20 px-2 py-1 rounded">Score: 0.92</span>
                                        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded">Source: Verified</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-50">
                                    <div className="w-12 h-12 rounded-full border border-dashed border-gray-600 flex items-center justify-center">
                                        <Database size={16} />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-widest text-center">Awaiting Query</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>


            <AnimatePresence>
                {showEntryModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-glass border border-glassBorder p-6 rounded-3xl w-full max-w-md shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowEntryModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-neon" /> Add Knowledge
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Title / ID</label>
                                    <input
                                        type="text"
                                        value={newEntryTitle}
                                        onChange={(e) => setNewEntryTitle(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-neon/50 outline-none text-white text-sm"
                                        placeholder="e.g. return_policy_v2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Content</label>
                                    <textarea
                                        value={newEntryContent}
                                        onChange={(e) => setNewEntryContent(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-neon/50 outline-none text-white text-sm h-32 resize-none"
                                        placeholder="Enter the knowledge context here..."
                                    />
                                </div>

                                <button
                                    onClick={handleAddEntry}
                                    className="w-full py-3 bg-neon text-black font-semibold rounded-xl hover:bg-neon/90 transition-transform active:scale-95"
                                >
                                    Save to Database
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default App;
