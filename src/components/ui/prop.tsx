import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { usePrivy } from '@privy-io/react-auth';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { parseEther } from 'viem';

interface GLBObjectProps {
    path: string;
    title: string;
    price: number;
    contractAddress: string;
}

const Prop: React.FC<GLBObjectProps> = ({ path, title, price, contractAddress }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const { user, login, sendTransaction } = usePrivy();

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

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

    const handlePurchase = async () => {
        if (!user) {
            login();
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const tx = await sendTransaction({
                to: contractAddress,
                value: parseEther(price.toString()),
            });

            await tx.wait();
            setSuccess(`Successfully purchased ${title}!`);
            setShowPayment(false);
        } catch (err: any) {
            setError(err.message || 'Error processing payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[500px] w-[250px] flex flex-col">
            <div ref={mountRef} className="w-full flex-1" />
            <div className="w-full p-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-lg mb-2">Price: ${price.toFixed(2)}</p>

                <Dialog open={showPayment} onOpenChange={setShowPayment}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Purchase
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Purchase {title}</DialogTitle>
                        </DialogHeader>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="bg-green-50 border-green-200">
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="font-medium">Price:</span>
                                    <span>${price.toFixed(2)}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    onClick={handlePurchase}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : 'Confirm Purchase'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Prop;
