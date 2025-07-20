Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.tutelageservices.co.uk',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  // Your function logic here
  return new Response('Success', {
    headers: { 'Access-Control-Allow-Origin': 'https://www.tutelageservices.co.uk' },
  })
})