# MB Intelligence - Resumo de Entrega para Desenvolvedores

Data da entrega: 21/06/2026

Este pacote contem a base atual do produto MB Intelligence para continuidade por novos desenvolvedores.

## 1. Visao do produto

A MB Intelligence e uma plataforma de inteligencia financeira e gestao operacional para PMEs.

Ela nao deve ser entendida como ERP, sistema bancario, sistema fiscal ou sistema financeiro transacional completo.

O produto atua como uma camada de:

- consolidacao de dados financeiros, fiscais e documentais;
- portal do cliente;
- central de documentos e guias;
- inteligencia financeira com apoio de IA;
- DRE gerencial e fluxo de caixa;
- cockpit operacional interno da MB;
- apoio tecnologico ao modelo CFO as a Service.

## 2. Publicos atendidos

### Cliente final da MB

Empresario ou usuario da empresa cliente que acessa documentos, guias, DAS, dashboards, DRE, fluxo de caixa, alertas, pendencias, comunicacao, relatorios e analises liberadas pela MB.

### Equipe interna MB

Usuarios administrativos, fiscais, contabeis, financeiros, trabalhistas, atendimento e consultores CFO que operam clientes, publicam documentos, alimentam dados, aprovam analises, acompanham tarefas, SLAs e governanca.

## 3. Planos comerciais

### Plano Contabilidade

Foco em documentos, guias, DAS, obrigações e portal simples.

Principais recursos:

- documentos e guias;
- DAS;
- documentos fiscais, contabeis e trabalhistas basicos;
- avisos e pendencias simples;
- vencimentos e comunicacao basica.

### Plano Financeiro IA

Foco em dashboards gerenciais e analises automaticas.

Principais recursos:

- tudo do Plano Contabilidade;
- faturamento;
- fiscal;
- folha;
- dashboard financeiro;
- observacoes de IA;
- DRE e fluxo de caixa gerencial quando ha dados suficientes;
- importacoes de arquivos.

### Plano CFO as a Service

Foco em analise executiva e apoio consultivo.

Principais recursos:

- tudo do Plano Financeiro IA;
- DRE completa;
- fluxo de caixa completo;
- MB Financial Score;
- capacidade de investimento;
- pareceres e relatorios executivos;
- recomendacoes estrategicas;
- revisao e aprovacao humana pela MB.

## 4. Estrutura tecnica da pasta

- `apps/web`: aplicacao web do produto.
- `apps/api`: backend Node.js com API HTTP.
- `infra/supabase`: migrations, estrategia de storage e scripts de manutencao.
- `product`: regras de produto, MVP, planos e decisoes pendentes.
- `architecture`: visao tecnica e modelo de dados inicial.
- `backlog`: backlog e sprint inicial.
- `docs`: auditorias, requisitos, analises criticas e documentos de apoio.
- `reference/prototipo-atual`: prototipo antigo preservado como referencia.

## 5. Stack atual

### Frontend

- HTML, CSS e JavaScript sem framework pesado.
- Roteamento por hash no navegador.
- Telas de autenticacao, portal do cliente e administracao MB.
- Fallback local via localStorage quando a API nao esta ativa.

### Backend

- Node.js com servidor HTTP proprio.
- API local em `apps/api/src/server.js`.
- API conectada ao Supabase em `apps/api/src/server-supabase.js`.
- Rotas para login, clientes, planos, documentos, importacoes, financeiro, usuarios, mensagens, tarefas, aprovacoes e auditoria.

### Banco e arquivos

- Supabase PostgreSQL para dados estruturados.
- Supabase Auth para login.
- Supabase Storage para arquivos enviados pela MB.
- Bucket previsto: `mb-documents`.
- Arquivos locais e JSON ainda existem como fallback de desenvolvimento.

## 6. Modulos existentes

### Portal do cliente

- login unico;
- dashboard por plano;
- documentos;
- inteligencia financeira;
- DRE;
- fluxo de caixa;
- MB Financial Score;
- Copiloto financeiro;
- comunicacao;
- perfil;
- troca de senha;
- relatorios/impressao em areas financeiras.

