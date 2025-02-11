'use client';
import Prop from '@/components/ui/prop';
import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react';

function FuturePage() {
    const router = useRouter();
    const shopElement = useRef(null);

    // Initialize Locomotive Scroll on the client side only
    useEffect(() => {
        // Dynamic import to avoid SSR issues
        const initLocomotiveScroll = async () => {
            const LocomotiveScroll = (await import('locomotive-scroll')).default;
            if (shopElement.current) {
                const scroll = new LocomotiveScroll({
                    el: shopElement.current,
                    smooth: true
                });
                
                // Clean up on unmount
                return () => {
                    scroll.destroy();
                };
            }
        };

        initLocomotiveScroll();
    }, []); // Empty dependency array means this runs once on mount

    const handleShopClick = () => {
        if (typeof window !== 'undefined') {  // Check if we're in the browser
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div>
            <iframe
                src="https://sketchfab.com/models/cc60ba5dbd014d63839935c0e89eae53/embed?autostart=1"
                title="Example Iframe"
                className='h-screen w-screen'
                style={{ border: 'none' }}
            ></iframe>
            <button
                onClick={() => router.push('/stone-age')}
                className="fixed bottom-4 z-100 left-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Go to Past
            </button>
            <button
                onClick={handleShopClick}
                className="fixed bottom-4 z-100 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded"
            >
                Explore Shop
            </button>
            <button
                onClick={() => router.push('/future')}
                className="fixed bottom-4 z-100 right-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Go to Future
            </button>
            <div 
                id="shop" 
                className='h-screen w-screen flex items-center text-white text-4xl px-8 text-center bg-black' 
                ref={shopElement} 
            >
                <Prop path="/models/ticket2.glb" title="Knight Costume" price={100} />
                <Prop path="/models/robo1.glb" title="Knight Costume" price={100} />
                <Prop path="/models/robo2.glb" title="Knight Costume" price={100} />
                <Prop path="/models/fantasy_knight.glb" title="Knight Costume" price={100} />
                <Prop path="/models/fantasy_knight.glb" title="Knight Costume" price={100} />
                <Prop path="/models/fantasy_knight.glb" title="Knight Costume" price={100} />
                <Prop path="/models/fantasy_knight.glb" title="Knight Costume" price={100} />
            </div>
        </div>
    )
}

export default FuturePage
