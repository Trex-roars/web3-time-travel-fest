'use client';
import { useRouter } from 'next/navigation'

function App() {
    const router = useRouter();
    return (
        <>
            <iframe
                src="https://sketchfab.com/models/cc60ba5dbd014d63839935c0e89eae53/embed?autostart=1"

                title="Example Iframe"
                className='h-screen w-screen'
                onLoad={() => {
                    window.addEventListener('DOMContentLoaded', (event) => {
                        console.log('Message received from iframe:', event);
                        console.log('Message received from iframe:', (event.target as HTMLIFrameElement).contentWindow);
                        
                    });
                }}
                style={{ border: 'none' }}
            ></iframe>
            <button
                onClick={() => router.push('/medieval')}
                className="fixed bottom-4 z-100 left-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Go to Past
            </button>
        </>
    )
}

export default App
