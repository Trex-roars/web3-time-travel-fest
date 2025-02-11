'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Share2, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';

const questions = [
    {
        id: 1,
        text: "When solving problems, you prefer to...",
        options: [
            { text: "Use instinct and physical skills", score: "prehistoric" },
            { text: "Follow traditional methods and codes", score: "medieval" },
            { text: "Experiment with innovative solutions", score: "future" }
        ]
    },
    {
        id: 2,
        text: "Your ideal home would be...",
        options: [
            { text: "A cozy cave with a warm fire", score: "prehistoric" },
            { text: "A fortified castle with grand halls", score: "medieval" },
            { text: "A smart home with automated everything", score: "future" }
        ]
    },
    {
        id: 3,
        text: "Your preferred method of learning is...",
        options: [
            { text: "Hands-on experience and trial-and-error", score: "prehistoric" },
            { text: "Apprenticeship and mentoring", score: "medieval" },
            { text: "Digital simulations and virtual reality", score: "future" }
        ]
    }
];

const results = {
    prehistoric: {
        title: "Prehistoric Caveman",
        description: "You love adventure and survival. You'd be the one discovering fire!",
        badge: "🦕 Prehistoric Pioneer",
        perks: "Access to exclusive survival workshops and primitive crafting events"
    },
    medieval: {
        title: "Medieval Knight",
        description: "Bravery and honor define you. The jousting arena is your battlefield!",
        badge: "⚔️ Noble Knight",
        perks: "VIP access to renaissance fairs and medieval banquets"
    },
    future: {
        title: "Cybernetic Future Being",
        description: "Technology is your home. You're destined for space travel!",
        badge: "🚀 Future Explorer",
        perks: "Priority access to tech conventions and VR experiences"
    }
};

const TimelineBadge = ({ era }: { era: 'prehistoric' | 'medieval' | 'future' }) => {
    const colors = {
        prehistoric: "bg-amber-500",
        medieval: "bg-blue-500",
        future: "bg-purple-500"
    };

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${colors[era]}`}>
            {results[era].badge}
        </div>
    );
};

const TimeTravelQuiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Array<keyof TimelineEra>>([]);
    const [result, setResult] = useState(null);

    const calculateResult = (): keyof TimelineEra => {
        const scores = answers.reduce<Record<string, number>>((acc, answer) => {
            acc[answer] = (acc[answer] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(scores).reduce((a, b) =>
            (scores[a] || 0) > (scores[b[0]] || 0) ? a : b[0]
            , Object.keys(scores)[0]) as keyof TimelineEra;
    };

    interface TimelineEra {
        prehistoric: string;
        medieval: string;
        future: string;
    }

    const handleShare = (result) => {
        // Create sharing text
        const shareText = `🧬 I just took the DNA Time Travel Test and I'm a ${results[result].title}! ${results[result].description} ${results[result].badge}`;

        // Instagram sharing URL
        const instagramUrl = `https://www.instagram.com/create/story?caption=${encodeURIComponent(shareText)}`;

        // Open Instagram in a new window
        window.open(instagramUrl, '_blank');
    };

    const handleAnswer = (score: keyof TimelineEra): void => {
        const newAnswers: Array<keyof TimelineEra> = [...answers, score];
        if (currentQuestion < questions.length - 1) {
            setAnswers(newAnswers);
            setCurrentQuestion(currentQuestion + 1);
        } else {
            const finalResult: keyof TimelineEra = calculateResult();
            setResult(finalResult);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-20">
            <CardHeader className="text-center border-b border-black">
                <CardTitle className="text-2xl font-bold">
                    🧬 DNA Time Travel Test
                </CardTitle>
            </CardHeader>
            <CardContent>
                {result ? (
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <TimelineBadge era={result} />
                            <h2 className="text-2xl font-bold mt-4">{results[result].title}</h2>
                            <p className="text-lg">{results[result].description}</p>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                <span className="font-medium text-white">Special Perks:</span>
                            </div>
                            <p className="text-gray-300">{results[result].perks}</p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => handleShare(result)}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            >
                                <Share2 className="w-4 h-4" />
                                Share on Instagram
                            </Button>
                            <Button
                                onClick={resetQuiz}
                                variant="outline"
                                className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                                <Clock className="w-4 h-4" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                        </div>

                        <h2 className="text-xl font-medium mb-4">
                            {questions[currentQuestion].text}
                        </h2>

                        <div className="space-y-3">
                            {questions[currentQuestion].options.map((option, index) => (
                                <Button
                                    key={index}
                                    onClick={() => handleAnswer(option.score)}
                                    variant="outline"
                                    className="w-full text-left justify-start h-auto py-4 px-6 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    {option.text}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TimeTravelQuiz;
