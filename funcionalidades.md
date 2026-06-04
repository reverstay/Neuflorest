# neuflower — Registro de Funcionalidades

> **Instrução para o engenheiro sênior:**
> Este arquivo é o registro vivo do que existe, o que está em progresso e o que foi decidido mas ainda não implementado no neuflower.
> Atualize-o a cada PR mergeado que introduz, altera ou remove uma funcionalidade.
> Não documente detalhes de implementação aqui — isso vai nos arquivos de código e ADRs.
> Documente **o que o sistema faz**, **quem é responsável** por cada domínio e **qual o estado atual**.
> Convenção de status: `estável` | `em progresso` | `planejado` | `depreciado`

---

## Índice

- [Infraestrutura e arquitetura](#infraestrutura-e-arquitetura)
- [IoT — ESP32 e telemetria](#iot--esp32-e-telemetria)
- [Ingesta e processamento — Quarkus](#ingesta-e-processamento--quarkus)
- [Backend de aplicação — Django](#backend-de-aplicação--django)
- [Frontend — React](#frontend--react)
- [Banco de dados — PostgreSQL](#banco-de-dados--postgresql)
- [Segurança e autenticação](#segurança-e-autenticação)
- [Decisões arquiteturais registradas](#decisões-arquiteturais-registradas)

---

## Infraestrutura e arquitetura

| Funcionalidade | Status | Responsável | Observações |
|---|---|---|---|
| docker-compose com 5 serviços (nginx, django, quarkus, broker, postgres) | `planejado` | sênior | Rede interna isolada, só nginx exposto externamente |
| nginx como API gateway unificado | `planejado` | sênior | `/api/v1/app/` → Django, `/api/v1/iot/` → Quarkus |
| MQTT broker (EMQX ou Mosquitto) containerizado | `planejado` | sênior | QoS 0 para leituras frequentes, QoS 1 para estados de irrigação |
| Variáveis de ambiente por serviço via `.env` | `planejado` | sênior | Nunca commitar segredos; usar `.env.example` como referência |
| Health checks nos containers | `planejado` | sênior | `/health` em Django e Quarkus, verificados pelo compose |

---

## IoT — ESP32 e telemetria

| Funcionalidade | Status | Responsável | Observações |
|---|---|---|---|
| Publicação de telemetria via MQTT/TLS | `planejado` | sênior (firmware) | Payload JSON compacto na fase 1; migrar para CBOR/Protobuf na fase 2 |
| Autenticação por dispositivo (TLS mútuo ou token assinado) | `planejado` | sênior | Credenciais únicas por ESP32; sem segredo global de frota |
| Envelope de telemetria com sequence_number | `planejado` | sênior (firmware) | Usado para deduplicação no Quarkus |
| Leitura de umidade do solo (ADC + circuito de excitação) | `planejado` | sênior (hardware) | GPIO habilita excitação → estabilização → leitura → GPIO desliga |
| Leitura de temperatura e umidade do ar | `planejado` | sênior (hardware) | Sensor a definir (DHT22 ou SHT31) |
| Controle de bomba/válvula de irrigação | `planejado` | sênior (hardware) | Estado reportado no envelope de telemetria |
| Buffer local no ESP32 para reconexões Wi-Fi | `planejado` | sênior (firmware) | Armazenar mínimo de leituras offline antes de descartar |

---

## Ingesta e processamento — Quarkus

| Funcionalidade | Status | Responsável | Observações |
|---|---|---|---|
| Consumer MQTT assíncrono via broker | `planejado` | sênior | Smallrye Reactive Messaging ou Quarkus MQTT extension |
| Validação de schema do envelope de telemetria | `planejado` | sênior | Rejeitar payloads malformados antes de persistir |
| Deduplicação por `(device_id, sequence_number)` | `planejado` | sênior | Delegada ao índice UNIQUE no PostgreSQL; não manter estado em memória |
| Normalização de unidades (centi-graus, basis points) | `planejado` | sênior | Conversão para unidades canônicas antes da persistência |
| Adição de `received_at` server-side | `planejado` | sênior | Timestamp autoritativo; `device_ts` salvo como coluna diagnóstica |
| Batch insert na `iot_telemetry` | `planejado` | sênior | Agrupar escritas para reduzir contention no PostgreSQL |
| Dead-letter path para telemetria inválida | `planejado` | sênior | Destino a definir: tabela `iot_telemetry_rejected` ou log estruturado |
| API REST read-only de telemetria | `planejado` | sênior | `GET /api/v1/iot/devices/{id}/telemetry/` com paginação por cursor |
| Validação de JWT (RS256) emitido pelo Django | `planejado` | sênior | Chave pública injetada via variável de ambiente no container |

---

## Backend de aplicação — Django

| Funcionalidade | Status | Responsável | Observações |
|---|---|---|---|
| Modelo e API de usuários | `em progresso` | sênior / junior | Cadastro padrão com e-mail, senha e verificação OTP |
| Autenticação JWT (RS256) com Simple JWT ou similar | `em progresso` | sênior | Emissão do token; chave privada nunca sai do container Django |
| Verificação de e-mail por OTP | `em progresso` | sênior | OTP de 6 dígitos com hash, expiração, limite de tentativas e reenvio com cooldown |
| Login com Google OAuth SSO | `em progresso` | sênior | Frontend obtém ID token; Django valida com Google e emite JWT RS256 padrão |
| Catálogo de vasos 3D personalizados | `planejado` | junior | CRUD básico; sem lógica de preço na fase 1 |
| Catálogo de plantas | `planejado` | junior | Modelo com cuidados recomendados e espécie |
| Gestão de pedidos (e-commerce) | `planejado` | sênior | Fluxo de status: rascunho → confirmado → em produção → enviado → entregue |
| Registro e gerenciamento de dispositivos IoT | `planejado` | sênior | Device registry: ID, status (ativo/inativo/aposentado), vinculado ao pedido |
| Cronjob de agregação de telemetria → `plant_health_summary` | `planejado` | sênior | Celery Beat ou management command; a cada 5 min por padrão |
| API de saúde das plantas (serve `plant_health_summary`) | `planejado` | junior (após cronjob pronto) | `GET /api/v1/app/plants/{id}/health/` |
| Admin Django customizado | `planejado` | junior | `list_display`, `search_fields` e filtros básicos nos models principais |
| Documentação automática OpenAPI (drf-spectacular) | `planejado` | junior | Gerar e manter atualizado; exemplos de payload obrigatórios |

---

## Frontend — React

| Funcionalidade | Status | Responsável | Observações |
|---|---|---|---|
| Setup do projeto (Vite + TypeScript + Context API) | `em progresso` | sênior | Contextos de tema, idioma e autenticação extraídos; React Query segue planejado para cache remoto |
| Design system organic-luxury aplicado no frontend | `em progresso` | sênior | Tokens CSS claro/escuro, Playfair Display, DM Sans, moss green, warm sand e acentos premium |
| Páginas Landing, Shop, Login e Dashboard modularizadas | `em progresso` | sênior | Referência monolítica App.jsx convertida para TSX com componentes reutilizáveis |
| Autenticação — login, cadastro, OTP e Google SSO | `em progresso` | sênior | Sessão persistida no frontend com refresh automático; Google usa Web Client ID compartilhado entre React e Django; próxima etapa: refresh token em cookie httpOnly |
| Storefront — listagem do catálogo | `planejado` | junior | Filtros client-side por tipo de planta e tamanho de vaso |
| Storefront — página de produto | `planejado` | junior | Visualização do vaso 3D (placeholder na fase 1) e detalhes da planta |
| Storefront — carrinho e checkout | `planejado` | sênior | Integração com gateway de pagamento é zona bloqueada para juniores |
| Admin panel — dashboard de pedidos | `planejado` | junior | Listagem com status e filtros; sem edição de dados financeiros |
| Admin panel — dashboard de saúde das plantas | `planejado` | junior | Consome `plant_health_summary` via Django; indicadores de status por planta |
| Dashboard inicial com telemetria real | `em progresso` | sênior | Consome `fetchLatestTelemetryLog` no frontend e usa dados mockados como fallback visual |
| Componente `PlantStatusBadge` | `planejado` | junior | Saudável / Atenção / Crítico; acessível (aria-label) |
| Componente `PlantCard` | `planejado` | junior | Reutilizável; TypeScript props tipadas; snapshot test obrigatório |
| Storybook configurado | `planejado` | sênior | Juniores adicionam stories para cada componente que criam |

---

## Banco de dados — PostgreSQL

| Funcionalidade | Status | Responsável | Observações |
|---|---|---|---|
| Usuário `quarkus_user` com permissão restrita | `planejado` | sênior | `INSERT, SELECT` apenas em `iot_telemetry` |
| Usuário `django_user` sem escrita em `iot_telemetry` | `planejado` | sênior | `REVOKE INSERT, UPDATE, DELETE ON iot_telemetry` |
| Tabela `iot_telemetry` com índice UNIQUE `(device_id, sequence_number)` | `planejado` | sênior | Deduplicação delegada ao banco; `received_at` é o timestamp autoritativo |
| Coluna `device_ts` separada de `received_at` | `planejado` | sênior | Timestamp do dispositivo para diagnóstico de drift de clock |
| Tabela `plant_health_summary` (owned pelo Django) | `planejado` | sênior | Resultado agregado do cronjob; lida pelo React via DRF |
| Política de retenção de telemetria raw | `planejado` | sênior | Definir TTL e estratégia (particionamento por mês ou pg_partman) |
| Seed fixtures para ambiente de desenvolvimento | `planejado` | junior | 20 vasos, 5 plantas, 3 pedidos, 2 dispositivos com telemetria mock |

---

## Segurança e autenticação

| Funcionalidade | Status | Responsável | Observações |
|---|---|---|---|
| Par de chaves RS256 gerado uma vez | `em progresso` | sênior | Script local gera `secrets/jwt/private.pem` e `public.pem`; chave privada: somente Django |
| TLS no broker MQTT | `planejado` | sênior | Certificado por dispositivo ou CA interna de frota |
| Credenciais por ESP32 (sem segredo global de frota) | `planejado` | sênior | Provisionadas no onboarding do dispositivo |
| Rejeição de dispositivos desativados no Quarkus | `planejado` | sênior | Cache local com TTL curto do device registry do Django; sem HTTP síncrono no hot path |
| CORS gerenciado pelo nginx | `planejado` | sênior | React só vê uma origem; Django e Quarkus não precisam de configuração de CORS própria |

---

## Decisões arquiteturais registradas

> Registre aqui as decisões que não são óbvias pelo código, especialmente as que foram debatidas e rejeitadas. Isso evita que a equipe reabra as mesmas discussões.

### ADR-001 — nginx como API gateway unificado
**Decisão:** Colocar nginx na frente de Django e Quarkus para unificar a origem das chamadas do React.
**Motivação:** Evitar dois tokens JWT diferentes no frontend, eliminar CORS entre origens distintas, permitir roteamento transparente para o cliente.
**Alternativa rejeitada:** React chamando os dois backends diretamente — criaria dois sistemas de autenticação e CORS complexo.

### ADR-002 — Quarkus com schema isolado no mesmo PostgreSQL
**Decisão:** Quarkus escreve exclusivamente na tabela `iot_telemetry`; Django não tem permissão de escrita nela.
**Motivação:** Simplicidade operacional de um único banco na fase atual, com fronteira de dados rígida via permissões de usuário de banco.
**Alternativa rejeitada:** Banco separado por serviço — overhead operacional injustificado no estágio atual do produto.
**Revisão:** Reavaliar se o volume de telemetria exigir particionamento agressivo ou banco especializado em séries temporais (TimescaleDB).

### ADR-003 — JWT RS256 emitido pelo Django, validado pelo Quarkus
**Decisão:** Django é a única fonte de tokens. Quarkus valida com chave pública, nunca emite.
**Motivação:** Fonte única de autenticação; Quarkus permanece stateless em relação a sessões de usuário.
**Restrição:** Chave privada nunca sai do container Django. Rotação de chave exige redeploy coordenado.

### ADR-004 — Django lê telemetria via cronjob, não em tempo real
**Decisão:** Django agrega `iot_telemetry` periodicamente e salva em `plant_health_summary`. React consome apenas dados já processados via DRF.
**Motivação:** Evitar que Django faça queries pesadas em tabela de séries temporais em tempo real. Separação clara: Quarkus é dono da telemetria raw; Django é dono da lógica de negócio sobre ela.
**Alternativa rejeitada:** React chamando Quarkus diretamente para dados ao vivo — aumenta acoplamento do frontend e exige gestão de dois tokens.

---

*Última atualização: 2026-06-04 — configuração local do Google OAuth documentada sem uso de client secret.*
