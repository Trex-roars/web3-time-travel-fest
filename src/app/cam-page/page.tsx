'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Download, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Types
interface Costume {
    name: string;
    overlays: {
        [key: string]: string;
    };
    landmarks: string[];
}

interface FaceLandmarks {
    foreheadTop: number[];
    foreheadLeft: number[];
    foreheadRight: number[];
    leftEye: number[];
    rightEye: number[];
    nose: number[];
    leftJaw: number[];
    rightJaw: number[];
}

const FaceCostumeApp = () => {
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const faceMeshRef = useRef<any>(null);

    // State
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [selectedCostume, setSelectedCostume] = useState('viking');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Costume definitions
    const costumes: { [key: string]: Costume } = {
        viking: {
            name: 'Viking Warrior',
            overlays: {
                helmet: '/costumes/viking/helmet.png',
                beard: '/costumes/viking/beard.png'
            },
            landmarks: ['foreheadTop', 'foreheadLeft', 'foreheadRight']
        },
        cyborg: {
            name: 'Cyborg',
            overlays: {
                implants: '/costumes/cyborg/implants.png',
                eyePiece: '/costumes/cyborg/eye-piece.png',
                circuits: '/costumes/cyborg/circuits.png'
            },
            landmarks: ['leftEye', 'rightEye', 'temples']
        },
        wizard: {
            name: 'Wizard',
            overlays: {
                hat: '/costumes/wizard/hat.png',
                beard: '/costumes/wizard/beard.png',
                runes: '/costumes/wizard/runes.png'
            },
            landmarks: ['topHead', 'leftTemple', 'rightTemple']
        }
    };

    // Load MediaPipe models
    useEffect(() => {
        const loadModels = async () => {
            try {
                // Load MediaPipe Face Mesh
                const { FaceMesh } = await import('@mediapipe/face_mesh');

                faceMeshRef.current = new FaceMesh({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                    }
                });

                // Configure face mesh
                faceMeshRef.current.setOptions({
                    maxNumFaces: 3,
                    refineLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                // Initialize face mesh
                await faceMeshRef.current.initialize();
                setIsModelLoaded(true);

            } catch (err) {
                setError('Error loading face detection models: ' + (err as Error).message);
                console.error('Error loading models:', err);
            }
        };

        loadModels();

        // Cleanup
        return () => {
            if (faceMeshRef.current) {
                faceMeshRef.current.close();
            }
        };
    }, []);

    // Handle stream cleanup
    useEffect(() => {
        return () => {
            stopStream();
        };
    }, []);

    // Stop video stream
    const stopStream = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreamActive(false);
        }
    };

    // Start camera
    const startCamera = async () => {
        try {
            setError(null);
            stopStream();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play()
                        .then(() => {
                            setIsStreamActive(true);
                            startFaceDetection();
                        })
                        .catch(err => {
                            setError('Failed to play video stream: ' + err.message);
                        });
                };
            }
        } catch (err) {
            setError('Error accessing camera: ' + (err as Error).message);
            console.error('Error accessing camera:', err);
        }
    };

    // Process face landmarks
    const processLandmarks = (landmarks: any[]): FaceLandmarks => {
        return {
            foreheadTop: [landmarks[10].x, landmarks[10].y],
            foreheadLeft: [landmarks[108].x, landmarks[108].y],
            foreheadRight: [landmarks[337].x, landmarks[337].y],
            leftEye: [landmarks[33].x, landmarks[33].y],
            rightEye: [landmarks[362].x, landmarks[362].y],
            nose: [landmarks[1].x, landmarks[1].y],
            leftJaw: [landmarks[447].x, landmarks[447].y],
            rightJaw: [landmarks[227].x, landmarks[227].y],
        };
    };

    // Calculate transform for overlay
    const calculateTransform = (landmarks: FaceLandmarks, overlayType: string) => {
        const distance = (p1: number[], p2: number[]) => {
            return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 8));
        };

        switch (overlayType) {
            case 'helmet':
                const width = distance(landmarks.foreheadLeft, landmarks.foreheadRight) * 4;
                const angle = Math.atan2(
                    landmarks.foreheadRight[1] - landmarks.foreheadLeft[1],
                    landmarks.foreheadRight[0] - landmarks.foreheadLeft[0]
                );
                return { width, angle };

            case 'implants':
                return {
                    width: distance(landmarks.leftEye, landmarks.rightEye) * 2,
                    angle: Math.atan2(
                        landmarks.rightEye[1] - landmarks.leftEye[1],
                        landmarks.rightEye[0] - landmarks.leftEye[0]
                    )
                };

            case 'hat':
                return {
                    width: distance(landmarks.leftJaw, landmarks.rightJaw) * 1.5,
                    angle: Math.atan2(
                        landmarks.rightJaw[1] - landmarks.leftJaw[1],
                        landmarks.rightJaw[0] - landmarks.leftJaw[0]
                    )
                };

            default:
                return { width: 100, angle: 0 };
        }
    };

    // Start face detection
    const startFaceDetection = () => {
        if (!videoRef.current || !overlayCanvasRef.current || !faceMeshRef.current) return;

        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Load costume images
        const costumeImages: { [key: string]: HTMLImageElement } = {};
        Object.entries(costumes[selectedCostume].overlays).forEach(([key, src]) => {
            const img = new Image();
            img.src = src;
            costumeImages[key] = img;
        });

        // Process results callback
        const onResults = (results: any) => {
            if (!results.multiFaceLandmarks?.length) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Process landmarks
            const landmarks = processLandmarks(results.multiFaceLandmarks[0]);

            // Draw overlays
            Object.entries(costumeImages).forEach(([key, img]) => {
                if (!img.complete) return;

                const transform = calculateTransform(landmarks, key);

                ctx.save();
                ctx.translate(
                    landmarks.nose[0] * canvas.width,
                    landmarks.nose[1] * canvas.height
                );
                ctx.rotate(transform.angle);
                ctx.drawImage(
                    img,
                    -transform.width / 2,
                    -transform.width / 2,
                    transform.width,
                    transform.width
                );
                ctx.restore();
            });
        };

        // Set up face mesh processing
        faceMeshRef.current.onResults(onResults);

        // Start detection loop
        const detectFace = async () => {
            if (!video.paused && !video.ended) {
                await faceMeshRef.current.send({ image: video });
            }
            requestAnimationFrame(detectFace);
        };

        detectFace();
    };

    // Capture image
    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw video frame
        ctx.drawImage(videoRef.current, 0, 0);

        // Draw overlays
        ctx.drawImage(overlayCanvasRef.current, 0, 0);

        // Capture final image
        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
    };

    // Download image
    const downloadImage = () => {
        if (capturedImage) {
            const link = document.createElement('a');
            link.href = capturedImage;
            link.download = `costume-${selectedCostume}-${Date.now()}.png`;
            link.click();
        }
    };

    // Share image
    const shareImage = async () => {
        if (capturedImage && navigator.share) {
            try {
                const blob = await (await fetch(capturedImage)).blob();
                const file = new File([blob], 'costume.png', { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: 'My Virtual Costume',
                    text: 'Check out my virtual costume!'
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Virtual Costume Creator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <canvas
                        ref={overlayCanvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />
                    {!isStreamActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                                onClick={startCamera}
                                disabled={!isModelLoaded}
                            >
                                <Camera className="w-6 h-6 mr-2" />
                                {isModelLoaded ? 'Start Camera' : 'Loading Models...'}
                            </Button>
                        </div>
                    )}
                    {error && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex flex-col space-y-4">
                    <Select
                        value={selectedCostume}
                        onValueChange={setSelectedCostume}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select costume" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(costumes).map(([value, { name }]) => (
                                <SelectItem key={value} value={value}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex space-x-2">
                        <Button
                            onClick={captureImage}
                            disabled={!isStreamActive}
                            className="flex-1"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Capture
                        </Button>
                        <Button
                            onClick={downloadImage}
                            disabled={!capturedImage}
                            variant="outline"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button
                            onClick={shareImage}
                            disabled={!capturedImage}
                            variant="outline"
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                {capturedImage && (
                    <div className="mt-4">
                        <img
                            src={capturedImage}
                            alt="Captured costume"
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FaceCostumeApp;
