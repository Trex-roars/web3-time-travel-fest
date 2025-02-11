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
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

const Prop: React.FC<GLBObjectProps> = ({ path, title, price, propId }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isOwner, setIsOwner] = useState(false);

    // Three.js setup remains the same as your original code...
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

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            mount.removeChild(renderer.domElement);
        };
    }, [path]);

    // Check if user owns the prop
    useEffect(() => {
        const checkOwnership = async () => {
            try {
                const contract = await getContract();
                const owner = await contract.getPropOwner(propId);
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());
            } catch (err) {
                console.error('Error checking ownership:', err);
            }
        };

        if (window.ethereum) {
            checkOwnership();
        }
    }, [propId]);

    const handlePurchase = async () => {
        if (typeof window.ethereum === 'undefined') {
            setError('Please install MetaMask to make purchases');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const contract = await getContract();

            // Convert price to wei
            const priceInWei = ethers.parseEther(price.toString());

            // Make the purchase
            const tx = await contract.buyProp(propId, {
                value: priceInWei
            });

            // Wait for transaction to be mined
            await tx.wait();

            setSuccess(`Successfully purchased ${title}!`);
            setShowPayment(false);
            setIsOwner(true);
        } catch (err: any) {
            setError(err.message || 'Error processing payment');
        } finally {
            setLoading(false);
        }
    };

    return (

    )
};

export default Prop;
