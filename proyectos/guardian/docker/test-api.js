import fetch from 'node-fetch'

async function test() {
  console.log('Sending request to /api/analyze...')
  try {
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'https://google.com',
        channel: 'whatsapp',
        userHash: 'wa:test-user'
      })
    })
    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Response:', text)
  } catch (err) {
    console.error('Error:', err.message)
  }
}

test()
