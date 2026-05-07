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
                                                                                                                
    const message = await anthropic.messages.create({             
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],                                                            
    })
                                                                                                                
    const llm_response = (message.content[0] as any).text                                                       
   
    await supabase.from('entries').insert({                                                                     
      prompt,                                                     
      llm_response,
      model_version: 'claude-opus-4-7',
    })

    res.status(200).json({ response: llm_response })                                                            
  }
