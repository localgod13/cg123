import * as THREE from 'https://unpkg.com/three@0.176.0/build/three.module.js';

/**
 * Three.js Renderer for game effects
 * 
 * IMPORTANT: All spell effects (including meteor, fireball, inferno, etc.) must be triggered
 * AFTER their corresponding attack animation completes. This ensures proper visual sequencing
 * where the attack animation plays first, followed by the spell effect.
 * 
 * The timing is handled in the Game class's executeQueuedAttacks method, which waits for
 * the attack animation to complete before triggering spell effects.
 */
export class ThreeRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.effects = new Map();
        this.initialized = false;
        this.clock = new THREE.Clock();
    }

    initialize() {
        if (this.initialized) return;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = null;

        // Create camera with proper viewport settings
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(
            -window.innerWidth / 2,  // left
            window.innerWidth / 2,   // right
            window.innerHeight / 2,  // top
            -window.innerHeight / 2, // bottom
            0.1,
            1000
        );
        this.camera.position.z = 1;

        // Create renderer with proper transparency settings
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true,
            premultipliedAlpha: false
        });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Style the canvas
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.pointerEvents = 'none';
        this.renderer.domElement.style.zIndex = '1000';

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        this.initialized = true;
    }

    onWindowResize() {
        if (!this.initialized) return;
        
        // Update camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = -window.innerWidth / 2;
        this.camera.right = window.innerWidth / 2;
        this.camera.top = window.innerHeight / 2;
        this.camera.bottom = -window.innerHeight / 2;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createMeteorEffect(targetX, targetY, onMeteorAppear) {
        if (!this.initialized) this.initialize();

        // Convert screen coordinates to Three.js coordinates
        const x = targetX - window.innerWidth / 2;
        const y = -targetY + window.innerHeight / 2;

        // Create meteor group
        const meteorGroup = new THREE.Group();
        this.scene.add(meteorGroup);

        // Load the meteor texture
        const textureLoader = new THREE.TextureLoader();
        const meteorTexture = textureLoader.load('assets/Images/flaming_meteor.png');
        const flameTexture = textureLoader.load('assets/Sprites/fire/burning_loop_4.png');
        
        // Set up the flame texture properly
        flameTexture.wrapS = THREE.RepeatWrapping;
        flameTexture.wrapT = THREE.RepeatWrapping;
        flameTexture.repeat.set(1/6, 1); // 6 columns
        flameTexture.offset.set(0, 0);

        // Create six meteors with positions relative to the target
        const meteorPositions = [
            { x: x - 150, y: y + 800 }, // Far left
            { x: x - 75, y: y + 800 },  // Left
            { x: x, y: y + 800 },       // Center
            { x: x + 75, y: y + 800 },  // Right
            { x: x + 150, y: y + 800 }, // Far right
            { x: x, y: y + 900 }        // Center back (will be 2x larger)
        ];

        const meteors = meteorPositions.map((pos, index) => {
            // Create meteor geometry (square plane to show the image)
            const isFinalMeteor = index === 5; // Check if this is the final meteor
            const size = isFinalMeteor ? 200 : 100; // Double size for final meteor
            const geometry = new THREE.PlaneGeometry(size, size);
            
            // Create meteor material
            const material = new THREE.MeshBasicMaterial({
                map: meteorTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });

            const meteor = new THREE.Mesh(geometry, material);
            meteor.position.set(pos.x, pos.y, 0);
            meteorGroup.add(meteor);

            // Create flame trail
            const flameSize = isFinalMeteor ? 120 : 60; // Double size for final meteor
            const flameGeometry = new THREE.PlaneGeometry(flameSize, flameSize);
            const flameMaterial = new THREE.MeshBasicMaterial({
                map: flameTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });

            const flame = new THREE.Mesh(flameGeometry, flameMaterial);
            flame.position.set(pos.x, pos.y + size/2, -0.1); // Position behind meteor
            meteorGroup.add(flame);

            // Create particle system for impact effect
            const particleCount = isFinalMeteor ? 200 : 100; // Double particles for final meteor
            const particleGeometry = new THREE.BufferGeometry();
            const particlePositions = new Float32Array(particleCount * 3);
            const particleSizes = new Float32Array(particleCount);
            const particleVelocities = [];
            
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const radius = Math.random() * (isFinalMeteor ? 60 : 30); // Double radius for final meteor
                particlePositions[i * 3] = pos.x + Math.cos(angle) * radius;
                particlePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
                particlePositions[i * 3 + 2] = 0;
                particleSizes[i] = Math.random() * (isFinalMeteor ? 16 : 8) + (isFinalMeteor ? 8 : 4); // Double size for final meteor
                
                // Store velocity for each particle with increased speed
                const speed = isFinalMeteor ? 8 : 4; // Double speed for final meteor
                particleVelocities.push({
                    x: Math.cos(angle) * (speed + Math.random() * speed),
                    y: Math.sin(angle) * (speed + Math.random() * speed)
                });
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
            particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

            const particleMaterial = new THREE.PointsMaterial({
                map: meteorTexture,
                color: 0xff4400,
                size: isFinalMeteor ? 16 : 8, // Double base size for final meteor
                transparent: true,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            });

            const particles = new THREE.Points(particleGeometry, particleMaterial);
            particles.visible = false;
            meteorGroup.add(particles);

            return {
                meteor,
                flame,
                particles,
                particleVelocities,
                startDelay: index * 150, // Reduced delay between meteors
                speed: isFinalMeteor ? -20 : -15, // Faster speed for final meteor
                impactTime: null,
                lastFrameTime: 0,
                currentFrame: 0,
                hasPlayedSound: false // Track if sound has been played for this meteor
            };
        });

        const effect = {
            group: meteorGroup,
            meteors,
            startTime: performance.now(),
            duration: 1500,
            active: true,
            update: (deltaTime) => {
                const elapsed = performance.now() - effect.startTime;
                
                meteors.forEach(meteor => {
                    if (elapsed >= meteor.startDelay) {
                        const meteorElapsed = elapsed - meteor.startDelay;
                        const progress = Math.min(meteorElapsed / 1000, 1);
                        
                        // Play sound when meteor first appears
                        if (!meteor.hasPlayedSound && onMeteorAppear) {
                            onMeteorAppear();
                            meteor.hasPlayedSound = true;
                        }
                        
                        // Move meteor downward
                        meteor.meteor.position.y = y + 800 - (progress * 800);
                        
                        // Update flame position and animation
                        meteor.flame.position.y = meteor.meteor.position.y + (meteor.meteor.geometry.parameters.height/2);
                        
                        // Animate flame sprite
                        const now = performance.now();
                        if (now - meteor.lastFrameTime >= 100) { // 100ms per frame
                            meteor.currentFrame = (meteor.currentFrame + 1) % 6;
                            if (meteor.flame.material && meteor.flame.material.map) {
                                meteor.flame.material.map.offset.x = meteor.currentFrame / 6;
                            }
                            meteor.lastFrameTime = now;
                        }
                        
                        // Check for impact
                        if (progress > 0.8 && !meteor.impactTime) {
                            meteor.impactTime = elapsed;
                            meteor.meteor.visible = false;
                            meteor.flame.visible = false;
                            meteor.particles.visible = true;
                        }
                        
                        // Update particles if impact has occurred
                        if (meteor.impactTime) {
                            const impactElapsed = elapsed - meteor.impactTime;
                            const impactProgress = Math.min(impactElapsed / 800, 1); // Increased duration
                            
                            const positions = meteor.particles.geometry.attributes.position.array;
                            const sizes = meteor.particles.geometry.attributes.size.array;
                            
                            for (let i = 0; i < positions.length / 3; i++) {
                                const velocity = meteor.particleVelocities[i];
                                positions[i * 3] += velocity.x * (1 - impactProgress * 0.5); // Slower fade
                                positions[i * 3 + 1] += velocity.y * (1 - impactProgress * 0.5); // Slower fade
                                sizes[i] *= 0.98; // Slower size reduction
                            }
                            
                            meteor.particles.geometry.attributes.position.needsUpdate = true;
                            meteor.particles.geometry.attributes.size.needsUpdate = true;
                        }
                    }
                });
                
                // Check if effect is complete
                if (elapsed > effect.duration) {
                    effect.active = false;
                    this.scene.remove(effect.group);
                    this.effects.delete(effect);
                }
            }
        };

        this.effects.set(Date.now(), effect);
        this.animate();
    }

    createFireballEffect(startX, startY, endX, endY) {
        if (!this.initialized) this.initialize();

        // Convert screen coordinates to Three.js coordinates
        const startX3D = startX - window.innerWidth / 2;
        const startY3D = -startY + window.innerHeight / 2;
        const endX3D = endX - window.innerWidth / 2;
        const endY3D = -endY + window.innerHeight / 2;

        // Create fireball group
        const fireballGroup = new THREE.Group();
        this.scene.add(fireballGroup);

        // Load textures
        const textureLoader = new THREE.TextureLoader();
        const fireballTexture = textureLoader.load('assets/Images/fireball.png');
        const flameTexture = textureLoader.load('assets/Sprites/fire/burning_loop_4.png');

        // Set up flame texture
        flameTexture.wrapS = THREE.RepeatWrapping;
        flameTexture.wrapT = THREE.RepeatWrapping;
        flameTexture.repeat.set(1/6, 1);
        flameTexture.offset.set(0, 0);

        // Create fireball geometry (square plane to show the image)
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshBasicMaterial({
            map: fireballTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });

        const fireball = new THREE.Mesh(geometry, material);
        fireball.position.set(startX3D, startY3D, 0);
        // Flip the sprite horizontally by setting negative scale on X axis
        fireball.scale.x = -1;
        fireballGroup.add(fireball);

        // Create central explosion burst
        const explosionGeometry = new THREE.PlaneGeometry(200, 200);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            map: flameTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            opacity: 0
        });
        const centralBurst = new THREE.Mesh(explosionGeometry, explosionMaterial);
        centralBurst.position.set(endX3D, endY3D, 0);
        centralBurst.visible = false;
        fireballGroup.add(centralBurst);

        // Create expanding rings for explosion
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(50 + i * 25, 60 + i * 25, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(endX3D, endY3D, 0);
            ring.scale.set(0, 0, 0);
            ring.visible = false;
            fireballGroup.add(ring);
            rings.push(ring);
        }

        // Create ember particles
        const emberCount = 50;
        const emberGeometry = new THREE.BufferGeometry();
        const emberPositions = new Float32Array(emberCount * 3);
        const emberSizes = new Float32Array(emberCount);
        const emberVelocities = [];
        
        for (let i = 0; i < emberCount; i++) {
            const angle = (i / emberCount) * Math.PI * 2;
            const radius = Math.random() * 10;
            emberPositions[i * 3] = endX3D + Math.cos(angle) * radius;
            emberPositions[i * 3 + 1] = endY3D + Math.sin(angle) * radius;
            emberPositions[i * 3 + 2] = 0;
            emberSizes[i] = Math.random() * 6 + 3;
            
            const speed = 3 + Math.random() * 4;
            emberVelocities.push({
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed + 2 // Add upward bias
            });
        }
        
        emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
        emberGeometry.setAttribute('size', new THREE.BufferAttribute(emberSizes, 1));

        const emberMaterial = new THREE.PointsMaterial({
            map: flameTexture,
            color: 0xff8800,
            size: 4,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const embers = new THREE.Points(emberGeometry, emberMaterial);
        embers.visible = false;
        fireballGroup.add(embers);

        // Create burst particles
        const burstParticleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(burstParticleCount * 3);
        const particleSizes = new Float32Array(burstParticleCount);
        const burstVelocities = [];
        
        for (let i = 0; i < burstParticleCount; i++) {
            const angle = (i / burstParticleCount) * Math.PI * 2;
            const radius = Math.random() * 20;
            particlePositions[i * 3] = endX3D + Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = endY3D + Math.sin(angle) * radius;
            particlePositions[i * 3 + 2] = 0;
            particleSizes[i] = Math.random() * 8 + 4;
            
            const speed = 4 + Math.random() * 5;
            burstVelocities.push({
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff4400,
            size: 6,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const burstParticles = new THREE.Points(particleGeometry, particleMaterial);
        burstParticles.visible = false;
        fireballGroup.add(burstParticles);

        const effect = {
            group: fireballGroup,
            fireball,
            centralBurst,
            rings,
            embers,
            emberVelocities,
            burstParticles,
            burstVelocities,
            startX: startX3D,
            startY: startY3D,
            endX: endX3D,
            endY: endY3D,
            startTime: performance.now(),
            duration: 800,
            impactTime: null,
            active: true,
            update: (deltaTime) => {
                const elapsed = performance.now() - effect.startTime;
                const progress = Math.min(elapsed / effect.duration, 1);
                
                // Calculate direction and rotation
                const dx = effect.endX - effect.startX;
                const dy = effect.endY - effect.startY;
                const angle = Math.atan2(dy, dx);
                
                // Update fireball position in a straight line
                const currentX = effect.startX + dx * progress;
                const currentY = effect.startY + dy * progress;
                effect.fireball.position.set(currentX, currentY, 0);
                
                // Rotate fireball to face direction of travel
                effect.fireball.rotation.z = angle;
                
                // Add subtle pulsing while maintaining the horizontal flip
                const pulseScale = 0.9 + 0.1 * Math.sin(elapsed / 1000 * Math.PI * 2);
                effect.fireball.scale.set(-pulseScale, pulseScale, pulseScale);

                // Check for impact
                if (progress > 0.9 && !effect.impactTime) {
                    effect.impactTime = elapsed;
                    effect.fireball.visible = false;
                    effect.centralBurst.visible = true;
                    effect.burstParticles.visible = true;
                    effect.embers.visible = true;
                    effect.rings.forEach(ring => ring.visible = true);
                }

                // Update explosion effects if impact has occurred
                if (effect.impactTime) {
                    const impactElapsed = elapsed - effect.impactTime;
                    const impactProgress = Math.min(impactElapsed / 400, 1);

                    // Animate central burst
                    if (effect.centralBurst.material && effect.centralBurst.material.map) {
                        const frame = Math.floor((impactElapsed / 50) % 6);
                        effect.centralBurst.material.map.offset.x = frame / 6;
                        effect.centralBurst.material.opacity = 1 - impactProgress;
                        effect.centralBurst.scale.set(
                            1 + impactProgress * 0.5,
                            1 + impactProgress * 0.5,
                            1
                        );
                    }

                    // Animate rings
                    effect.rings.forEach((ring, index) => {
                        const ringProgress = Math.min((impactProgress - index * 0.1) * 1.5, 1);
                        if (ringProgress > 0) {
                            ring.scale.set(ringProgress, ringProgress, 1);
                            ring.material.opacity = 0.6 * (1 - ringProgress);
                        }
                    });

                    // Update ember particles
                    const emberPositions = effect.embers.geometry.attributes.position.array;
                    const emberSizes = effect.embers.geometry.attributes.size.array;
                    
                    for (let i = 0; i < emberPositions.length / 3; i++) {
                        const velocity = effect.emberVelocities[i];
                        emberPositions[i * 3] += velocity.x * (1 - impactProgress * 0.5);
                        emberPositions[i * 3 + 1] += velocity.y * (1 - impactProgress * 0.5);
                        emberSizes[i] *= 0.97;
                        
                        // Add gravity effect to embers
                        velocity.y -= 0.1;
                    }
                    
                    effect.embers.geometry.attributes.position.needsUpdate = true;
                    effect.embers.geometry.attributes.size.needsUpdate = true;

                    // Update burst particles
                    const burstPositions = effect.burstParticles.geometry.attributes.position.array;
                    const burstSizes = effect.burstParticles.geometry.attributes.size.array;
                    
                    for (let i = 0; i < burstPositions.length / 3; i++) {
                        const velocity = effect.burstVelocities[i];
                        burstPositions[i * 3] += velocity.x * (1 - impactProgress * 0.5);
                        burstPositions[i * 3 + 1] += velocity.y * (1 - impactProgress * 0.5);
                        burstSizes[i] *= 0.95;
                    }
                    
                    effect.burstParticles.geometry.attributes.position.needsUpdate = true;
                    effect.burstParticles.geometry.attributes.size.needsUpdate = true;
                }
                
                // Check if effect is complete
                if (elapsed > effect.duration) {
                    effect.active = false;
                    this.scene.remove(effect.group);
                    this.effects.delete(effect);
                }
            }
        };

        this.effects.set(Date.now(), effect);
        this.animate();
    }

    createInfernoEffect(centerX, topY, width, height) {
        if (!this.initialized) this.initialize();

        // Convert screen coordinates to Three.js coordinates
        const x = centerX - window.innerWidth / 2;
        const y = -topY + window.innerHeight / 2;

        // Create inferno group
        const infernoGroup = new THREE.Group();
        this.scene.add(infernoGroup);

        // Create main fire pillar
        const pillarGeometry = new THREE.PlaneGeometry(width, height);
        const pillarMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xff4400) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                float noise(vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);
                    
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));

                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                }
                
                void main() {
                    vec2 uv = vUv;
                    
                    // Create turbulent fire effect
                    float turbulence = noise(vec2(uv.x * 8.0 + time * 2.0, uv.y * 4.0)) * 0.2;
                    float fire = 1.0 - smoothstep(0.0, 1.0, abs(uv.x - 0.5) * 2.0);
                    fire *= 1.0 + turbulence;
                    
                    // Add flicker
                    float flicker = 0.8 + 0.2 * sin(time * 10.0);
                    fire *= flicker;
                    
                    // Mix colors from white core to orange to red
                    vec3 finalColor = mix(color, vec3(1.0, 0.8, 0.0), fire * 0.8);
                    finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), fire * 0.3);
                    
                    // Add glow
                    float glow = smoothstep(0.5, 0.0, abs(uv.x - 0.5) * 2.0) * 0.8;
                    finalColor += vec3(1.0, 0.5, 0.0) * glow;
                    
                    gl_FragColor = vec4(finalColor, fire);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, y, 0);
        infernoGroup.add(pillar);

        // Create particle system for embers
        const emberCount = 200;
        const emberGeometry = new THREE.BufferGeometry();
        const emberPositions = new Float32Array(emberCount * 3);
        const emberSizes = new Float32Array(emberCount);
        const emberVelocities = [];
        
        for (let i = 0; i < emberCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * width * 0.4;
            emberPositions[i * 3] = x + Math.cos(angle) * radius;
            emberPositions[i * 3 + 1] = y + Math.sin(angle) * radius;
            emberPositions[i * 3 + 2] = 0;
            emberSizes[i] = Math.random() * 4 + 2;
            
            // Store velocity for each ember with upward bias
            emberVelocities.push({
                x: (Math.random() - 0.5) * 2,
                y: Math.random() * 4 + 2 // Strong upward bias
            });
        }
        
        emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
        emberGeometry.setAttribute('size', new THREE.BufferAttribute(emberSizes, 1));

        const emberMaterial = new THREE.PointsMaterial({
            color: 0xff8800,
            size: 3,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const embers = new THREE.Points(emberGeometry, emberMaterial);
        infernoGroup.add(embers);

        // Create heat distortion effect
        const distortionGeometry = new THREE.PlaneGeometry(width * 1.5, height * 1.5);
        const distortionMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    vec2 uv = vUv;
                    float distortion = sin(uv.y * 10.0 + time * 2.0) * 0.02;
                    uv.x += distortion;
                    
                    float alpha = smoothstep(0.5, 0.0, length(uv - vec2(0.5)));
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.1);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const distortion = new THREE.Mesh(distortionGeometry, distortionMaterial);
        distortion.position.set(x, y, 0);
        infernoGroup.add(distortion);

        let isDestroyed = false;
        const effect = {
            group: infernoGroup,
            pillar,
            embers,
            distortion,
            emberVelocities,
            startTime: performance.now(),
            duration: 1000,
            active: true,
            update: (deltaTime) => {
                const elapsed = performance.now() - effect.startTime;
                const progress = Math.min(elapsed / effect.duration, 1);
                
                // Update pillar
                effect.pillar.material.uniforms.time.value = elapsed / 1000;
                
                // Phase 1: Rise up (0-0.3)
                if (progress < 0.3) {
                    const riseProgress = progress / 0.3;
                    effect.pillar.scale.set(1, riseProgress, 1);
                    effect.pillar.material.opacity = riseProgress;
                }
                // Phase 2: Full effect (0.3-0.7)
                else if (progress < 0.7) {
                    effect.pillar.scale.set(1, 1, 1);
                    effect.pillar.material.opacity = 1;
                }
                // Phase 3: Fade out (0.7-1.0)
                else {
                    const fadeProgress = (progress - 0.7) / 0.3;
                    effect.pillar.material.opacity = 1 - fadeProgress;
                }
                
                // Update embers
                const positions = effect.embers.geometry.attributes.position.array;
                const sizes = effect.embers.geometry.attributes.size.array;
                
                for (let i = 0; i < positions.length / 3; i++) {
                    const velocity = effect.emberVelocities[i];
                    positions[i * 3] += velocity.x * deltaTime;
                    positions[i * 3 + 1] += velocity.y * deltaTime;
                    sizes[i] *= 0.98;
                    
                    // Reset embers that go too high
                    if (positions[i * 3 + 1] > y + height) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.random() * width * 0.4;
                        positions[i * 3] = x + Math.cos(angle) * radius;
                        positions[i * 3 + 1] = y + Math.sin(angle) * radius;
                        sizes[i] = Math.random() * 4 + 2;
                        velocity.y = Math.random() * 4 + 2;
                    }
                }
                
                effect.embers.geometry.attributes.position.needsUpdate = true;
                effect.embers.geometry.attributes.size.needsUpdate = true;
                
                // Update heat distortion
                effect.distortion.material.uniforms.time.value = elapsed / 1000;
                effect.distortion.material.opacity = effect.pillar.material.opacity * 0.5;
                
                // Check if effect is complete
                if (elapsed > effect.duration) {
                    cleanup();
                }
            }
        };

        const cleanup = () => {
            if (isDestroyed) return;
            isDestroyed = true;
            effect.active = false;
            if (this.scene) {
                this.scene.remove(effect.group);
            }
            if (effect.pillar) {
                effect.pillar.geometry.dispose();
                effect.pillar.material.dispose();
            }
            if (effect.embers) {
                effect.embers.geometry.dispose();
                effect.embers.material.dispose();
            }
            if (effect.distortion) {
                effect.distortion.geometry.dispose();
                effect.distortion.material.dispose();
            }
            this.effects.delete(effect);
        };

        this.effects.set(Date.now(), effect);
        this.animate();

        // Return cleanup function
        return cleanup;
    }

    createFireBoltEffect(startX, startY, endX, endY) {
        if (!this.initialized) this.initialize();

        // Convert screen coordinates to Three.js coordinates
        const startX3D = startX - window.innerWidth / 2;
        const startY3D = -startY + window.innerHeight / 2;
        const endX3D = endX - window.innerWidth / 2;
        const endY3D = -endY + window.innerHeight / 2;

        // Create fire bolt group
        const boltGroup = new THREE.Group();
        this.scene.add(boltGroup);

        // Calculate bolt direction and length
        const dx = endX3D - startX3D;
        const dy = endY3D - startY3D;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Load the Blaze texture
        const textureLoader = new THREE.TextureLoader();
        const blazeTexture = textureLoader.load('assets/Images/Blaze.png');

        // Prevent texture bleeding
        blazeTexture.wrapS = THREE.ClampToEdgeWrapping;
        blazeTexture.wrapT = THREE.ClampToEdgeWrapping;
        blazeTexture.minFilter = THREE.LinearFilter;
        blazeTexture.magFilter = THREE.LinearFilter;

        // Create bolt geometry - using a square for the traveling image
        const geometry = new THREE.PlaneGeometry(100, 100);
        
        // Create bolt material
        const material = new THREE.MeshBasicMaterial({
            map: blazeTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });

        const bolt = new THREE.Mesh(geometry, material);
        bolt.position.set(startX3D, startY3D, 0);
        bolt.rotation.z = angle;
        boltGroup.add(bolt);

        // Create impact effect
        const impactGeometry = new THREE.CircleGeometry(50, 32);
        const impactMaterial = new THREE.MeshBasicMaterial({
            map: blazeTexture,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const impact = new THREE.Mesh(impactGeometry, impactMaterial);
        impact.position.set(endX3D, endY3D, 0);
        impact.visible = false;
        boltGroup.add(impact);

        const effect = {
            group: boltGroup,
            bolt,
            impact,
            startTime: performance.now(),
            duration: 400,
            active: true,
            update: (deltaTime) => {
                const elapsed = performance.now() - effect.startTime;
                const progress = Math.min(elapsed / effect.duration, 1);
                
                // Move the bolt along the path
                const currentX = startX3D + dx * progress;
                const currentY = startY3D + dy * progress;
                effect.bolt.position.set(currentX, currentY, 0);

                // Add some rotation for effect
                effect.bolt.rotation.z = angle + Math.sin(elapsed / 1000 * Math.PI * 4) * 0.2;

                // Show impact effect at the end
                if (progress > 0.8) {
                    effect.impact.visible = true;
                    effect.impact.material.opacity = (1 - (progress - 0.8) * 5);
                }
                
                // Check if effect is complete
                if (elapsed > effect.duration) {
                    effect.active = false;
                    this.scene.remove(effect.group);
                    this.effects.delete(effect);
                }
            }
        };

        this.effects.set(Date.now(), effect);
        this.animate();
    }

    createPyroclasmEffect(mageX, mageY) {
        if (!this.initialized) this.initialize();

        // Convert screen coordinates to Three.js coordinates
        const x = mageX - window.innerWidth / 2;
        const y = -mageY + window.innerHeight / 2;

        // Create pyroclasm group
        const pyroclasmGroup = new THREE.Group();
        this.scene.add(pyroclasmGroup);

        // Create initial ring of fire
        const ringGeometry = new THREE.RingGeometry(50, 60, 64);
        const ringMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xff4400) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                float noise(vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);
                    
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));

                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
                }
                
                void main() {
                    vec2 uv = vUv;
                    
                    // Create fire effect
                    float fire = 1.0 - smoothstep(0.0, 1.0, abs(uv.x - 0.5) * 2.0);
                    float turbulence = noise(vec2(uv.x * 10.0 + time * 2.0, uv.y * 5.0)) * 0.2;
                    fire *= 1.0 + turbulence;
                    
                    // Add flicker
                    float flicker = 0.8 + 0.2 * sin(time * 10.0);
                    fire *= flicker;
                    
                    // Mix colors
                    vec3 finalColor = mix(color, vec3(1.0, 0.8, 0.0), fire);
                    
                    // Add glow
                    float glow = smoothstep(0.5, 0.0, abs(uv.x - 0.5) * 2.0) * 0.8;
                    finalColor += vec3(1.0, 0.5, 0.0) * glow;
                    
                    gl_FragColor = vec4(finalColor, fire);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, y, 0);
        pyroclasmGroup.add(ring);

        // Create particle system for burst effect
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        const particleVelocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 50 + Math.random() * 10;
            particlePositions[i * 3] = x + Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
            particlePositions[i * 3 + 2] = 0;
            particleSizes[i] = Math.random() * 8 + 5;
            
            // Store velocity for each particle
            particleVelocities.push({
                x: Math.cos(angle) * (2 + Math.random() * 2),
                y: Math.sin(angle) * (2 + Math.random() * 2)
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff4400,
            size: 6,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        pyroclasmGroup.add(particles);

        // Create secondary fire particle system
        const fireParticleCount = 50;
        const fireParticleGeometry = new THREE.BufferGeometry();
        const fireParticlePositions = new Float32Array(fireParticleCount * 3);
        const fireParticleSizes = new Float32Array(fireParticleCount);
        const fireParticleVelocities = [];
        
        for (let i = 0; i < fireParticleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 30;
            fireParticlePositions[i * 3] = x + Math.cos(angle) * radius;
            fireParticlePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
            fireParticlePositions[i * 3 + 2] = 0;
            fireParticleSizes[i] = Math.random() * 4 + 2;
            
            // Store velocity for each particle with upward bias
            fireParticleVelocities.push({
                x: (Math.random() - 0.5) * 2,
                y: Math.random() * 3 + 1 // Upward bias
            });
        }
        
        fireParticleGeometry.setAttribute('position', new THREE.BufferAttribute(fireParticlePositions, 3));
        fireParticleGeometry.setAttribute('size', new THREE.BufferAttribute(fireParticleSizes, 1));

        const fireParticleMaterial = new THREE.PointsMaterial({
            color: 0xff8800,
            size: 3,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const fireParticles = new THREE.Points(fireParticleGeometry, fireParticleMaterial);
        pyroclasmGroup.add(fireParticles);

        const effect = {
            group: pyroclasmGroup,
            ring,
            particles,
            fireParticles,
            particleVelocities,
            fireParticleVelocities,
            startTime: performance.now(),
            duration: 1000,
            active: true,
            update: (deltaTime) => {
                const elapsed = performance.now() - effect.startTime;
                const progress = Math.min(elapsed / effect.duration, 1);
                
                // Update ring
                effect.ring.material.uniforms.time.value = elapsed / 1000;
                
                // Phase 1: Ring formation (0-0.3)
                if (progress < 0.3) {
                    const ringProgress = progress / 0.3;
                    effect.ring.scale.set(ringProgress, ringProgress, 1);
                    effect.ring.material.opacity = ringProgress;
                }
                // Phase 2: Burst (0.3-1.0)
                else {
                    const burstProgress = (progress - 0.3) / 0.7;
                    
                    // Update main particles
                    const positions = effect.particles.geometry.attributes.position.array;
                    const sizes = effect.particles.geometry.attributes.size.array;
                    
                    for (let i = 0; i < positions.length / 3; i++) {
                        const velocity = effect.particleVelocities[i];
                        positions[i * 3] += velocity.x * burstProgress * 5;
                        positions[i * 3 + 1] += velocity.y * burstProgress * 5;
                        sizes[i] *= 0.95;
                    }
                    
                    effect.particles.geometry.attributes.position.needsUpdate = true;
                    effect.particles.geometry.attributes.size.needsUpdate = true;

                    // Update fire particles
                    const firePositions = effect.fireParticles.geometry.attributes.position.array;
                    const fireSizes = effect.fireParticles.geometry.attributes.size.array;
                    
                    for (let i = 0; i < firePositions.length / 3; i++) {
                        const velocity = effect.fireParticleVelocities[i];
                        firePositions[i * 3] += velocity.x * burstProgress * 3;
                        firePositions[i * 3 + 1] += velocity.y * burstProgress * 3;
                        fireSizes[i] *= 0.98;
                        
                        // Reset particles that are too small
                        if (fireSizes[i] < 0.1) {
                            const angle = Math.random() * Math.PI * 2;
                            const radius = Math.random() * 30;
                            firePositions[i * 3] = x + Math.cos(angle) * radius;
                            firePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
                            fireSizes[i] = Math.random() * 4 + 2;
                        }
                    }
                    
                    effect.fireParticles.geometry.attributes.position.needsUpdate = true;
                    effect.fireParticles.geometry.attributes.size.needsUpdate = true;
                    
                    // Fade out ring
                    effect.ring.material.opacity = 1 - burstProgress;
                }
                
                // Check if effect is complete
                if (elapsed > effect.duration) {
                    effect.active = false;
                    this.scene.remove(effect.group);
                    this.effects.delete(effect);
                }
            }
        };

        this.effects.set(Date.now(), effect);
        this.animate();
    }

    createHeatWaveEffect(targetX, targetY) {
        if (!this.initialized) this.initialize();

        // Generate unique ID for this effect
        const effectId = Date.now() + Math.random();

        // Convert screen coordinates to Three.js coordinates
        const x = targetX - window.innerWidth / 2;
        const y = -targetY + window.innerHeight / 2;

        // Create heat wave group
        const heatWaveGroup = new THREE.Group();
        this.scene.add(heatWaveGroup);

        // Create plane geometry for the sprite
        const frameWidth = 192 / 8; // 192px width divided by 8 columns
        const frameHeight = 32; // 32px height
        const geometry = new THREE.PlaneGeometry(frameWidth * 8, frameHeight * 8);

        // Load the heat wave sprite sheet
        const textureLoader = new THREE.TextureLoader();
        const heatWaveTexture = textureLoader.load('assets/Sprites/fire/burning_loop_1.png');
        
        // Set up the texture properly to prevent bleeding
        heatWaveTexture.wrapS = THREE.ClampToEdgeWrapping;
        heatWaveTexture.wrapT = THREE.ClampToEdgeWrapping;
        heatWaveTexture.minFilter = THREE.LinearFilter;
        heatWaveTexture.magFilter = THREE.LinearFilter;
        heatWaveTexture.repeat.set(1/8, 1);
        heatWaveTexture.offset.set(0, 0);
        
        // Create material with sprite sheet
        const material = new THREE.MeshBasicMaterial({
            map: heatWaveTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const heatWave = new THREE.Mesh(geometry, material);
        heatWave.position.set(x, y, 0);
        heatWaveGroup.add(heatWave);

        const frameDuration = 100; // milliseconds per frame
        let lastFrameTime = performance.now();
        let currentFrame = 0;
        let loopCount = 0;
        const totalLoops = 5; // Increased from 3 to 5 loops
        let isDestroyed = false;

        const effect = {
            id: effectId,
            group: heatWaveGroup,
            heatWave,
            startTime: performance.now(),
            duration: frameDuration * 8 * totalLoops,
            active: true,
            update: (deltaTime) => {
                if (isDestroyed) return;

                const now = performance.now();
                const elapsed = now - effect.startTime;

                // Update frame if enough time has passed
                if (now - lastFrameTime >= frameDuration) {
                    currentFrame = (currentFrame + 1) % 8;
                    if (heatWave.material && heatWave.material.map) {
                        // Update texture offset with precise calculations
                        heatWave.material.map.offset.x = (currentFrame * (1/8));
                    }
                    lastFrameTime = now;

                    // Count loops
                    if (currentFrame === 0) {
                        loopCount++;
                    }
                }
                
                // Check if effect is complete
                if (elapsed > effect.duration || loopCount >= totalLoops) {
                    cleanup();
                }
            }
        };

        const cleanup = () => {
            if (isDestroyed) return;
            isDestroyed = true;
            
            effect.active = false;
            if (this.scene) {
                this.scene.remove(effect.group);
            }
            if (heatWave.material) {
                heatWave.material.dispose();
            }
            if (heatWave.geometry) {
                heatWave.geometry.dispose();
            }
            if (heatWaveTexture) {
                heatWaveTexture.dispose();
            }
            this.effects.delete(effect);
        };

        // Store effect with unique ID
        this.effects.set(effectId, effect);
        this.animate();

        // Return cleanup function
        return cleanup;
    }

    createMoltenStrikeEffect(targetX, targetY) {
        if (!this.initialized) this.initialize();

        // Convert screen coordinates to Three.js coordinates
        const x = targetX - window.innerWidth / 2;
        const y = -targetY + window.innerHeight / 2;

        // Create molten strike group
        const moltenGroup = new THREE.Group();
        this.scene.add(moltenGroup);

        // Create initial burst effect
        const burstGeometry = new THREE.CircleGeometry(50, 32);
        const burstMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                
                void main() {
                    // Calculate distance from center
                    float dist = length(vUv - vec2(0.5));
                    
                    // Create base fire shape
                    float fire = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    // Create bright core
                    float core = 1.0 - smoothstep(0.0, 0.2, dist);
                    
                    // Create outer glow
                    float glow = 1.0 - smoothstep(0.4, 0.5, dist);
                    
                    // Mix colors
                    vec3 color;
                    
                    // Bright white core
                    color = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.9, 0.5), core);
                    
                    // Yellow-orange middle
                    color = mix(color, vec3(1.0, 0.5, 0.0), fire * (1.0 - core));
                    
                    // Red-orange outer
                    color = mix(color, vec3(0.8, 0.2, 0.0), glow * (1.0 - fire));
                    
                    // Add flicker
                    float flicker = 0.95 + 0.05 * sin(time * 10.0);
                    color *= flicker;
                    
                    // Calculate alpha
                    float alpha = smoothstep(0.5, 0.0, dist);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const burst = new THREE.Mesh(burstGeometry, burstMaterial);
        burst.position.set(x, y, 0);
        moltenGroup.add(burst);

        // Create particle system for molten debris
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        const particleVelocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 30;
            particlePositions[i * 3] = x + Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
            particlePositions[i * 3 + 2] = 0;
            particleSizes[i] = Math.random() * 8 + 4;
            
            // Store velocity for each particle
            const speed = 2 + Math.random() * 3;
            particleVelocities.push({
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff4400,
            size: 6,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        moltenGroup.add(particles);

        // Create secondary fire particles
        const fireParticleCount = 50;
        const fireParticleGeometry = new THREE.BufferGeometry();
        const fireParticlePositions = new Float32Array(fireParticleCount * 3);
        const fireParticleSizes = new Float32Array(fireParticleCount);
        const fireParticleVelocities = [];
        
        for (let i = 0; i < fireParticleCount; i++) {
            const angle = (i / fireParticleCount) * Math.PI * 2;
            const radius = Math.random() * 20;
            fireParticlePositions[i * 3] = x + Math.cos(angle) * radius;
            fireParticlePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
            fireParticlePositions[i * 3 + 2] = 0;
            fireParticleSizes[i] = Math.random() * 6 + 3;
            
            // Store velocity for each particle
            const speed = 1 + Math.random() * 2;
            fireParticleVelocities.push({
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });
        }
        
        fireParticleGeometry.setAttribute('position', new THREE.BufferAttribute(fireParticlePositions, 3));
        fireParticleGeometry.setAttribute('size', new THREE.BufferAttribute(fireParticleSizes, 1));

        const fireParticleMaterial = new THREE.PointsMaterial({
            color: 0xff8800,
            size: 4,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const fireParticles = new THREE.Points(fireParticleGeometry, fireParticleMaterial);
        moltenGroup.add(fireParticles);

        const effect = {
            group: moltenGroup,
            burst,
            particles,
            fireParticles,
            particleVelocities,
            fireParticleVelocities,
            startTime: performance.now(),
            duration: 800,
            active: true,
            update: (deltaTime) => {
                const elapsed = performance.now() - effect.startTime;
                const progress = Math.min(elapsed / effect.duration, 1);
                
                // Update burst effect
                effect.burst.material.uniforms.time.value = elapsed / 1000;
                effect.burst.scale.set(1 + progress * 0.5, 1 + progress * 0.5, 1);
                effect.burst.material.opacity = 1 - progress;
                
                // Update main particles
                const positions = effect.particles.geometry.attributes.position.array;
                const sizes = effect.particles.geometry.attributes.size.array;
                
                for (let i = 0; i < positions.length / 3; i++) {
                    const velocity = effect.particleVelocities[i];
                    positions[i * 3] += velocity.x * (1 - progress * 0.5);
                    positions[i * 3 + 1] += velocity.y * (1 - progress * 0.5);
                    sizes[i] *= 0.95;
                }
                
                effect.particles.geometry.attributes.position.needsUpdate = true;
                effect.particles.geometry.attributes.size.needsUpdate = true;

                // Update fire particles
                const firePositions = effect.fireParticles.geometry.attributes.position.array;
                const fireSizes = effect.fireParticles.geometry.attributes.size.array;
                
                for (let i = 0; i < firePositions.length / 3; i++) {
                    const velocity = effect.fireParticleVelocities[i];
                    firePositions[i * 3] += velocity.x * (1 - progress * 0.5);
                    firePositions[i * 3 + 1] += velocity.y * (1 - progress * 0.5);
                    fireSizes[i] *= 0.98;
                    
                    // Reset particles that are too small
                    if (fireSizes[i] < 0.1) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.random() * 20;
                        firePositions[i * 3] = x + Math.cos(angle) * radius;
                        firePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
                        fireSizes[i] = Math.random() * 4 + 2;
                    }
                }
                
                effect.fireParticles.geometry.attributes.position.needsUpdate = true;
                effect.fireParticles.geometry.attributes.size.needsUpdate = true;
                
                // Check if effect is complete
                if (elapsed > effect.duration) {
                    effect.active = false;
                    
                    // Properly dispose of Three.js resources
                    if (effect.burst) {
                        effect.burst.geometry.dispose();
                        effect.burst.material.dispose();
                    }
                    if (effect.particles) {
                        effect.particles.geometry.dispose();
                        effect.particles.material.dispose();
                    }
                    if (effect.fireParticles) {
                        effect.fireParticles.geometry.dispose();
                        effect.fireParticles.material.dispose();
                    }
                    
                    this.scene.remove(effect.group);
                    this.effects.delete(effect);
                }
            }
        };

        this.effects.set(Date.now(), effect);
        this.animate();
    }

    createFlameBurstEffect(targetX, targetY) {
        if (!this.initialized) this.initialize();

        // Convert screen coordinates to Three.js coordinates
        const x = targetX - window.innerWidth / 2;
        const y = -targetY + window.innerHeight / 2;

        // Create burst group
        const burstGroup = new THREE.Group();
        this.scene.add(burstGroup);

        // Load textures
        const textureLoader = new THREE.TextureLoader();
        const flameTexture = textureLoader.load('assets/Sprites/fire/burning_loop_4.png');

        // Prevent texture bleeding
        flameTexture.wrapS = THREE.ClampToEdgeWrapping;
        flameTexture.wrapT = THREE.ClampToEdgeWrapping;
        flameTexture.minFilter = THREE.LinearFilter;
        flameTexture.magFilter = THREE.LinearFilter;
        flameTexture.repeat.set(1/6, 1);
        flameTexture.offset.set(0, 0);

        // Create central burst
        const burstGeometry = new THREE.PlaneGeometry(200, 200);
        const burstMaterial = new THREE.MeshBasicMaterial({
            map: flameTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        const centralBurst = new THREE.Mesh(burstGeometry, burstMaterial);
        centralBurst.position.set(x, y, 0);
        burstGroup.add(centralBurst);

        // Create expanding rings
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.RingGeometry(100 + i * 50, 120 + i * 50, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(x, y, 0);
            ring.scale.set(0, 0, 0);
            burstGroup.add(ring);
            rings.push(ring);
        }

        // Create particle system for sparks
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        const particleVelocities = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 50;
            particlePositions[i * 3] = x + Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = y + Math.sin(angle) * radius;
            particlePositions[i * 3 + 2] = 0;
            particleSizes[i] = Math.random() * 8 + 4;

            const speed = 5 + Math.random() * 5;
            particleVelocities.push({
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            });
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            map: flameTexture,
            color: 0xffaa00,
            size: 8,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        burstGroup.add(particles);

        const effect = {
            group: burstGroup,
            centralBurst,
            rings,
            particles,
            particleVelocities,
            startTime: performance.now(),
            duration: 1000,
            active: true,
            update: (deltaTime) => {
                const elapsed = performance.now() - effect.startTime;
                const progress = Math.min(elapsed / effect.duration, 1);

                // Animate central burst
                if (centralBurst.material && centralBurst.material.map) {
                    const frame = Math.floor((elapsed / 100) % 6);
                    centralBurst.material.map.offset.x = frame / 6;
                }

                // Animate rings
                rings.forEach((ring, index) => {
                    const ringProgress = Math.min((progress - index * 0.1) * 1.5, 1);
                    ring.scale.set(ringProgress, ringProgress, 1);
                    ring.material.opacity = 0.6 * (1 - ringProgress);
                });

                // Update particles
                const positions = particles.geometry.attributes.position.array;
                const sizes = particles.geometry.attributes.size.array;

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    positions[i3] += particleVelocities[i].x * deltaTime;
                    positions[i3 + 1] += particleVelocities[i].y * deltaTime;
                    sizes[i] *= 0.95; // Shrink particles over time
                }

                particles.geometry.attributes.position.needsUpdate = true;
                particles.geometry.attributes.size.needsUpdate = true;

                // Check if effect is complete
                if (elapsed > effect.duration) {
                    effect.active = false;
                    this.scene.remove(effect.group);
                    this.effects.delete(effect);
                }
            }
        };

        this.effects.set(Date.now(), effect);
        this.animate();
    }

    animate() {
        if (!this.initialized) return;

        const deltaTime = this.clock.getDelta();
        let hasActiveEffects = false;

        // Update all active effects
        for (const [id, effect] of this.effects) {
            if (effect.active && effect.update) {
                effect.update(deltaTime);
                hasActiveEffects = true;
            }
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);

        // Continue animation only if there are active effects
        if (hasActiveEffects) {
            requestAnimationFrame(() => this.animate());
        }
    }
} 