'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Download, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const FaceFilterApp = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [selectedEra, setSelectedEra] = useState('prehistoric');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const eras = {
        prehistoric: {
            name: 'Prehistoric Era',
            description: 'Caveman face paint & fur outfit'
        },
        medieval: {
            name: 'Medieval Era',
            description: 'Knight helmet & armor'
        },
        future: {
            name: 'Future Era',
            description: 'Cybernetic implants & neon effects'
        }
    };

    const stopStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreamActive(false);
        }
    };

    useEffect(() => {
        return () => {
            stopStream();
        };
    }, []);

    const startCamera = async () => {
        try {
            setError(null);
            stopStream();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play()
                        .then(() => {
                            console.log('Video stream started');
                            setIsStreamActive(true);
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

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;

                // Reset the filter before drawing
                context.filter = 'none';
                context.drawImage(videoRef.current, 0, 0);

                // Apply filter effects after drawing
                applyEraFilter(context, selectedEra);

                // Get the filtered result
                const imageDataUrl = canvasRef.current.toDataURL('image/png');
                setCapturedImage(imageDataUrl);
            }
        }
    };

    const applyEraFilter = (context: CanvasRenderingContext2D, era: string) => {
        const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        const data = imageData.data;

        switch (era) {
            case 'prehistoric':
                // Sepia effect
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    data[i] = (r * 0.393 + g * 0.769 + b * 0.189);
                    data[i + 1] = (r * 0.349 + g * 0.686 + b * 0.168);
                    data[i + 2] = (r * 0.272 + g * 0.534 + b * 0.131);
                }
                break;
            case 'medieval':
                // High contrast dark effect
                for (let i = 0; i < data.length; i += 4) {
                    data[i] *= 0.9;     // Red
                    data[i + 1] *= 0.9;  // Green
                    data[i + 2] *= 1.2;  // Blue
                }
                break;
            case 'future':
                // Cyberpunk-style effect
                for (let i = 0; i < data.length; i += 4) {
                    data[i] *= 1.1;     // Boost red
                    data[i + 1] *= 0.8;  // Reduce green
                    data[i + 2] *= 1.2;  // Boost blue
                }
                break;
        }

        context.putImageData(imageData, 0, 0);
    };

    const downloadImage = () => {
        if (capturedImage) {
            const link = document.createElement('a');
            link.href = capturedImage;
            link.download = `costume-${selectedEra}-${Date.now()}.png`;
            link.click();
        }
    };

    const shareImage = async () => {
        if (capturedImage && navigator.share) {
            try {
                const blob = await (await fetch(capturedImage)).blob();
                const file = new File([blob], 'costume.png', { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: 'My AI Costume',
                    text: 'Check out my AI-generated costume!'
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>AI Costume Generator</CardTitle>
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
                    {!isStreamActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Button onClick={startCamera}>
                                <Camera className="w-6 h-6 mr-2" />
                                Start Camera
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
                        value={selectedEra}
                        onValueChange={setSelectedEra}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select era" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(eras).map(([value, { name }]) => (
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

export default FaceFilterApp;
