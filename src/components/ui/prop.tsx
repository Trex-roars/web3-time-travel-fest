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
import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Define window.ethereum type globally
declare global {
    interface Window {
        ethereum?: any;
    }
}

// Contract configuration
const CONTRACT_ADDRESS = "0x4088e079d50a9e9cF6237cB6c7E7a94fAff3a142";
const CONTRACT_ABI = [
    "function buyProp(uint256 propId) public payable",
    "function getPropOwner(uint256 propId) public view returns (address)",
    "function propPrice(uint256 propId) public view returns (uint256)"
];

interface GLBObjectProps {
    path: string;
    title: string;
    price: number;
    propId: number;
}

const getContract = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    } catch (error) {
        console.error('Error getting contract:', error);
        throw new Error('Failed to connect to MetaMask');
    }
};

const Prop: React.FC<GLBObjectProps> = ({ path, title, price, propId }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isOwner, setIsOwner] = useState(false);
    const [userAddress, setUserAddress] = useState<string | null>(null);

    // Handle account changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                setUserAddress(accounts[0]);
            } else {
                setUserAddress(null);
                setIsOwner(false);
            }
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Initial account check
        window.ethereum.request({ method: 'eth_accounts' })
            .then(handleAccountsChanged)
            .catch(console.error);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, []);

    // Check ownership when userAddress changes
    useEffect(() => {
        const checkOwnership = async () => {
            if (!userAddress) {
                setIsOwner(false);
                return;
            }

            try {
                const contract = await getContract();
                const owner = await contract.getPropOwner(propId);
                setIsOwner(owner.toLowerCase() === userAddress.toLowerCase());
            } catch (err) {
                console.error('Error checking ownership:', err);
                setIsOwner(false);
            }
        };

        checkOwnership();
    }, [userAddress, propId]);

    // Three.js setup
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let renderer: THREE.WebGLRenderer;
        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let controls: OrbitControls;

        try {
            // Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xffffff);

            // Camera setup
            camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
            camera.position.z = 5;

            // Renderer setup
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(mount.clientWidth, mount.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            mount.appendChild(renderer.domElement);

            // Controls setup
            controls = new OrbitControls(camera, renderer.domElement);
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
            loader.load(
                path,
                (gltf) => {
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
                },
                undefined,
                (error) => {
                    console.error('Error loading model:', error);
                }
            );

            // Handle window resize
            const handleResize = () => {
                if (!mount) return;

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
                renderer.dispose();
            };
        } catch (error) {
            console.error('Error in Three.js setup:', error);
        }
    }, [path]);

    const handlePurchase = async () => {
        if (!window.ethereum) {
            setError('Please install MetaMask to make purchases');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const contract = await getContract();

            // Convert price to wei
            const priceInWei = ethers.parseEther(price.toString());

            // Make the purchase
            const tx = await contract.buyProp(propId, {
                value: priceInWei
            });

            // Wait for transaction to be mined
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                setSuccess(`Successfully purchased ${title}!`);
                setShowPayment(false);
                setIsOwner(true);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (err: any) {
            let errorMessage = 'Error processing payment';
            if (err.code === 'ACTION_REJECTED') {
                errorMessage = 'Transaction was rejected by user';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[500px] w-[250px] flex flex-col">
            <div ref={mountRef} className="w-full flex-1" />
            <div className="w-full p-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-lg mb-2">Price: {price} ETH</p>

                {isOwner ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                        Owned
                    </Button>
                ) : (
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
                                        <span>{price} ETH</span>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        onClick={handlePurchase}
                                        disabled={loading || !userAddress}
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
                                        ) : !userAddress ? 'Connect Wallet' : 'Confirm Purchase'}
                                    </Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default Prop;
