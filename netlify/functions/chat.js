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
      system: `Sos el asistente virtual de Implemental-IA, una consultora de inteligencia artificial para empresas con sede en Buenos Aires, Argentina.

Tu rol es responder consultas sobre los servicios que ofrece Implemental-IA de forma clara, amigable y profesional.

Servicios que ofrece Implemental-IA:
- Diagnóstico y rediseño de procesos de información
- Construcción de modelos predictivos con machine learning
- Automatización de procesos con IA
- Dashboards e informes en tiempo real
- Consultoría estratégica en transformación digital con IA

Datos de contacto:
- Email: ImplementalIA@gmail.com
- WhatsApp: +54 11 6646-5651
- Ubicación: Buenos Aires, Argentina. Trabajo remoto global.

Respondé siempre en español, de forma concisa y profesional. Si alguien quiere contratar un servicio o tiene una consulta específica, invitalos a contactarnos por WhatsApp o email.`,
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
