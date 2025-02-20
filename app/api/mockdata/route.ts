export async function GET() {
    return Response.json([
      { id: 1, name: "AAPL", value: 172.35, trend: [170, 171, 172, 172.5, 173] },
      { id: 2, name: "TSLA", value: 824.29, trend: [800, 810, 820, 830, 825] },
      { id: 3, name: "NVDA", value: 506.78, trend: [490, 495, 500, 510, 515] },
      { id: 4, name: "GOOGL", value: 142.92, trend: [140, 141, 142, 143, 144] },
      { id: 5, name: "AMZN", value: 129.50, trend: [125, 126, 127, 128, 130] },
      { id: 6, name: "MSFT", value: 365.42, trend: [360, 362, 364, 366, 368] },
      { id: 7, name: "META", value: 287.30, trend: [280, 282, 285, 288, 290] },
      { id: 8, name: "NFLX", value: 420.85, trend: [410, 415, 418, 422, 425] },
      { id: 9, name: "AMD", value: 108.62, trend: [105, 106, 107, 109, 110] },
      { id: 10, name: "INTC", value: 39.75, trend: [38, 38.5, 39, 40, 41] },
      { id: 11, name: "BABA", value: 85.34, trend: [83, 84, 85, 86, 87] },
      { id: 12, name: "DIS", value: 91.22, trend: [89, 90, 91, 92, 93] },
      { id: 13, name: "PYPL", value: 61.87, trend: [60, 60.5, 61, 62, 63] },
      { id: 14, name: "UBER", value: 47.95, trend: [45, 46, 47, 48, 49] },
      { id: 15, name: "SQ", value: 58.64, trend: [56, 57, 58, 59, 60] }

    ]);
  }
  