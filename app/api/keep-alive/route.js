import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    const supabase = getSupabaseClient();
    
    // Usamos la tabla "quotes" basándonos en el contexto del cotizador VibeCargo
    const { data, error } = await supabase.from("quotes").select("id").limit(1);
    
    // Salvavidas: El error 42P01 indica que Postgres respondió y está activo (incluso si la tabla no existiera)
    const isAlive = !error || error?.code === "42P01";
    
    return NextResponse.json({
      ok: isAlive,
      status: "alive",
      latency_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, {
      headers: { "Cache-Control": "no-store, no-cache, max-age=0" }
    });
    
  } catch (err) {
    return NextResponse.json({ 
      ok: false, 
      error: err?.message || "Error interno del servidor" 
    }, { 
      status: 500 
    });
  }
}
