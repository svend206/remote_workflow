import { useState, useRef } from 'react'                                                                      
                                                                  
  function App() {
    const [pendingTranscript, setPendingTranscript] = useState('')
    const [transcript, setTranscript] = useState('')                                                            
    const [listening, setListening] = useState(false)
    const [reply, setReply] = useState('')                                                                      
    const [entryId, setEntryId] = useState('')                    
    const [yourResponse, setYourResponse] = useState('')                                                        
    const [listeningReaction, setListeningReaction] = useState(false)
    const [loading, setLoading] = useState(false)                                                               
    const recognitionRef = useRef<any>(null)                      
    const reactionRecognitionRef = useRef<any>(null)                                                            
    const accumulatedRef = useRef('')
    const accumulatedReactionRef = useRef('')                                                                   
                                                                  
    const startListening = () => {
      const utterance = new SpeechSynthesisUtterance('')
      window.speechSynthesis.speak(utterance)                                                                   
  
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition    
      const recognition = new SpeechRecognition()                 
      recognition.lang = 'en-US'                                                                                
      recognition.interimResults = false                          
      recognition.continuous = true
      accumulatedRef.current = ''

      recognition.onresult = (event: any) => {                                                                  
        const latest = event.results[event.results.length - 1][0].transcript
        accumulatedRef.current += (accumulatedRef.current ? ' ' : '') + latest                                  
        setPendingTranscript(accumulatedRef.current)              
      }
                                                                                                                
      recognition.onend = () => {
        setListening(false)                                                                                     
      }                                                           

      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
    }

    const stopListening = () => {
      recognitionRef.current?.stop()
    }                                                                                                           
  
    const sendPrompt = async () => {                                                                            
      const text = pendingTranscript.trim()                       
      if (!text) return

      setTranscript(text)                                                                                       
      setPendingTranscript('')
      setReply('')                                                                                              
      setYourResponse('')                                         
      setEntryId('')
      setLoading(true)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },                                                        
        body: JSON.stringify({ prompt: text }),
      })                                                                                                        
      const data = await res.json()                               
      setLoading(false)
      setReply(data.response)
      setEntryId(data.entryId)
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.response))                                 
    }
                                                                                                                
    const startReactionListening = () => {                        
      const utterance = new SpeechSynthesisUtterance('')
      window.speechSynthesis.speak(utterance)                                                                   
  
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition    
      const recognition = new SpeechRecognition()                 
      recognition.lang = 'en-US'                                                                                
      recognition.interimResults = false
      recognition.continuous = true                                                                             
      accumulatedReactionRef.current = ''                         

      recognition.onresult = (event: any) => {                                                                  
        const latest = event.results[event.results.length - 1][0].transcript
        accumulatedReactionRef.current += (accumulatedReactionRef.current ? ' ' : '') + latest                  
        setYourResponse(accumulatedReactionRef.current)           
      }                                                                                                         
  
      recognition.onend = async () => {                                                                         
        setListeningReaction(false)                               
        const text = accumulatedReactionRef.current
        if (!text) return

        await fetch('/api/reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },                                                      
          body: JSON.stringify({ entryId, yourResponse: text }),
        })                                                                                                      
      }                                                           

      reactionRecognitionRef.current = recognition
      recognition.start()
      setListeningReaction(true)                                                                                
    }
                                                                                                                
    const stopReactionListening = () => {                         
      reactionRecognitionRef.current?.stop()
    }

    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>closed-loops</h1>                                                                                   
        {!listening ? (
          <button onClick={startListening} disabled={listeningReaction || loading || !!pendingTranscript}>      
            Tap to speak                                                                                        
          </button>
        ) : (                                                                                                   
          <button onClick={stopListening}>                        
            Done speaking
          </button>
        )}
        {pendingTranscript && (
          <div style={{ marginTop: '1rem' }}>
            <textarea                                                                                           
              value={pendingTranscript}
              onChange={(e) => setPendingTranscript(e.target.value)}                                            
              rows={4}                                            
              style={{ width: '100%', fontSize: '1rem', padding: '0.5rem' }}                                    
            />
            <button onClick={sendPrompt} style={{ marginTop: '0.5rem' }}>                                       
              Send                                                                                              
            </button>
          </div>                                                                                                
        )}                                                        
        {loading && <p>Thinking…</p>}
        {transcript && <p><strong>Me:</strong> {transcript}</p>}
        {reply && <p><strong>Claude:</strong> {reply}</p>}                                                      
        {reply && !yourResponse && (
          !listeningReaction ? (                                                                                
            <button onClick={startReactionListening}>Record reaction</button>
          ) : (
            <button onClick={stopReactionListening}>Done reacting</button>
          )                                                                                                     
        )}
        {yourResponse && <p><strong>My reaction:</strong> {yourResponse}</p>}                                   
      </div>                                                      
    )
  }

  export default App