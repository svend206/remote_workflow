import { createClient } from '@supabase/supabase-js'                                                          
   
  const supabase = createClient(                                                                                
    process.env.SUPABASE_URL!,                                    
    process.env.SUPABASE_ANON_KEY!                                                                              
  )                                                               

  export default async function handler(req: any, res: any) {                                                   
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })                                              
    }                                                             

    const { entryId, yourResponse } = req.body

    const embeddingRes = await fetch('https://api.voyageai.com/v1/embeddings', {                                
      method: 'POST',
      headers: {                                                                                                
        'Content-Type': 'application/json',                       
        'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,                                                
      },
      body: JSON.stringify({ input: [yourResponse], model: 'voyage-3' }),                                       
    })                                                                                                          
    const embeddingJson = await embeddingRes.json()
    const embedding = embeddingJson.data[0].embedding                                                           
                                                                  
    await supabase                                                                                              
      .from('entries')
      .update({ your_response: yourResponse, embedding })                                                       
      .eq('id', entryId)                                          

    res.status(200).json({ ok: true })
  }
