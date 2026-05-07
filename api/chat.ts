import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic({apiKey: process.env.ANTHROPIC_APIKEY })
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }
    const { prompt } = req.body
    const message = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 1024
        messages: [{ role: 'user', content: prompt }],

    })
    const text = (message.content[0] as any).text
    res.status(200).json({ response: text })
}