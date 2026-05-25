import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("resultados_encuestas")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log(error);

    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
}
