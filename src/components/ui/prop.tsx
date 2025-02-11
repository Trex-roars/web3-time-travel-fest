import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    "function propPrice(uint256 propId) public view returns (uint256)",
    "function isPropertyAvailable(uint256 propId) public view returns (bool)"
];

const getContract = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};


interface PropProps {
    path: string;
    title: string;
    price: number;
    propId: number;
}

const PropPurchaseForm = ({
    title,
    price,
    loading,
    onPurchase
}: {
    title: string;
    price: number;
    loading: boolean;
    onPurchase: () => void;
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Purchase {title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                            <span className="font-medium">Price:</span>
                            <span>{price} ETH</span>
                        </div>
                    </div>

                    <button
                        onClick={onPurchase}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700
                        disabled:bg-blue-300 disabled:cursor-not-allowed transition-all
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : 'Purchase Property'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

const Prop: React.FC<PropProps> = ({ path, title, price, propId }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [isOwner, setIsOwner] = useState(false);
    const [propertyAvailable, setPropertyAvailable] = useState(true);
    const [userBalance, setUserBalance] = useState<bigint>(BigInt(0));
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        if (!window.ethereum) return;

        const checkAccounts = async () => {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                setUserAddress(accounts[0] || null);
            } catch (err) {
                console.error('Error checking accounts:', err);
            }
        };

        const handleAccountsChanged = (accounts: string[]) => {
            setUserAddress(accounts[0] || null);
        };

        checkAccounts();
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, []);

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

    // Three.js setup effect remains the same
    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 3 / maxDim;
                model.scale.multiplyScalar(scale);

                scene.add(model);
            },
            undefined,
            (error) => console.error('Error loading model:', error)
        );

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!mount) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            mount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [path]);
    useEffect(() => {
        const checkAvailabilityAndBalance = async () => {
            if (!userAddress) return;

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = await getContract();

                // Check property availability
                const isAvailable = await contract.isPropertyAvailable(propId);
                setPropertyAvailable(isAvailable);

                // Get user's balance
                const balance = await provider.getBalance(userAddress);
                setUserBalance(balance);
            } catch (err) {
                console.error('Error checking availability and balance:', err);
            }
        };

        checkAvailabilityAndBalance();
    }, [userAddress, propId]);

    const handlePurchase = async () => {
        if (!window.ethereum) {
            setError('Please install MetaMask to make purchases');
            return;
        }

        if (!userAddress) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setUserAddress(accounts[0]);
                return;
            } catch (err) {
                setError('Failed to connect wallet');
                return;
            }
        }


        const validatePurchase = async (priceInWei: bigint): Promise<string | null> => {
            if (!userAddress) {
                return 'Please connect your wallet first';
            }

            if (!propertyAvailable) {
                return 'This property is no longer available';
            }

            if (userBalance < priceInWei) {
                const required = ethers.formatEther(priceInWei);
                const available = ethers.formatEther(userBalance);
                return `Insufficient funds. Required: ${required} ETH, Available: ${available} ETH`;
            }

            return null;
        };

        const handlePurchase = async () => {
            if (!window.ethereum) {
                setError('Please install MetaMask to make purchases');
                return;
            }

            if (!userAddress) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setUserAddress(accounts[0]);
                    return;
                } catch (err) {
                    setError('Failed to connect wallet');
                    return;
                }
            }

            setLoading(true);
            setError('');
            setSuccess('');

            try {
                const priceInWei = ethers.parseEther(price.toString());

                // Validate purchase before attempting transaction
                const validationError = await validatePurchase(priceInWei);
                if (validationError) {
                    setError(validationError);
                    setLoading(false);
                    return;
                }

                const contract = await getContract();

                // Verify current price matches expected price
                const currentPrice = await contract.propPrice(propId);
                if (currentPrice !== priceInWei) {
                    setError('Property price has changed. Please refresh the page.');
                    setLoading(false);
                    return;
                }

                // Estimate gas with the actual parameters
                const gasEstimate = await contract.buyProp.estimateGas(propId, {
                    value: priceInWei
                });

                // Add 20% buffer to gas estimate
                const gasLimit = gasEstimate * BigInt(120) / BigInt(100);

                // Execute the transaction
                const tx = await contract.buyProp(propId, {
                    value: priceInWei,
                    gasLimit
                });

                await tx.wait();
                setSuccess(`Successfully purchased ${title}!`);
                setIsOwner(true);
                setPropertyAvailable(false);
            } catch (err: any) {
                console.error('Purchase error:', err);

                // Handle different types of errors
                if (err.code === 'ACTION_REJECTED') {
                    setError('Transaction was rejected by user');
                } else if (err.error?.message?.includes('insufficient funds')) {
                    setError('Insufficient funds to cover gas fees');
                } else if (err.error?.message?.includes('already owned')) {
                    setError('This property is already owned');
                } else if (err.error?.data?.message) {
                    setError(err.error.data.message);
                } else if (err.message?.includes('gas required exceeds allowance')) {
                    setError('Transaction would exceed gas limits. Please try again with a higher gas limit.');
                } else {
                    setError('Transaction failed. Please check property availability and your balance.');
                }
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const contract = await getContract();
            const priceInWei = ethers.parseEther(price.toString());

            // First, estimate gas to check if the transaction will fail
            try {
                await contract.buyProp.estimateGas(propId, {
                    value: priceInWei
                });
            } catch (estimateError: any) {
                // Check if we have a revert reason
                if (estimateError.data) {
                    throw new Error(`Transaction would fail: ${estimateError.data}`);
                } else {
                    throw new Error('Transaction would fail. Please check if the property is still available and you have enough funds.');
                }
            }

            // If gas estimation succeeds, proceed with the transaction
            const tx = await contract.buyProp(propId, {
                value: priceInWei,
                gasLimit: ethers.toNumber((await contract.buyProp.estimateGas(propId, { value: priceInWei })) * BigInt(120) / BigInt(100)) // Add 20% buffer
            });

            await tx.wait();
            setSuccess(`Successfully purchased ${title}!`);
            setIsOwner(true);
        } catch (err: any) {
            console.error('Purchase error:', err);
            let errorMessage = 'Error processing payment';

            if (err.code === 'ACTION_REJECTED') {
                errorMessage = 'Transaction was rejected by user';
            } else if (err.error?.data?.message) {
                // Handle custom error messages from the contract
                errorMessage = err.error.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto p-4">
            <div ref={mountRef} className="h-[400px] w-full rounded-lg overflow-hidden" />

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

            {isOwner ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="bg-green-50 p-4 rounded-lg text-green-700 text-center font-medium">
                            You own this property
                        </div>
                    </CardContent>
                </Card>
            ) : !propertyAvailable ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center font-medium">
                            This property is no longer available
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <PropPurchaseForm
                    title={title}
                    price={price}
                    loading={loading}
                    onPurchase={handlePurchase}
                />
            )}
        </div>
    );
};

export default Prop;
