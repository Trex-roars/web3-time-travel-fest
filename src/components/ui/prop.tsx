import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface GLBObjectProps {
    path: string;
    title: string;
    price: number;
}

const Prop: React.FC<GLBObjectProps> = ({ path, title, price }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // White background

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 1);
        backLight.position.set(-5, 5, -5);
        scene.add(backLight);

        // Load model
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            // Scale model to fit view
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            model.scale.multiplyScalar(scale);
            
            scene.add(model);
        });

        // Handle window resize
        const handleResize = () => {
            const width = mount.clientWidth;
            const height = mount.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            mount.removeChild(renderer.domElement);
        };
    }, [path]);

    return (
        <div className="h-[500px] w-[250px] flex flex-col">
            <div ref={mountRef} className="w-full flex-1" />
            <div className="w-full p-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-lg">Price: ${price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default Prop;