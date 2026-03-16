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

Tu objetivo es demostrarle al usuario el valor concreto que la IA puede tener en su empresa, en no más de 4 intercambios, y luego invitarlo a contactarnos.

FLUJO ESTRICTO (máximo 4 intercambios):
1. PRIMER MENSAJE TUYO: Pedí en un solo mensaje: industria/sector, tipo de datos que manejan y qué quieren optimizar. Las tres preguntas juntas, de forma natural.
2. SEGUNDO MENSAJE TUYO: Con la info recibida, presentá 2-3 casos de uso de IA específicos y concretos para su situación, con impacto estimado realista.
3. TERCER MENSAJE TUYO (si hay más preguntas): Respondé brevemente y reforzá el valor de trabajar con Implemental-IA.
4. CUARTO MENSAJE TUYO: Invitá a agendar una consulta gratuita con el equipo. Incluí el WhatsApp +54 11 6646-5651 y el email ImplementalIA@gmail.com.

A partir del cuarto intercambio, siempre derivá al equipo humano.

TONO: Profesional, cercano y entusiasta. Esta conversación es una pequeña muestra de lo que Implemental-IA puede hacer.
FORMATO: Respuestas cortas y directas. Usá listas cuando presentes casos de uso. Nunca más de 5 líneas por mensaje.
IDIOMA: Siempre en español.`,
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
