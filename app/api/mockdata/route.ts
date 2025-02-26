// app/api/mockdata/route.ts
import { supabase } from '../../../lib/supabase'; // Adjust path as needed

export async function GET() {
  try {
    // Query the frontend_timeseries_data table
    const { data, error } = await supabase
      .from('frontend_timeseries_data')
      .select('data'); // Fetch all rows

    if (error) {
      console.error('Error fetching data from Supabase:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Flatten all records from the 'data' column
    const allRecords = data.flatMap((row: { data: any }) => {
      // If row.data is a string, parse it; otherwise, use it as-is
      const parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      return parsedData; // Return the array of records
    });

    // Ensure the data matches the expected structure
    const transformedData = allRecords.map((item: any) => ({
      id: item.id,
      name: item.name,
      value: item.value,
      open: item.open,
      high: item.high,
      trend: item.trend,
    }));

    // Return the transformed data as JSON
    return new Response(JSON.stringify(transformedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}