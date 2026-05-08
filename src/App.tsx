import { useState } from 'react'                                                                              
                                                                                                                
  function App() {                                                                                              
    const [transcript, setTranscript] = useState('')                                                            
    const [listening, setListening] = useState(false)             
    const [reply, setReply] = useState('')
    const [entryId, setEntryId] = useState('')                                                                  
    const [yourResponse, setYourResponse] = useState('')
    const [listeningReaction, setListeningReaction] = useState(false)                                           
                                                                  
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
        setReply('')
        setYourResponse('')                                                                                     
        setEntryId('')                                            
                                                                                                                
        const res = await fetch('/api/chat', {
          method: 'POST',                                                                                       
          headers: { 'Content-Type': 'application/json' },        
          body: JSON.stringify({ prompt: text }),
        })
        const data = await res.json()
        setReply(data.response)                                                                                 
        setEntryId(data.entryId)
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.response))                               
      }                                                           

      recognition.onend = () => setListening(false)                                                             
      recognition.start()
      setListening(true)                                                                                        
    }                                                             

    const startReactionListening = () => {
      const utterance = new SpeechSynthesisUtterance('')
      window.speechSynthesis.speak(utterance)                                                                   
   
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition    
      const recognition = new SpeechRecognition()                 
      recognition.lang = 'en-US'                                                                                
      recognition.interimResults = false
                                                                                                                
      recognition.onresult = async (event: any) => {              
        const text = event.results[0][0].transcript
        setYourResponse(text)
                                                                                                                
        await fetch('/api/reaction', {
          method: 'POST',                                                                                       
          headers: { 'Content-Type': 'application/json' },        
          body: JSON.stringify({ entryId, yourResponse: text }),
        })
      }                                                                                                         
   
      recognition.onend = () => setListeningReaction(false)                                                     
      recognition.start()                                         
      setListeningReaction(true)
    }

    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>closed-loops</h1>                                                                                   
        <button onClick={startListening} disabled={listening || listeningReaction}>
          {listening ? 'Listening…' : 'Tap to speak'}                                                           
        </button>                                                                                               
        {transcript && <p><strong>Me:</strong> {transcript}</p>}
        {reply && <p><strong>Claude:</strong> {reply}</p>}                                                      
        {reply && !yourResponse && (                              
          <button onClick={startReactionListening} disabled={listeningReaction}>                                
            {listeningReaction ? 'Listening…' : 'Record reaction'}
          </button>                                                                                             
        )}                                                        
        {yourResponse && <p><strong>My reaction:</strong> {yourResponse}</p>}                                   
      </div>                                                      
    )                                                                                                           
  }
                                                                                                                
  export default App    