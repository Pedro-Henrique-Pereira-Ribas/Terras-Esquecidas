/* ============================================================
   TERRA PERDIDA — configuração do cliente
   ============================================================ */
(function () {
  "use strict";
  window.TP_CONFIG = window.TP_CONFIG || {
    // URL da API de contas e saves.
    // O site é publicado como Static Site e a API roda em outro serviço,
    // então as chamadas /api/* saem com o header de origem do site.
    // Para publicar tudo junto (mesma origem), deixe vazio: "" e apague a
    // origem do site da lista CORS_ORIGIN do Render.
    apiBase: "https://terras-esquecidas-back.onrender.com",

    // Durante o desenvolvimento local, o jogo tenta esta API primeiro.
    localApiBase: "http://localhost:3001",

    // Permite desligar a integração com o servidor e jogar só local.
    apiEnabled: true,

    // Tempo máximo de espera antes de cair no save local.
    requestTimeoutMs: 7000
  };
})();
