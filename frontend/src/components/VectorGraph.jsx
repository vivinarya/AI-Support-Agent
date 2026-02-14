import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const VectorGraph = ({ isSearching, contextFound }) => {
    // Generate static nodes pattern to look like the image
    const [nodes] = useState(
        Array.from({ length: 12 }).map((_, i) => ({
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60,
            size: i === 0 ? 8 : Math.random() * 3 + 2, // Center node bigger
            isCenter: i === 0
        }))
    );

    return (
        <div className="relative w-full h-64 bg-glass border border-glassBorder rounded-2xl overflow-hidden backdrop-blur-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 text-xs uppercase tracking-widest">Mindmap</h3>
                <span className="text-white/20 cursor-pointer hover:text-white">→</span>
            </div>

            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* The Graph */}
            <div className="relative w-full h-full">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Lines connecting center to others */}
                    {nodes.slice(1).map((node, i) => (
                        <motion.line
                            key={i}
                            x1={`${nodes[0].x}%`}
                            y1={`${nodes[0].y}%`}
                            x2={`${node.x}%`}
                            y2={`${node.y}%`}
                            stroke={isSearching ? "#ccff00" : "rgba(255,255,255,0.2)"}
                            strokeWidth={isSearching ? "1" : "0.5"}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: i * 0.05 }}
                        />
                    ))}
                </svg>

                {nodes.map((node, i) => (
                    <motion.div
                        key={i}
                        className={`absolute rounded-full ${node.isCenter ? 'bg-neon z-10' : 'bg-gray-500'}`}
                        style={{
                            width: node.size,
                            height: node.size,
                            top: `calc(${node.y}% - ${node.size / 2}px)`,
                            left: `calc(${node.x}% - ${node.size / 2}px)`,
                        }}
                        animate={isSearching && node.isCenter ? {
                            boxShadow: ["0 0 0 rgba(204,255,0,0)", "0 0 20px rgba(204,255,0,0.6)", "0 0 0 rgba(204,255,0,0)"]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {/* Static decorative stars around */}
                        {i % 3 === 0 && !node.isCenter && (
                            <div className="absolute -top-4 -right-4 text-white/20 text-[6px]">+</div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default VectorGraph;