### Administracao MB

- cockpit operacional;
- gestao de clientes;
- gestao de planos e precos;
- cadastro de clientes;
- cadastro de usuarios;
- documentos publicados pela MB;
- importacoes;
- alimentar portal;
- aprovacoes de IA e relatorios;
- tarefas e pendencias;
- comunicacao;
- auditoria;
- relatorios operacionais.

## 7. Dados e governanca

O produto ja contempla conceitos importantes de governanca:

- separacao entre cliente e equipe MB;
- planos com liberacao de modulos;
- niveis de maturidade dos dados;
- bloqueio por plano e por dados insuficientes;
- aprovacao MB antes de liberar analises relevantes;
- trilha de auditoria;
- separacao entre regra de calculo e interpretacao por IA;
- historico por competencia financeira;
- documentos associados a cliente, categoria, competencia, status e arquivo original.

## 8. Arquivos e documentos

O fluxo correto previsto e:

1. Equipe MB faz upload do documento.
2. Arquivo e salvo no Supabase Storage.
3. Metadados ficam no banco, na tabela de documentos.
4. Cliente visualiza e baixa o documento no portal.
5. O cliente nao precisa enviar documentos no portal como fluxo principal.

Observacao: documentos de importacao financeira devem ser tratados separadamente de documentos publicados ao cliente. Importacao serve para alimentar dados, DRE, fluxo de caixa, OFX, CSV, Excel, XML ou arquivos de sistemas externos.

## 9. Como rodar localmente

Na pasta da API:

```powershell
cd "C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\api"
.\start-api.ps1
```

URL local:

```text
http://localhost:3333
```

Tambem e possivel abrir a web diretamente:

```text
C:\MB EMPRESAS\MB_Intelligence_Produto_Final\apps\web\index.html
```

Quando a API esta ligada, o frontend usa o backend. Quando a API esta desligada, parte da experiencia continua com fallback local.

## 10. Deploy

Arquivos de apoio existentes:

- `DEPLOY.md`;
- `Dockerfile`;
- `railway.json`;
- `.env.example`.

O caminho recomendado e:

1. subir o projeto para um repositorio privado no GitHub;
2. configurar Railway ou Render;
3. configurar variaveis de ambiente do Supabase somente no provedor;
4. nao subir `.env` real para repositorio;
5. apontar o dominio `app.mbempresas.com.br` depois da validacao.

## 11. Pontos sensiveis de seguranca

Antes de producao com clientes reais:

- remover ou trocar senhas seed `123456`;
- revisar RLS e politicas do Supabase;
- manter service role apenas no backend;
- revisar LGPD, termos de uso e politica de privacidade;
- configurar backup;
- revisar logs e rate limit;
- usar HTTPS definitivo;
- revisar fluxo de recuperacao e troca de senha.

## 12. Backlog recomendado

Prioridade alta:

- estabilizar deploy;
- validar login real por perfil;
- revisar documentos e downloads;
- revisar aprovacao de analises;
- consolidar competencias mensais;
- validar DRE e fluxo de caixa por dados reais;
- melhorar relatorios impressos;
- preencher CNPJ/CRC oficiais da MB nos relatorios;
- limpar textos e dados de demonstracao antes de clientes reais.

Prioridade media:

- filtros e paginacao em listas;
- busca avancada de clientes;
- historico visual de score;
- alertas de vencimento;
- exportacao de relatorios;
- edicao e desativacao de usuarios;
- automacoes de onboarding.

Prioridade futura:

- Open Finance;
- integracoes com ERPs;
- IA preditiva;
- app mobile;
- benchmarking;
- automacao operacional avancada.

## 13. Observacoes para novos desenvolvedores

Este projeto nasceu de um prototipo validado e evoluiu para uma base de produto. Ainda existem arquivos de referencia e documentos de auditoria no pacote. Eles devem ser lidos antes de grandes refatoracoes.

O objetivo imediato nao e reescrever tudo. O melhor caminho e estabilizar a base atual, publicar em ambiente real, validar com poucos clientes piloto e depois evoluir os modulos criticos com disciplina de MVP.

