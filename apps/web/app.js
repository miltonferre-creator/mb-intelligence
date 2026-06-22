(function () {
  window.MBI = window.MBI || {};

  const root = document.getElementById("root");
  let toastMessage = "";
  let activeModal = null;

  function openModal(modal) {
    if (!modal) return;
    activeModal = modal;
    document.body.classList.add("modal-open");
    render();
  }

  // Fecha sem re-render (usado quando o render ja vira por showToast)
  function dismissModal() {
    activeModal = null;
    document.body.classList.remove("modal-open");
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal = null;
    document.body.classList.remove("modal-open");
    render();
  }
  // TODO: preencher cnpj e crc da MB antes de gerar relatórios para clientes reais
  const MB_REPORT_CONFIG = Object.assign({
    companyName: "MB Assessoria Empresarial",
    cnpj: "", // ex: "00.000.000/0001-00"
    crc: ""   // ex: "CRC/CE 00000"
  }, window.MB_REPORT_CONFIG || {});

  function route() {
    return window.location.hash || "#/login";
  }

  function navigate(nextRoute) {
    window.location.hash = nextRoute;
  }

  function defaultRouteForSession(session) {
    return session?.type === "mb" ? "#/admin/operacao" : "#/cliente/inicio";
  }

  function showToast(message) {
    toastMessage = message;
    render();
    window.setTimeout(() => {
      toastMessage = "";
      const toast = document.querySelector(".toast");
      if (toast) toast.remove();
    }, 2800);
  }

  function render() {
    const currentRoute = route();
    const session = MBI.auth.currentSession();

    if (!session) {
      if (currentRoute === "#/contratar") root.innerHTML = MBI.pages.auth.register();
      else if (currentRoute === "#/recuperar-senha") root.innerHTML = MBI.pages.auth.resetPassword();
      else if (currentRoute === "#/privacidade") root.innerHTML = MBI.pages.auth.privacy();
      else root.innerHTML = MBI.pages.auth.login();
      root.insertAdjacentHTML("beforeend", MBI.ui.toast(toastMessage));
      refreshIcons();
      return;
    }

    if (currentRoute === "#/privacidade") {
      root.innerHTML = MBI.pages.auth.privacy();
      root.insertAdjacentHTML("beforeend", MBI.ui.toast(toastMessage));
      refreshIcons();
      return;
    }

    if (currentRoute === "#/login" || currentRoute === "#/contratar") {
      navigate(defaultRouteForSession(session));
      return;
    }

    if (session.type === "mb") {
      root.innerHTML = MBI.pages.admin.render(currentRoute);
    } else {
      root.innerHTML = MBI.pages.client.render(currentRoute);
    }

    root.insertAdjacentHTML("beforeend", MBI.ui.toast(toastMessage));
    if (activeModal) root.insertAdjacentHTML("beforeend", MBI.ui.modal(activeModal));
    refreshIcons();
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function busyText(form) {
    const labels = {
      login: "Entrando...",
      "register-client": "Criando cadastro...",
      "admin-create-client": "Cadastrando cliente...",
      "update-plan-prices": "Salvando valores...",
      "update-finance": "Atualizando indicadores...",
      "create-task": "Criando pendencia...",
      "publish-document": "Enviando documento...",
      "admin-import": "Carregando arquivo...",
      "create-user": "Criando usuario...",
      "change-password": "Alterando senha...",
      message: "Enviando mensagem..."
    };
    return labels[form.dataset.form] || "Processando...";
  }

  function setFormBusy(form, busy) {
    const buttons = [...form.querySelectorAll("button[type='submit']")];
    if (busy) {
      form.dataset.busy = "true";
      form.classList.add("is-busy");
      form.setAttribute("aria-busy", "true");
      buttons.forEach((button) => {
        button.dataset.originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<span class="spinner" aria-hidden="true"></span>${busyText(form)}`;
      });
      let status = form.querySelector("[data-form-status]");
      if (!status) {
        status = document.createElement("div");
        status.className = "form-status";
        status.dataset.formStatus = "true";
        form.appendChild(status);
      }
      status.textContent = busyText(form);
      return;
    }
    delete form.dataset.busy;
    form.classList.remove("is-busy");
    form.removeAttribute("aria-busy");
    buttons.forEach((button) => {
      button.disabled = false;
      if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    });
    form.querySelector("[data-form-status]")?.remove();
  }

  function formatBytes(value) {
    const size = Number(value || 0);
    if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
    if (size >= 1024) return `${Math.round(size / 1024)} KB`;
    return `${size} bytes`;
  }

  function safeDownloadName(value, fallback = "Documento_MB") {
    const base = String(value || fallback)
      .replace(/\.[a-z0-9]{2,8}$/i, "")
      .replace(/[\\/:*?"<>|]+/g, " ")
      .trim()
      .replace(/\s+/g, "_");
    return base || fallback;
  }

  function openLocalFileDb() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return resolve(null);
      const request = indexedDB.open("mbi.document.files.v1", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function putLocalDocumentFile(documentId, file) {
    if (!file) return;
    const db = await openLocalFileDb();
    if (!db) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put({
        id: String(documentId),
        file,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        updatedAt: new Date().toISOString()
      });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async function getLocalDocumentFile(documentId) {
    const db = await openLocalFileDb();
    if (!db) return null;
    const record = await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readonly");
      const request = tx.objectStore("files").get(String(documentId));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return record;
  }

  async function deleteLocalDocumentFile(documentId) {
    const db = await openLocalFileDb();
    if (!db) return;
    await new Promise((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").delete(String(documentId));
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  function triggerBlobDownload(fileName, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "Documento_MB";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function triggerTextDownload(fileName, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(fileName, blob);
  }

  async function publishDocumentLocal(form, data) {
    const file = form.querySelector("input[type='file'][name='file']")?.files?.[0] || null;
    const document = MBI.services.documents.create({
      ...data,
      file,
      fileName: file?.name || data.name,
      originalFileName: file?.name || data.name,
      mimeType: file?.type,
      size: file?.size
    });
    await putLocalDocumentFile(document.id, file);
    return document;
  }

  async function localDocumentDownload(documentId) {
    const db = MBI.storage.getDatabase();
    const doc = (db.documents || []).find((item) => String(item.id) === String(documentId));
    if (!doc) throw new Error("Documento nao encontrado no ambiente local.");
    const stored = await getLocalDocumentFile(documentId);
    if (stored?.file) {
      triggerBlobDownload(stored.fileName || doc.fileName || doc.name, stored.file);
      showToast("Arquivo original baixado.");
      return;
    }
    const client = MBI.services.clients.get(doc.clientId);
    const lines = [
      "MB Intelligence - Registro local de documento",
      "",
      `Cliente: ${client?.name || doc.clientId || "-"}`,
      `Descricao: ${doc.description || doc.name || "-"}`,
      `Arquivo original: ${doc.fileName || doc.originalFileName || doc.name || "Documento MB"}`,
      `Categoria: ${doc.category || "-"}`,
      `Competencia: ${doc.competence || "-"}`,
      `Vencimento: ${doc.dueDate || doc.due || "-"}`,
      `Status: ${doc.status || "-"}`,
      `Visibilidade: ${doc.visibility || "Cliente"}`,
      "",
      "Observacao:",
      "Este arquivo foi gerado pelo modo local da plataforma. Em producao, o download abre o arquivo original enviado pela equipe MB no Supabase Storage."
    ];
    triggerTextDownload(`${safeDownloadName(doc.fileName || doc.name)}.txt`, lines.join("\n"));
    showToast("Arquivo original nao foi localizado no modo local; baixei o registro do documento.");
  }

  async function remoteDocumentDownload(documentId) {
    const result = await MBI.api.request(`/documents/${documentId}/download`);
    if (!result?.url) throw new Error("Link de download nao encontrado.");
    try {
      const response = await fetch(result.url);
      if (!response.ok) throw new Error("Storage indisponivel.");
      const blob = await response.blob();
      triggerBlobDownload(result.fileName || "Documento_MB", blob);
    } catch (error) {
      window.open(result.url, "_blank", "noopener");
    }
    showToast("Link de download gerado.");
  }

  async function downloadDocument(documentId) {
    const session = MBI.auth.currentSession();
    if (!session?.token) {
      localDocumentDownload(documentId);
      return;
    }

    try {
      await remoteDocumentDownload(documentId);
    } catch (error) {
      if (error.apiUnavailable) {
        localDocumentDownload(documentId);
        return;
      }
      const expired = error.status === 401 || /sess[aã]o|expirad/i.test(error.message || "");
      if (expired) {
        if (!session.refreshToken) {
          localDocumentDownload(documentId);
          return;
        }
        showToast("Sessao expirada. Entre novamente para baixar documentos reais.");
        return;
      }
      throw error;
    }
  }

  function normalizeCnpj(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function isValidCnpj(value) {
    const cnpj = normalizeCnpj(value);
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    const calc = (factors) => {
      const sum = factors.reduce((total, factor, index) => total + Number(cnpj[index]) * factor, 0);
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };
    return calc([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[12])
      && calc([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[13]);
  }

  function assertValidCnpj(data, currentClientId = null) {
    if (!isValidCnpj(data.cnpj)) throw new Error("CNPJ invalido. Verifique os digitos antes de cadastrar.");
    const duplicated = MBI.services.clients.list().find((client) => normalizeCnpj(client.cnpj) === normalizeCnpj(data.cnpj) && String(client.id) !== String(currentClientId || ""));
    if (duplicated) throw new Error("Ja existe um cliente cadastrado com este CNPJ.");
  }

  async function remoteOrLocal(remoteFn, localFn) {
    const session = MBI.auth.currentSession();
    if (session?.token) {
      try {
        const result = await remoteFn();
        await MBI.sync.refreshIfPossible();
        return result;
      } catch (error) {
        if (!error.apiUnavailable) throw error;
      }
    }
    return localFn();
  }

  async function handleSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    if (form.dataset.busy === "true") return;
    const requiredFile = form.querySelector("input[type='file'][required]");
    if (requiredFile && !requiredFile.files?.length) {
      showToast("Selecione um arquivo antes de carregar.");
      return;
    }
    if (!form.reportValidity()) return;
    const data = formData(form);
    // Campos monetarios (R$) voltam a numero antes de persistir
    form.querySelectorAll("[data-money]").forEach((el) => {
      if (el.name) data[el.name] = MBI.ui.moneyParse(el.value);
    });
    const inModal = !!form.closest(".modal-overlay");
    setFormBusy(form, true);

    try {
      if (form.dataset.form === "login") {
        const session = await MBI.auth.login(data);
        navigate(defaultRouteForSession(session));
        return;
      }

      if (form.dataset.form === "register-client") {
        assertValidCnpj(data);
        await MBI.auth.registerClient(data);
        navigate("#/cliente/onboarding");
        return;
      }

      if (form.dataset.form === "reset-password") {
        await MBI.auth.resetPassword(data.email);
        showToast("Se o e-mail estiver cadastrado, voce receberá um link de recuperação em breve.");
        navigate("#/login");
        return;
      }

      if (form.dataset.form === "select-competence") {
        MBI.services.finance.setSelectedCompetence(data.clientId, data.competence);
        if (MBI.auth.currentSession()?.token) {
          const finance = await MBI.api.request(`/finance/${data.clientId}?competence=${encodeURIComponent(data.competence)}`);
          MBI.storage.updateDatabase((db) => {
            db.financials[data.clientId] = { ...(db.financials[data.clientId] || {}), ...(finance.data || {}) };
          });
        }
        showToast(`Competencia ${MBI.services.finance.monthLabel(data.competence)} selecionada.`);
        return;
      }

      if (form.dataset.form === "admin-client-filters") {
        const session = MBI.auth.currentSession();
        session.uiFilters = { ...(session.uiFilters || {}), adminClients: data };
        MBI.storage.setSession(session);
        showToast("Filtros da carteira aplicados.");
        return;
      }

      if (form.dataset.form === "document-filters") {
        const session = MBI.auth.currentSession();
        const key = data.scope === "admin" ? "adminDocuments" : "clientDocuments";
        session.uiFilters = { ...(session.uiFilters || {}), [key]: data };
        MBI.storage.setSession(session);
        showToast("Filtros de documentos aplicados.");
        return;
      }

      if (form.dataset.form === "select-admin-client") {
        MBI.services.clients.setCurrentClient(data.clientId);
        showToast("Cliente em operação atualizado.");
        return;
      }

      if (form.dataset.form === "admin-create-client") {
        assertValidCnpj(data);
        const client = await remoteOrLocal(
          async () => (await MBI.api.request("/clients", { method: "POST", body: data })).data,
          () => MBI.services.clients.create(data)
        );
        MBI.services.clients.setCurrentClient(client.id);
        if (inModal) dismissModal();
        showToast("Cliente cadastrado e selecionado para operação.");
        return;
      }

      if (form.dataset.form === "update-plan-prices") {
        await remoteOrLocal(
          async () => {
            for (const plan of MBI.services.plans.list()) {
              await MBI.api.request(`/plans/${plan.id}`, {
                method: "PATCH",
                body: { price: data[`price_${plan.id}`] }
              });
            }
          },
          () => MBI.services.plans.list().forEach((plan) => MBI.services.plans.updatePrice(plan.id, data[`price_${plan.id}`]))
        );
        showToast("Valores dos planos atualizados.");
        return;
      }

      if (form.dataset.form === "update-finance") {
        await remoteOrLocal(
          async () => MBI.api.request(`/finance/${data.clientId}`, { method: "PATCH", body: data }),
          () => MBI.services.finance.update(data.clientId, data)
        );
        if (inModal) dismissModal();
        showToast("Indicadores do cliente atualizados.");
        return;
      }

      if (form.dataset.form === "create-task") {
        await remoteOrLocal(
          async () => MBI.api.request("/tasks", { method: "POST", body: data }),
          () => MBI.storage.updateDatabase((db) => {
            db.tasks.push({
              id: MBI.storage.nowId("tsk"),
              clientId: data.clientId,
              title: data.title,
              priority: data.priority || "Media",
              owner: data.owner || "MB",
              due: data.due || "Sem prazo",
              status: data.status || "Pendente",
              origin: data.origin || "MB"
            });
          })
        );
        form.reset();
        showToast("Pendencia criada para acompanhamento.");
        return;
      }

      if (form.dataset.form === "update-client-profile") {
        assertValidCnpj(data, data.clientId);
        await remoteOrLocal(
          async () => MBI.api.request(`/clients/${data.clientId}`, { method: "PATCH", body: data }),
          () => MBI.services.clients.updateProfile(data.clientId, data)
        );
        if (inModal) dismissModal();
        showToast("Ficha operacional do cliente atualizada.");
        return;
      }

      if (form.dataset.form === "publish-document") {
        const fileInput = form.querySelector("input[type='file'][name='file']");
        const file = fileInput?.files?.[0];
        const DIRECT_UPLOAD_THRESHOLD = 2 * 1024 * 1024; // 2MB — acima disso vai direto ao Storage
        await remoteOrLocal(
          async () => {
            if (file && file.size > DIRECT_UPLOAD_THRESHOLD) {
              // 1. Pede URL assinada para upload direto
              const urlRes = await MBI.api.request("/documents/upload-url", {
                method: "POST",
                body: { clientId: data.clientId, fileName: file.name, category: data.category, competence: data.competence }
              });
              // 2. Upload direto ao Supabase Storage (sem passar pelo Vercel)
              const uploadResponse = await fetch(urlRes.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type || "application/octet-stream" },
                body: file
              });
              if (!uploadResponse.ok) throw new Error("Falha no upload direto ao Storage.");
              // 3. Registra metadados sem o arquivo (já está no Storage)
              await MBI.api.request("/documents", {
                method: "POST",
                body: { ...data, storagePath: urlRes.storagePath, fileName: file.name, mimeType: file.type, fileSize: file.size }
              });
            } else {
              // Arquivo pequeno: fluxo normal via API
              await MBI.api.request("/documents", { method: "POST", body: new FormData(form) });
            }
          },
          () => publishDocumentLocal(form, data)
        );
        showToast("Documento publicado no portal do cliente.");
        return;
      }

      if (form.dataset.form === "admin-import") {
        const uploadData = new FormData(form);
        await remoteOrLocal(
          async () => MBI.api.request("/imports", { method: "POST", body: uploadData }),
          () => MBI.services.imports.create(data)
        );
        showToast("Importação registrada para validação MB.");
        return;
      }

      if (form.dataset.form === "create-user") {
        await remoteOrLocal(
          async () => MBI.api.request("/users", { method: "POST", body: data }),
          () => MBI.services.users.create(data)
        );
        if (inModal) dismissModal();
        showToast("Usuário criado com acesso local.");
        return;
      }

      if (form.dataset.form === "edit-user") {
        const patch = { name: data.name, role: data.role };
        if (data.status) patch.status = data.status;
        await remoteOrLocal(
          async () => MBI.api.request(`/users/${data.userId}`, { method: "PATCH", body: patch }),
          () => MBI.services.users.update(data.userId, patch)
        );
        if (inModal) dismissModal();
        showToast("Usuário atualizado.");
        return;
      }

      if (form.dataset.form === "change-password") {
        if (data.newPassword !== data.confirmPassword) throw new Error("A confirmacao da senha nao confere.");
        await remoteOrLocal(
          async () => MBI.api.request("/auth/change-password", { method: "POST", body: data }),
          () => MBI.storage.updateDatabase((db) => {
            const user = db.users.find((item) => item.id === MBI.auth.currentUser()?.id);
            if (user) user.password = data.newPassword;
          })
        );
        form.reset();
        showToast("Senha atualizada com sucesso.");
        return;
      }

      if (form.dataset.form === "message") {
        await remoteOrLocal(
          async () => MBI.api.request("/messages", { method: "POST", body: data }),
          () => MBI.storage.updateDatabase((db) => {
            db.messages.push({
              id: MBI.storage.nowId("msg"),
              clientId: data.clientId,
              from: MBI.auth.currentUser()?.type === "mb" ? "MB" : "Cliente",
              text: data.text,
              at: new Date().toLocaleString("pt-BR")
            });
          })
        );
        showToast("Mensagem registrada.");
      }
    } catch (error) {
      showToast(error.message || "Não foi possível concluir a ação.");
    } finally {
      setFormBusy(form, false);
    }
  }

  async function handleClick(event) {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      document.body.classList.remove("nav-open");
      navigate(routeButton.dataset.route);
      return;
    }


    // Backdrop do modal: clicar fora do card fecha
    if (activeModal && event.target.matches && event.target.matches("[data-modal-overlay]")) {
      closeModal();
      return;
    }

    const action = event.target.closest("[data-action]");
    if (!action) return;

    if (action.dataset.action === "modal-close") {
      closeModal();
      return;
    }

    if (action.dataset.action === "open-modal") {
      openModal(MBI.pages.admin.buildModal(action.dataset.modal, action.dataset));
      return;
    }

    if (action.dataset.action === "logout") {
      await MBI.auth.logout();
      navigate("#/login");
      render();
      return;
    }

    if (action.dataset.action === "toggle-sidebar") {
      if (window.matchMedia("(max-width: 900px)").matches) {
        document.body.classList.toggle("nav-open");
      } else {
        const collapsed = document.body.classList.toggle("nav-collapsed");
        try { localStorage.setItem("mbi.ui.nav", collapsed ? "collapsed" : "expanded"); } catch (error) {}
      }
      return;
    }

    if (action.dataset.action === "focus-admin-imports") {
      document.getElementById("admin-imports")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (action.dataset.action === "edit-finance-period") {
      const clientId = action.dataset.clientId;
      const competence = action.dataset.competence;
      MBI.services.clients.setCurrentClient(clientId);
      MBI.services.finance.setSelectedCompetence(clientId, competence);
      if (MBI.auth.currentSession()?.token) {
        try {
          const finance = await MBI.api.request(`/finance/${clientId}?competence=${encodeURIComponent(competence)}`);
          MBI.storage.updateDatabase((db) => {
            db.financials[clientId] = { ...(db.financials[clientId] || {}), ...(finance.data || {}) };
          });
        } catch (error) {}
      }
      openModal(MBI.pages.admin.buildModal("finance", { competence }));
      return;
    }

    if (action.dataset.action === "set-client") {
      MBI.services.clients.setCurrentClient(action.dataset.clientId);
      showToast("Cliente selecionado para operação.");
      render();
      return;
    }

    if (action.dataset.action === "suspend-client") {
      const id = action.dataset.clientId;
      const client = MBI.services.clients.get(id);
      const next = client?.status === "Pausado" ? "Ativo" : "Pausado";
      if (!window.confirm(next === "Pausado" ? "Suspender o acesso deste cliente ao portal?" : "Reativar o acesso deste cliente?")) return;
      try {
        await remoteOrLocal(
          async () => MBI.api.request(`/clients/${id}`, { method: "PATCH", body: { status: next } }),
          () => MBI.services.clients.updateProfile(id, { status: next })
        );
        showToast(next === "Pausado" ? "Cliente suspenso." : "Cliente reativado.");
        render();
      } catch (error) {
        showToast(error.message || "Não foi possível alterar o status.");
      }
      return;
    }

    if (action.dataset.action === "deactivate-user") {
      if (!window.confirm("Desativar este usuario sem excluir o historico?")) return;
      await remoteOrLocal(
        async () => MBI.api.request(`/users/${action.dataset.userId}`, { method: "PATCH", body: { status: "Inativo" } }),
        () => MBI.services.users.deactivate(action.dataset.userId)
      );
      showToast("Usuario desativado.");
      return;
    }

    if (action.dataset.action === "print-report") {
      printReport(action.dataset.report);
      return;
    }

    if (action.dataset.action === "export-report") {
      exportReport(action.dataset.report);
      return;
    }

    if (action.dataset.action === "document-download") {
      const original = action.innerHTML;
      try {
        action.disabled = true;
        action.innerHTML = `<span class="spinner" aria-hidden="true"></span>Gerando link...`;
        await downloadDocument(action.dataset.documentId);
      } catch (error) {
        showToast(error.message || "Não foi possível gerar o download.");
      } finally {
        action.disabled = false;
        action.innerHTML = original;
      }
      return;
    }

    if (action.dataset.action === "delete-document") {
      if (!window.confirm("Excluir este documento do portal do cliente?")) return;
      const original = action.innerHTML;
      try {
        action.disabled = true;
        action.innerHTML = `<span class="spinner" aria-hidden="true"></span>Excluindo...`;
        await remoteOrLocal(
          async () => MBI.api.request(`/documents/${action.dataset.documentId}`, { method: "DELETE" }),
          async () => {
            MBI.services.documents.remove(action.dataset.documentId);
            await deleteLocalDocumentFile(action.dataset.documentId);
          }
        );
        await deleteLocalDocumentFile(action.dataset.documentId);
        showToast("Documento excluido do portal.");
      } catch (error) {
        showToast(error.message || "Nao foi possivel excluir o documento.");
      } finally {
        action.disabled = false;
        action.innerHTML = original;
      }
      return;
    }

    showToast("Ação registrada localmente.");
  }

  function handleInput(event) {
    const el = event.target;
    if (!el || !el.classList || !el.classList.contains("money-input")) return;
    const digits = el.value.replace(/\D/g, "");
    const cents = digits ? parseInt(digits, 10) : 0;
    el.value = MBI.ui.moneyFromCents(cents);
  }

  function handleChange(event) {
    const input = event.target.closest("input[type='file']");
    if (!input) return;
    const file = input.files?.[0];
    const zone = input.closest(".upload-zone");
    if (!zone) return;

    zone.classList.toggle("has-file", Boolean(file));
    let feedback = zone.querySelector(".upload-feedback");
    if (!feedback) {
      feedback = document.createElement("span");
      feedback.className = "upload-feedback";
      zone.appendChild(feedback);
    }
    feedback.textContent = file ? `Arquivo selecionado: ${file.name} (${formatBytes(file.size)})` : "Nenhum arquivo selecionado.";

    const form = input.closest("form");
    const nameInput = form?.querySelector("input[name='fileName'], input[name='name']");
    if (file && nameInput && (!nameInput.value || /extrato_maio|DAS Junho|arquivo|documento/i.test(nameInput.value))) {
      nameInput.value = file.name;
    }
  }

  function printReport(type) {
    const client = MBI.services.clients.current();
    const data = MBI.services.finance.get(client.id);
    const title = type === "dre" ? "DRE Gerencial" : "Fluxo de Caixa";
    const rows = normalizeReportRows(type === "dre" ? data.dre : data.cashBridge);
    const issuedAt = new Date();
    const competenceLabel = data.competenceLabel || MBI.services.finance.monthLabel(data.competence || MBI.services.finance.selectedCompetence(client.id));
    const registry = [MB_REPORT_CONFIG.cnpj ? `CNPJ: ${MB_REPORT_CONFIG.cnpj}` : "", MB_REPORT_CONFIG.crc || ""].filter(Boolean).join(" · ");
    const docNumber = `MBI-${issuedAt.getFullYear()}${String(issuedAt.getMonth() + 1).padStart(2, "0")}-${client.id}-${type}`.toUpperCase();
    const report = window.open("", "_blank");
    report.document.write(`
      <html lang="pt-BR">
        <head>
          <title>${title} - ${client.name}</title>
          <style>
            :root{--brand:#5b070b;--ink:#111318;--muted:#667085;--line:#dfe4ea;--soft:#f5f6f8}
            body{font-family:Arial,sans-serif;margin:34px;color:var(--ink);font-size:13px}
            header{display:grid;grid-template-columns:150px 1fr;gap:22px;border-bottom:4px solid var(--brand);padding-bottom:18px;margin-bottom:22px}
            header img{width:132px}
            h1{margin:0;font-size:26px;color:var(--brand)} p{color:var(--muted);margin:5px 0}
            .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 20px}
            .meta div{border:1px solid var(--line);padding:10px;background:var(--soft)}
            .meta strong{display:block;color:var(--muted);font-size:10px;text-transform:uppercase}
            table{width:100%;border-collapse:collapse;margin-top:12px}
            th,td{border:1px solid var(--line);padding:9px;text-align:left;vertical-align:top}
            th{background:var(--brand);color:#fff;font-size:11px;text-transform:uppercase}
            tr.section td{background:#f3e9ea;color:var(--brand);font-weight:700}
            tr.subtotal td,tr.total td{font-weight:700;background:#f7f7f7}
            tr.total td{border-top:2px solid var(--brand)}
            .note{margin-top:18px;border-left:4px solid var(--brand);padding:12px 14px;background:var(--soft)}
            .signatures{display:grid;grid-template-columns:1fr 1fr;gap:44px;margin-top:48px}
            .signature{border-top:1px solid var(--ink);padding-top:8px;text-align:center}
            footer{position:fixed;bottom:18px;left:34px;right:34px;border-top:1px solid var(--line);padding-top:8px;color:var(--muted);font-size:10px;display:flex;justify-content:space-between;gap:20px}
          </style>
        </head>
        <body>
          <header>
            <img src="assets/mb-logo-premium.svg" alt="MB Assessoria Empresarial" onerror="this.replaceWith(document.createTextNode('${MB_REPORT_CONFIG.companyName}'))">
            <div>
              <h1>${title}</h1>
              <p>Relatório gerencial emitido pela plataforma MB Intelligence</p>
              <p>${escapeHtml(MB_REPORT_CONFIG.companyName)}${registry ? ` · ${escapeHtml(registry)}` : ""}</p>
            </div>
          </header>
          <section class="meta">
            <div><strong>Cliente</strong>${escapeHtml(client.name)}</div>
            <div><strong>CNPJ</strong>${escapeHtml(client.cnpj || "Não informado")}</div>
            <div><strong>Documento</strong>${docNumber}</div>
            <div><strong>Competência</strong>${escapeHtml(competenceLabel)}</div>
            <div><strong>Consultor MB</strong>${escapeHtml(client.consultant || "MB")}</div>
            <div><strong>Emissão</strong>${issuedAt.toLocaleString("pt-BR")}</div>
          </section>
          <table><thead><tr><th>Descrição</th><th>Valor</th><th>Referência</th><th>Status</th></tr></thead><tbody>${rows.map((row) => `<tr class="${row.type || ""}"><td>${escapeHtml(row.label)}</td><td>${row.type === "section" ? "" : row.isIndicator ? `${Math.round(row.amount || 0)} dias` : MBI.ui.money(row.amount)}</td><td>${escapeHtml(row.reference || row.percent || "")}</td><td>${escapeHtml(row.status || row.variation || "")}</td></tr>`).join("")}</tbody></table>
          <section class="note"><strong>Análise MB</strong><p>${escapeHtml(data.insights?.[0] || "Relatório emitido com base nos dados disponíveis e revisados pela MB.")}</p><p>Este relatório é de uso gerencial e não substitui demonstrações contábeis formais quando exigidas por legislação específica.</p></section>
          <section class="signatures">
            <div class="signature"><strong>Responsável Técnico / Consultor MB</strong><br>${escapeHtml(client.consultant || "MB Empresas Assessoria")}<br>CRC: __________________</div>
            <div class="signature"><strong>Responsável pela empresa</strong><br>${escapeHtml(client.owner || "Cliente")}<br>Data: ____/____/______</div>
          </section>
          <footer><span>Documento gerado pela plataforma MB Intelligence</span><span>${docNumber}</span></footer>
          <script>window.print();<\/script>
        </body>
      </html>
    `);
    report.document.close();
  }

  function exportReport(type) {
    const client = MBI.services.clients.current();
    const data = MBI.services.finance.get(client.id);
    const title = type === "dre" ? "DRE Gerencial" : "Fluxo de Caixa";
    const competenceLabel = data.competenceLabel || MBI.services.finance.monthLabel(data.competence || MBI.services.finance.selectedCompetence(client.id));
    const rows = [
      ["Relatorio", title, "", ""],
      ["Cliente", client.name, "", ""],
      ["CNPJ", client.cnpj || "Nao informado", "", ""],
      ["Competencia", competenceLabel, "", ""],
      ["Gerado em", new Date().toLocaleString("pt-BR"), "", ""],
      [],
      ["Descricao", "Valor", "Referencia", "Status"],
      ...normalizeReportRows(type === "dre" ? data.dre : data.cashBridge).map((row) => [row.label, row.isIndicator ? `${Math.round(row.amount || 0)} dias` : row.amount, row.reference || row.percent || "", row.status || row.variation || ""])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type === "dre" ? "DRE" : "Fluxo_Caixa"}_${client.name.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Arquivo CSV/Excel gerado.");
  }

  function normalizeReportRows(rows) {
    return (rows || []).map((row) => {
      if (!Array.isArray(row)) return { ...row, isIndicator: row.type === "indicator" };
      return { label: row[0], amount: row[1], reference: row[2], type: row[2], status: row[3] || "" };
    });
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  window.addEventListener("hashchange", () => { activeModal = null; document.body.classList.remove("modal-open"); render(); });
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal) closeModal();
  });

  async function boot() {
    try { if (localStorage.getItem("mbi.ui.nav") !== "expanded") document.body.classList.add("nav-collapsed"); } catch (error) {}
    MBI.storage.getDatabase();
    if (MBI.auth.currentSession()?.token) {
      await MBI.sync.refreshIfPossible();
    }
    render();
  }

  boot();
})();
