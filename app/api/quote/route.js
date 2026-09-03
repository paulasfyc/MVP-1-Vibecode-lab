import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, stairs = 0, items, clientName, phone } = body;

    if (!origin || !destination || !items) {
      return NextResponse.json(
        { error: 'Por favor completa los campos obligatorios: origen, destino y descripción de ítems.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let quoteResult = null;

    if (apiKey) {
      try {
        const systemPrompt = `Eres un tasador y cotizador experto en mudanzas y fletes para el servicio 'VibeCargo' en Chile.
Tu tarea es calcular una cotización precisa y realista en pesos chilenos (CLP) según los datos proporcionados:
- Origen: ${origin}
- Destino: ${destination}
- Pisos por escalera (sin ascensor): ${stairs}
- Muebles / Carga: ${items}

Reglas:
1. Todos los costos deben ser valores enteros en pesos chilenos (CLP).
2. Considera una tarifa base razonable para transporte metropolitano/interurbano (ej: $35.000 a $65.000 CLP).
3. Cada piso por escalera añade un costo adicional por esfuerzo físico (ej: $5.000 a $10.000 CLP por piso).
4. El volumen y complejidad de los ítems agrega costo proporcional (embalaje/estiba).
5. Debes responder ÚNICAMENTE con un JSON válido, sin bloques de código markdown ni texto adicional.

Formato exacto esperado:
{
  "breakdown": [
    { "description": "Transporte base y combustible", "cost": 45000 },
    { "description": "Manipulación de carga y volumen", "cost": 25000 },
    { "description": "Recargo por subida de 2 pisos por escalera", "cost": 15000 }
  ],
  "estimated_total": 85000
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            quoteResult = JSON.parse(rawText.replace(/```json|```/g, '').trim());
          }
        } else {
          console.warn('Gemini API devolvió error:', await geminiRes.text());
        }
      } catch (geminiError) {
        console.error('Error al consultar Gemini:', geminiError);
      }
    }

    // Algoritmo de respaldo si Gemini no responde o no está disponible la clave
    if (!quoteResult || !quoteResult.breakdown || !quoteResult.estimated_total) {
      const baseCost = 40000;
      const stairsCost = Math.max(0, parseInt(stairs, 10) || 0) * 8000;
      const itemCount = items.split(',').length;
      const itemsCost = Math.max(20000, itemCount * 7000);
      const total = baseCost + stairsCost + itemsCost;

      quoteResult = {
        breakdown: [
          { description: 'Transporte base y logística de ruta', cost: baseCost },
          { description: `Servicio de carga (${items.slice(0, 40)}${items.length > 40 ? '...' : ''})`, cost: itemsCost },
          ...(stairsCost > 0 ? [{ description: `Recargo por ${stairs} pisos por escalera`, cost: stairsCost }] : [])
        ],
        estimated_total: total
      };
    }

    // Intentar registrar la cotización en Supabase de manera silenciosa
    try {
      const supabase = getSupabaseClient();
      await supabase.from('quotes').insert([
        {
          origin,
          destination,
          stairs: parseInt(stairs, 10) || 0,
          items,
          client_name: clientName || null,
          phone: phone || null,
          estimated_total: quoteResult.estimated_total,
          breakdown: quoteResult.breakdown,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (dbError) {
      // Si la tabla no existe o falla la conexión a BD, no bloqueamos la respuesta al cliente
      console.info('No se pudo guardar en Supabase (opcional):', dbError?.message);
    }

    return NextResponse.json(quoteResult);

  } catch (error) {
    console.error('Error en /api/quote:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al procesar la cotización.' },
      { status: 500 }
    );
  }
}
