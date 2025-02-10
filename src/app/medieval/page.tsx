'use client';
import { useRouter } from 'next/navigation'

function App() {
    const router = useRouter();
    return (
        <>
            <iframe
                src="https://sketchfab.com/models/2043203b32b548cc84448e4ffe2be28c/embed?autostart=1&internal=1&tracking=0&ui_ar=0&ui_infos=0&ui_snapshots=1&ui_stop=0&ui_theatre=1&ui_watermark=0"

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
                onClick={() => router.push('/future')}
                className="fixed bottom-4 z-100 right-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Go to Future
            </button>
        </>
    )
}

export default App
