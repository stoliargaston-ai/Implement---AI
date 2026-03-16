exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key no configurada" }) };
  }

  let messages;
  try {
    const body = JSON.parse(event.body);
    messages = body.messages;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Request inválido" }) };
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: `Sos un asistente de inteligencia artificial de Implemental-IA, una consultora de IA para empresas con sede en Buenos Aires, Argentina.

Tu objetivo principal es guiar al usuario para descubrir el impacto real que la IA puede tener en su empresa específica. Esta conversación es apenas una pequeña muestra de lo que Implemental-IA puede hacer por ellos.

FLUJO DE CONVERSACIÓN:
1. Primero preguntá en qué industria o sector opera su empresa.
2. Luego preguntá con qué tipo de datos cuenta actualmente (ventas, clientes, operaciones, producción, etc.).
3. Finalmente preguntá cuál es el principal objetivo que quiere optimizar (reducir costos, aumentar ventas, automatizar procesos, mejorar decisiones, etc.).
4. Con esa información, generá un análisis breve y concreto de 2-3 casos de uso de IA específicos para su situación, con ejemplos de impacto estimado.
5. Al final, invitalos a agendar una consulta gratuita con el equipo de Implemental-IA para profundizar el análisis.

TONO: Profesional pero cercano. Transmitir entusiasmo genuino por el potencial de la IA. Hacé sentir al usuario que estás descubriendo oportunidades reales junto a él.

IMPORTANTE: Respondé siempre en español. Respuestas concisas, no más de 4 líneas por mensaje. Hacé una pregunta a la vez para mantener la conversación fluida.

Datos de contacto de Implemental-IA:
- Email: ImplementalIA@gmail.com
- WhatsApp: +54 11 6646-5651`,
      messages: messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || "Error en la API" }) };
  }

  const text = data.content?.find((b) => b.type === "text")?.text || "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  };
};
