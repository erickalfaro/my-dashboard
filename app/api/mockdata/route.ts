// app/api/mockdata/route.ts
export async function GET() {
  return Response.json([
    { id: 1, name: "AAPL", value: 172.35, open: 170, high: 175, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 2, name: "TSLA", value: 824.29, open: 800, high: 830, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 3, name: "NVDA", value: 506.78, open: 490, high: 515, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 4, name: "GOOGL", value: 142.92, open: 140, high: 145, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 5, name: "AMZN", value: 129.50, open: 125, high: 130, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 6, name: "MSFT", value: 365.42, open: 125, high: 130, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 7, name: "META", value: 287.30, open: 280, high: 290, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 8, name: "NFLX", value: 420.85, open: 415, high: 425, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 9, name: "AMD", value: 108.62, open: 105, high: 110, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 10, name: "INTC", value: 39.75, open: 40, high: 42, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 11, name: "BABA", value: 85.34, open: 84, high: 88, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 12, name: "DIS", value: 91.22, open: 90, high: 93, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 13, name: "PYPL", value: 61.87, open: 60, high: 62, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 14, name: "UBER", value: 47.95, open: 47, high: 50, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] },
    { id: 15, name: "SQ", value: 58.64, open: 58, high: 60, trend: [170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173, 170, 171, 172, 172.5, 173] }
  ]);
}
