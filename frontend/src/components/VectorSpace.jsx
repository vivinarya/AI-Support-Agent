import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const VectorSpace = ({ isSearching }) => {
    const containerRef = useRef(null);


    const vizRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;


        class VectorDatabaseVisualization {
            constructor(container, options = {}) {
                this.container = container;
                this.options = {
                    particleCount: options.particleCount || 200,
                    connectionCount: options.connectionCount || 30,
                    particleColor: options.particleColor || 0xfacc15,
                    connectionColor: options.connectionColor || 0xfacc15,
                    backgroundColor: options.backgroundColor || 0x000000,
                    rotationSpeed: options.rotationSpeed || 0.001,
                    searchMode: false,
                    ...options
                };

                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.particles = null;
                this.lines = null;
                this.animationId = null;

                this.init();
            }

            init() {

                this.scene = new THREE.Scene();



                const width = this.container.clientWidth || 300;
                const height = this.container.clientHeight || 300;

                this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
                this.camera.position.z = 5;


                this.renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true
                });
                this.renderer.setSize(width, height);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.container.appendChild(this.renderer.domElement);


                this.createParticles();


                this.createConnections();


                this.addLighting();


                this.animate();


            }

            createParticles() {
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(this.options.particleCount * 3);
                const colors = new Float32Array(this.options.particleCount * 3);
                const sizes = new Float32Array(this.options.particleCount);

                const color = new THREE.Color(this.options.particleColor);

                for (let i = 0; i < this.options.particleCount; i++) {
                    const i3 = i * 3;


                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const radius = 2 + Math.random() * 3;

                    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                    positions[i3 + 2] = radius * Math.cos(phi);


                    colors[i3] = color.r + (Math.random() - 0.5) * 0.2;
                    colors[i3 + 1] = color.g + (Math.random() - 0.5) * 0.2;
                    colors[i3 + 2] = color.b + (Math.random() - 0.5) * 0.2;


                    sizes[i] = Math.random() * 0.1 + 0.05;
                }

                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));


                const material = new THREE.PointsMaterial({
                    size: 0.1,
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending,
                    sizeAttenuation: true
                });

                this.particles = new THREE.Points(geometry, material);
                this.scene.add(this.particles);


                this.originalPositions = positions.slice();
            }

            createConnections() {
                const lineGeometry = new THREE.BufferGeometry();
                const linePositions = [];

                const positions = this.particles.geometry.attributes.position.array;

                for (let i = 0; i < this.options.connectionCount; i++) {

                    const idx1 = Math.floor(Math.random() * this.options.particleCount);
                    const idx2 = Math.floor(Math.random() * this.options.particleCount);

                    if (idx1 !== idx2) {
                        const x1 = positions[idx1 * 3];
                        const y1 = positions[idx1 * 3 + 1];
                        const z1 = positions[idx1 * 3 + 2];

                        const x2 = positions[idx2 * 3];
                        const y2 = positions[idx2 * 3 + 1];
                        const z2 = positions[idx2 * 3 + 2];

                        linePositions.push(x1, y1, z1, x2, y2, z2);
                    }
                }

                lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

                const lineMaterial = new THREE.LineBasicMaterial({
                    color: this.options.connectionColor,
                    transparent: true,
                    opacity: 0.15,
                    blending: THREE.AdditiveBlending
                });

                this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
                this.scene.add(this.lines);
            }

            addLighting() {
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                this.scene.add(ambientLight);

                const pointLight = new THREE.PointLight(this.options.particleColor, 1, 100);
                pointLight.position.set(10, 10, 10);
                this.scene.add(pointLight);

                const pointLight2 = new THREE.PointLight(0x4444ff, 0.5, 100);
                pointLight2.position.set(-10, -10, -10);
                this.scene.add(pointLight2);
            }

            animate() {
                if (!this.renderer) return;

                this.animationId = requestAnimationFrame(() => this.animate());

                const time = Date.now() * 0.001;

                if (this.particles) {

                    this.particles.rotation.y += this.options.rotationSpeed;
                    this.particles.rotation.x += this.options.rotationSpeed * 0.5;

                    if (this.options.searchMode) {

                        this.particles.rotation.y += 0.02;
                        this.particles.rotation.x += 0.01;

                        const scale = 1 + Math.sin(time * 5) * 0.1;
                        this.particles.scale.setScalar(scale);


                        this.particles.material.opacity = 0.9 + Math.sin(time * 10) * 0.1;
                    } else {

                        const positions = this.particles.geometry.attributes.position.array;
                        for (let i = 0; i < this.options.particleCount; i++) {
                            const i3 = i * 3;

                            if (this.originalPositions && this.originalPositions[i3 + 1] !== undefined) {
                                positions[i3 + 1] = this.originalPositions[i3 + 1] + Math.sin(time + i * 0.1) * 0.1;
                            }
                        }
                        this.particles.geometry.attributes.position.needsUpdate = true;
                        this.particles.scale.setScalar(1);
                        this.particles.material.opacity = 0.8;
                    }
                }

                if (this.lines) {
                    this.lines.rotation.y = this.particles.rotation.y;
                    this.lines.rotation.x = this.particles.rotation.x;

                    if (this.options.searchMode) {
                        this.lines.material.opacity = 0.3 + Math.sin(time * 5) * 0.1;
                    } else {
                        this.lines.material.opacity = 0.15;
                    }
                }

                this.renderer.render(this.scene, this.camera);
            }

            resize() {
                if (!this.container || !this.camera || !this.renderer) return;
                const width = this.container.clientWidth;
                const height = this.container.clientHeight;

                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width, height);
            }

            setSearchMode(active) {
                this.options.searchMode = active;
            }

            destroy() {
                if (this.animationId) cancelAnimationFrame(this.animationId);

                this.renderer.dispose();

                this.container.removeChild(this.renderer.domElement);
                this.renderer = null;
            }
        }


        vizRef.current = new VectorDatabaseVisualization(containerRef.current, {
            backgroundColor: 0x000000
        });


        const resizeObserver = new ResizeObserver(() => {
            if (vizRef.current) vizRef.current.resize();
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (vizRef.current) vizRef.current.destroy();
        };
    }, []);


    useEffect(() => {
        if (vizRef.current) {
            vizRef.current.setSearchMode(isSearching);
        }
    }, [isSearching]);

    return (
        <div className="relative w-full h-full bg-black/40 border border-glassBorder rounded-3xl overflow-hidden backdrop-blur-md">

            <div ref={containerRef} className="w-full h-full" />


            <div className="absolute top-4 left-4 text-neon/80 text-xs pointer-events-none z-10 font-mono space-y-1">
                <div className={isSearching ? "animate-pulse text-white" : ""}>
                    VECTOR_SPACE: {isSearching ? "SEARCHING" : "ACTIVE"}
                </div>
                <div>DIMENSIONS: 384</div>
                <div>DISTANCE: COSINE</div>
                {isSearching && <div className="text-red-500 mt-1 animate-pulse">● SCANNING...</div>}
            </div>

            <div className="absolute bottom-4 right-4 text-right text-white/40 text-[10px] pointer-events-none font-mono space-y-1">
                <div>ENTITIES: 200</div>
                <div>CONNECTIONS: 30</div>
            </div>
        </div>
    );
};

export default VectorSpace;
