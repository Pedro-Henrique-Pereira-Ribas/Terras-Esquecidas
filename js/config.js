/* ============================================================
   TERRA PERDIDA — configuração do cliente
   ============================================================ */
(function () {
  "use strict";
  window.TP_CONFIG = window.TP_CONFIG || {
    // URL pública do Web Service no Render.
    // Troque se o serviço tiver outro nome ou estiver em outro domínio.
    apiBase: "https://terras-esquecidas.onrender.com",

    // Durante o desenvolvimento local, o jogo tenta esta API primeiro.
    localApiBase: "http://localhost:3001",

    // Tempo máximo de espera antes de cair no save local.
    requestTimeoutMs: 7000
  };
})();
