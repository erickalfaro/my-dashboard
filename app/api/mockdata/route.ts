export async function GET() {
    return Response.json([
      { id: 1, name: "AAPL", value: 172.35, trend: [170, 171, 172, 172.5, 173] },
      { id: 2, name: "TSLA", value: 824.29, trend: [800, 810, 820, 830, 825] },
      { id: 3, name: "NVDA", value: 506.78, trend: [490, 495, 500, 510, 515] },
      { id: 4, name: "GOOGL", value: 142.92, trend: [140, 141, 142, 143, 144] },
      { id: 5, name: "AMZN", value: 129.50, trend: [125, 126, 127, 128, 130] }
    ]);
  }
  