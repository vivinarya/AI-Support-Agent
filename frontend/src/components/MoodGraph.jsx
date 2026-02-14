import { motion } from "framer-motion";

const MoodGraph = () => {
    return (
        <div className="relative w-full h-48 bg-glass border border-glassBorder rounded-2xl overflow-hidden backdrop-blur-md p-4">
            <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-4 flex justify-between">
                <span>Mood graph</span>
                <span className="cursor-pointer hover:text-white">→</span>
            </h3>

            <div className="relative w-full h-full flex items-center justify-center">
                {/* Concentric Circles / Radar Chart Grid */}
                <div className="absolute border border-white/5 rounded-full w-32 h-32" />
                <div className="absolute border border-white/5 rounded-full w-20 h-20" />
                <div className="absolute border border-white/5 rounded-full w-8 h-8" />

                {/* Axis Lines */}
                <div className="absolute w-full h-[1px] bg-white/5" />
                <div className="absolute h-full w-[1px] bg-white/5" />
                <div className="absolute w-full h-[1px] bg-white/5 rotate-45" />
                <div className="absolute h-full w-[1px] bg-white/5 rotate-45" />

                {/* Animated Mood Shape */}
                <motion.svg
                    viewBox="0 0 100 100"
                    className="absolute w-32 h-32 overflow-visible"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <motion.path
                        d="M50 10 L80 40 L60 80 L40 80 L20 40 Z"
                        fill="none"
                        stroke="#ccff00"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        initial={{ d: "M50 15 L85 45 L65 85 L35 85 L15 45 Z" }}
                        animate={{
                            d: [
                                "M50 15 L85 45 L65 85 L35 85 L15 45 Z",
                                "M50 5 L90 35 L70 95 L30 95 L10 35 Z",
                                "M50 20 L80 40 L60 80 L40 80 L20 40 Z",
                                "M50 15 L85 45 L65 85 L35 85 L15 45 Z"
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path
                        d="M50 20 L80 40 L60 80 L40 80 L20 40 Z"
                        fill="rgba(204, 255, 0, 0.1)"
                        stroke="none"
                        animate={{
                            d: [
                                "M50 25 L75 45 L65 75 L35 75 L25 45 Z",
                                "M50 15 L80 35 L70 85 L30 85 L20 35 Z",
                                "M50 25 L75 45 L65 75 L35 75 L25 45 Z"
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.svg>

                {/* Star decorations */}
                <div className="absolute top-4 right-8 text-white/20 text-[8px]">+</div>
                <div className="absolute bottom-8 left-6 text-white/20 text-[8px]">+</div>
            </div>
        </div>
    );
};

export default MoodGraph;
