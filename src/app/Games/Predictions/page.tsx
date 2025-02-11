'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { useState } from 'react';

const FuturePredictor = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [question, setQuestion] = useState('');
    const [prediction, setPrediction] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Predefined prediction components for variety
    const predictions = {
        career: [
            "will revolutionize their industry with an unexpected invention",
            "will become a highly respected mentor in their field",
            "will start a successful company that combines technology and nature",
            "will discover a new way of working that others will follow",
        ],
        lifestyle: [
            "will live in a sustainable community they helped create",
            "will travel to places few have ever seen",
            "will master the art of work-life harmony",
            "will inspire others with their unique lifestyle choices",
        ],
        achievement: [
            "will receive recognition for their innovative ideas",
            "will make a breakthrough that helps many people",
            "will create something that becomes part of daily life",
            "will solve a problem that's puzzled experts for years",
        ]
    };

    const generatePrediction = () => {
        if (!name || !age || !question) return;
        setIsLoading(true);
        setPrediction('');

        // Simulate API delay
        setTimeout(() => {
            try {
                // Parse the question to determine context
                const questionLower = question.toLowerCase();
                let context = 'career'; // default context

                if (questionLower.includes('live') || questionLower.includes('life') || questionLower.includes('home')) {
                    context = 'lifestyle';
                } else if (questionLower.includes('achieve') || questionLower.includes('accomplish')) {
                    context = 'achievement';
                }

                // Calculate future year based on question
                const yearMatch = question.match(/20\d\d/);
                const futureYear = yearMatch ? yearMatch[0] : '2050';
                const yearsAhead = parseInt(futureYear) - new Date().getFullYear();

                // Get random prediction from context
                const predictionBase = predictions[context][Math.floor(Math.random() * predictions[context].length)];

                // Construct personalized prediction
                const futurePrediction = `By ${futureYear}, ${name} ${predictionBase}. At the age of ${parseInt(age) + yearsAhead}, they will have inspired countless others and their journey will be remembered as a turning point in their life. The stars suggest this is just the beginning of an extraordinary path!`;

                setPrediction(futurePrediction);
            } catch (error) {
                setPrediction("The cosmic energies are particularly mysterious today. Please try again!");
                console.error('Error generating prediction:', error);
            }
            setIsLoading(false);
        }, 1500); // Add a slight delay for effect
    };

    const handleShare = () => {
        if (prediction) {
            const shareText = `🔮 My Future Prediction: ${prediction}`;
            const instagramUrl = `https://www.instagram.com/create/story?caption=${encodeURIComponent(shareText)}`;
            window.open(instagramUrl, '_blank');
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto mt-20 bg-gray-900">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                    🔮 Time-Travel Prediction Generator
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Your Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-purple-500 bg-gray-800 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-white">Your Age</Label>
                        <Input
                            id="age"
                            type="number"
                            placeholder="Enter your age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="border-purple-500 bg-gray-800 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="question" className="text-white">Your Question</Label>
                        <Input
                            id="question"
                            placeholder="e.g., What will my life be like in 2050?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="border-purple-500 bg-gray-800 text-white"
                        />
                    </div>

                    <Button
                        onClick={generatePrediction}
                        disabled={!name || !age || !question || isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                        {isLoading ? '🔮 Consulting the Stars...' : '✨ Reveal My Future'}
                    </Button>

                    {prediction && (
                        <div className="mt-6 space-y-4">
                            <div className="p-6 bg-gray-800 rounded-lg shadow-lg border border-purple-500">
                                <p className="text-lg font-medium text-white">{prediction}</p>
                            </div>

                            <Button
                                onClick={handleShare}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            >
                                <Camera className="w-4 h-4" />
                                Share on Instagram
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default FuturePredictor;
