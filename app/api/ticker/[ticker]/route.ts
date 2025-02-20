// app/api/ticker/[ticker]/route.ts
export async function GET(
    request: Request,
    { params }: { params: { ticker: string } }
  ) {
    const { ticker } = params;
    // Simulate some processing delay if desired
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return new Response(
      JSON.stringify({ message: `Mock response for ${ticker}: Detailed info about ${ticker}.` }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  