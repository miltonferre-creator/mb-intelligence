// Entry do Vite. Importa o CSS e os scripts (IIFEs que registram window.MBI) na
// MESMA ordem do index.html sem build. O lucide.min.js continua como <script>
// classico no index.html (UMD global), entao NAO entra aqui.
import "./styles.css";

import "./src/core/observability.js";
import "./src/data/seed.js";
import "./src/core/storage.js";
import "./src/core/api-client.js";
import "./src/core/sync.js";
import "./src/core/auth.js";
import "./src/services/audit-service.js";
import "./src/services/plan-service.js";
import "./src/services/client-service.js";
import "./src/services/document-service.js";
import "./src/services/import-service.js";
import "./src/services/user-service.js";
import "./src/services/finance-service.js";
import "./src/components/ui.js";
import "./src/pages/auth-pages.js";
import "./src/pages/client-pages.js";
import "./src/pages/admin-pages.js";
import "./app.js";
