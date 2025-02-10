'use client';
import { useRouter } from 'next/navigation'
function App() {
    const router = useRouter();
    
    return (
        <>
            <iframe
                src="https://sketchfab.com/models/734844933f4642999f0ef284ecd4d184/embed?autostart=1"
                title="Example Iframe"
                className='h-screen w-screen'
                style={{ border: 'none' }}
                onLoad={() => {
                    window.addEventListener('message', (event) => {
                        console.log('Message received from iframe:', event.data);
                    });
                }}
            ></iframe>
            <button
                onClick={() => router.push('/medieval')}
                className="fixed bottom-4 z-100 right-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Go to Future
            </button>
        </>
    )
}

export default App
