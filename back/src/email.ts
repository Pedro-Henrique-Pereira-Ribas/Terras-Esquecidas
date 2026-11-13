/**
 * Envio de e-mail pelo Resend (provedor transacional).
 *
 * Sem RESEND_API_KEY o envio e ignorado: o pedido continua valendo e
 * aparece no painel. Com a chave, o dono do Reino recebe o aviso por e-mail.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailConfig {
  apiKey: string | null;
  from: string;
}

export interface EmailResult {
  sent: boolean;
  reason: string;
  id?: string;
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Manda o e-mail. Nunca lanca: uma falha de e-mail nao quebra o pedido. */
export async function sendEmail(
  message: EmailMessage,
  config: EmailConfig,
  fetchImpl: typeof fetch = fetch
): Promise<EmailResult> {
  if (!config.apiKey) {
    return { sent: false, reason: "email_desativado" };
  }
  if (!message.to) {
    return { sent: false, reason: "sem_destinatario" };
  }

  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        text: message.text
      })
    });

    const body = (await response.json().catch(() => null)) as { id?: string } | null;
    if (!response.ok) {
      console.error("[email] o provedor recusou a mensagem:", response.status, body);
      return { sent: false, reason: "provedor_recusou" };
    }
    console.log("[email] mensagem enviada para", message.to);
    return { sent: true, reason: "enviado", id: body?.id };
  } catch (error) {
    console.error("[email] falha ao enviar:", (error as Error).message);
    return { sent: false, reason: "falha_no_envio" };
  }
}

/** Aviso que chega ao dono do Reino quando alguem pede uma conta. */
export function buildRequestEmail(input: {
  ownerEmail: string;
  name: string;
  server: string;
  email: string | null;
  note: string | null;
}): EmailMessage {
  const linhas = [
    "Alguem pediu uma conta no Terra Perdida.",
    "",
    "Nome: " + input.name,
    "Servidor: " + input.server,
    "E-mail da pessoa: " + (input.email || "nao informado"),
    input.note ? "Recado: " + input.note : null,
    "",
    "Para liberar, entre no painel em /admin com o seu e-mail e a sua chave."
  ].filter((linha) => linha !== null);

  return {
    to: input.ownerEmail,
    subject: "Novo pedido de conta: " + input.name,
    text: linhas.join("\n")
  };
}

/** Aviso que chega para a pessoa quando o pedido e aprovado. */
export function buildApprovedEmail(input: {
  email: string;
  name: string;
  server: string;
}): EmailMessage {
  return {
    to: input.email,
    subject: "Sua conta do Terra Perdida esta pronta",
    text: [
      "O pedido de conta foi aprovado.",
      "",
      "Nome: " + input.name,
      "Servidor: " + input.server,
      "",
      "Use o nome e a chave que voce escolheu para entrar no jogo."
    ].join("\n")
  };
}
