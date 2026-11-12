/* ============================================================
   TERRA PERDIDA — configuração do cliente
   ============================================================ */
(function () {
  "use strict";
  window.TP_CONFIG = window.TP_CONFIG || {
    // URL da API.
    // Vazio = mesma origem: o backend serve o frontend, então as chamadas
    // /api/* saem no mesmo host, sem CORS e sem latência entre domínios.
    // Preencha com a URL completa só se a API estiver em outro serviço.
    apiBase: "",

    // Durante o desenvolvimento local, o jogo tenta esta API primeiro.
    localApiBase: "http://localhost:3001",

    // Permite desligar a integração com o servidor e jogar só local.
    apiEnabled: true,

    // Tempo máximo de espera antes de cair no save local.
    requestTimeoutMs: 7000
  };
})();
