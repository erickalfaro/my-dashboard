// app/api/mockdata/route.ts
export async function GET() {
  return Response.json([{"id": 1, "name": "TSLA", "value": 940.0, "open": 1441.0, "high": 1516.0, "trend": [1441.0, 1429.0]}, {"id": 2, "name": "NVDA", "value": 1034.0, "open": 831.0, "high": 1034.0, "trend": [831.0, 827.0]}, {"id": 3, "name": "SPY", "value": 1399.0, "open": 1313.0, "high": 1430.0, "trend": [1313.0, 1293.0]}]);
}
