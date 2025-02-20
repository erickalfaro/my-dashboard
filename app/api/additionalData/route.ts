// app/api/additionalData/route.ts
export async function GET() {
    return Response.json({
      AAPL: { open: 170, high: 175, low: 168, volume: 5000000 },
      TSLA: { open: 800, high: 830, low: 790, volume: 3000000 },
      NVDA: { open: 490, high: 515, low: 485, volume: 2500000 },
      GOOGL: { open: 140, high: 145, low: 138, volume: 4000000 },
      AMZN: { open: 125, high: 130, low: 123, volume: 3500000 },
      MSFT: { open: 125, high: 130, low: 123, volume: 3500000 },
    });
  }
  