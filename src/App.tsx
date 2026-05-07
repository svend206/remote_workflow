import { useState } from 'react'

function App() {
    const [transcript, setTranscript] = useState('')
    const [listening, setListening] = useState(false)
    const [reply, setReply] = useState('')

    const startListening = () => {
        const utterance = new SpeechSynthesisUtterance('')
        window.speechSynthesis.speak(utterance)

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = false

        recognition.onresult = async (event: any) => {
            const text = event.results[0][0].transcript
            setTranscript(text)

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text }),
            })
            const data = await res.json() 
            setReply(data.response)
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.response))
        }

        recognition.onend = () => setListening(false)

        recognition.start()
        setListening(true)
    }

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>closed-loops</h1>
            <button onClick={startListening} disabled={listening}>
                {listening ? 'Listening...' : 'Tap to speak'}
            </button>
            {transcript && <p>{transcript}</p>}
            {reply && <p>{reply}</p>}
        </div>
    )
}

export default App