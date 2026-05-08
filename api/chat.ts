import Anthropic from '@anthropic-ai/sdk'                       
import { createClient } from '@supabase/supabase-js'                                                          
                                                                                                                
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(                                                                                
    process.env.SUPABASE_URL!,                                    
    process.env.SUPABASE_ANON_KEY!                                                                              
)                      
                                                                                                                
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {                                                                                
      return res.status(405).json({ error: 'Method not allowed' })
    }                                                                                                           
   
    const { prompt } = req.body                                                                                 
                                                                  
    // Generate embedding for the prompt
    const embeddingRes = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',                                                                                             
        headers: {
            'Content-Type': 'application/json',                                                                       
            'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,    
        },                                                                                                          
        body: JSON.stringify({ input: [prompt], model: 'voyage-3' }),
    })                                                                                                            
    const embeddingJson = await embeddingRes.json()                 
    const embedding = embeddingJson.data[0].embedding 
                                                                                                                
    // Search for similar past entries
    const { data: similarEntries } = await supabase.rpc('match_entries', {                                      
      query_embedding: embedding,                                                                               
      match_count: 3,
    })                                                                                                          
                                                                                                                
    // Build context from similar entries
    let context = ''                                                                                            
    if (similarEntries && similarEntries.length > 0) {            
      context = 'Here are some relevant past exchanges:\n\n'
      for (const entry of similarEntries) {                                                                     
        context += `User asked: ${entry.prompt}\nClaude responded: ${entry.llm_response}\n\n`
      }                                                                                                         
      context += 'Now answer the following:\n\n'                  
    }                                                                                                           
                                                                  
    // Call Claude with context
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',                                                                                 
      max_tokens: 1024,
      messages: [{ role: 'user', content: context + prompt }],                                                  
    })                                                                                                          
   
    const llm_response = (message.content[0] as any).text                                                       
                                                                  
    // Save entry with embedding                                                                                
    const { data: inserted } = await supabase
        .from('entries')                                                                                            
        .insert({ prompt, llm_response, model_version: 'claude-opus-4-7', embedding })
        .select('id')                                                                                               
        .single()                                                

    res.status(200).json({ response: llm_response, entryId: inserted?.id })                                                     
  }
