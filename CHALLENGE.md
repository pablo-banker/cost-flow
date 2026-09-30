# Desafio Técnico — CostFlow

## Contexto

Grandes empresas lidam mensalmente com centenas ou milhares de faturas relacionadas a energia, água, telecomunicações, serviços em nuvem e outros custos operacionais.

Essas despesas normalmente precisam ser associadas a unidades, distribuídas entre diferentes centros de custo e analisadas ao longo do tempo para identificar desperdícios, aumentos inesperados de consumo e oportunidades de redução de custos.

Seu desafio é construir o backend de uma plataforma B2B chamada **CostFlow**, responsável por centralizar, processar e analisar essas informações.

O sistema deve ser desenvolvido em **TypeScript**, utilizando uma arquitetura serverless baseada em AWS.

---

# Objetivo

Construir um backend capaz de:

- gerenciar organizações;
- gerenciar unidades;
- gerenciar centros de custo;
- gerenciar fornecedores;
- registrar faturas;
- receber arquivos de faturas;
- processar os arquivos de maneira assíncrona;
- realizar rateio de custos;
- registrar informações de consumo;
- identificar anomalias;
- gerar relatórios;
- utilizar cache;
- lidar corretamente com falhas, retries e processamento duplicado.

O sistema deve ser preparado para atender múltiplas organizações sem permitir acesso cruzado entre seus dados.

---

# Stack obrigatória

O projeto deverá utilizar:

- TypeScript;
- Node.js;
- AWS Lambda;
- API Gateway;
- S3;
- SQS;
- PostgreSQL;
- TypeORM;
- Valkey;
- Serverless Framework;
- LocalStack;
- Docker;
- GitHub Actions.

---

# Arquitetura

O projeto deverá seguir uma arquitetura baseada em:

**Hexagonal Architecture / Ports and Adapters**

A aplicação deverá possuir separação clara entre:

- Domain;
- Application;
- Infrastructure;
- Entrypoints.

Dependências de infraestrutura não devem contaminar o domínio.

O domínio não deverá conhecer diretamente:

- AWS;
- Lambda;
- S3;
- SQS;
- TypeORM;
- PostgreSQL;
- Valkey;
- API Gateway.

---

# Estrutura esperada

Uma organização conceitual esperada é:

```text
src/
├── domain/
│   ├── organization/
│   ├── invoice/
│   ├── allocation/
│   ├── consumption/
│   ├── anomaly/
│   └── shared/
│
├── application/
│   ├── organization/
│   ├── invoice/
│   ├── allocation/
│   ├── consumption/
│   ├── reports/
│   └── ports/
│
├── infrastructure/
│   ├── database/
│   ├── cache/
│   ├── storage/
│   ├── queue/
│   ├── parsers/
│   └── observability/
│
├── entrypoints/
│   ├── http/
│   ├── queue/
│   ├── storage-events/
│   └── scheduled/
│
└── shared/
```

A estrutura pode sofrer alterações caso exista uma justificativa arquitetural.

---

# Domínio

## Organization

Uma organização representa uma empresa cliente do CostFlow.

Cada organização pode possuir:

- usuários;
- unidades;
- centros de custo;
- fornecedores;
- faturas;
- regras de rateio.

O sistema deve ser multi-tenant.

Dados pertencentes a uma organização jamais poderão ser acessados por outra organização.

---

# Units

Uma organização pode possuir diversas unidades.

Exemplo:

```text
Organization
├── Florianópolis
├── São Paulo
└── Rio de Janeiro
```

Uma fatura deve poder ser associada a uma unidade.

---

# Cost Centers

Uma unidade pode possuir diferentes centros de custo.

Exemplo:

```text
Florianópolis
├── Administrativo
├── Engenharia
├── Comercial
└── Operações
```

Centros de custo serão utilizados durante o processo de rateio.

---

# Suppliers

O sistema deve possuir fornecedores.

Exemplos:

```text
CELESC
CASAN
VIVO
TIM
AWS
```

Fornecedores diferentes podem possuir formatos diferentes de fatura.

---

# Invoice

A fatura será uma das entidades centrais da aplicação.

Uma fatura deverá possuir informações suficientes para representar:

- organização;
- unidade;
- fornecedor;
- competência;
- vencimento;
- valor;
- arquivo original;
- itens;
- consumo;
- rateios;
- status de processamento.

---

# Lifecycle da fatura

A aplicação deverá modelar um lifecycle coerente.

Exemplo conceitual:

```text
CREATED
   ↓
WAITING_UPLOAD
   ↓
UPLOADED
   ↓
QUEUED
   ↓
PROCESSING
   ↓
PROCESSED
```

Fluxos de erro também deverão existir.

Exemplo:

```text
PROCESSING
   ↓
FAILED
   ↓
RETRYING
```

Transições inválidas devem ser impedidas.

---

# Upload de arquivo

Arquivos de faturas não devem obrigatoriamente trafegar pelo backend HTTP.

O sistema deverá permitir um fluxo semelhante a:

```text
Client
   ↓
API
   ↓
gera autorização de upload
   ↓
Client
   ↓
S3
```

O arquivo deverá ser armazenado no S3.

---

# Processamento assíncrono

Depois do upload, a fatura deverá ser processada de maneira assíncrona.

Fluxo esperado:

```text
Client
   ↓
S3
   ↓
ObjectCreated
   ↓
Lambda
   ↓
SQS
   ↓
Processing Lambda
   ↓
Application
   ↓
Domain
```

A requisição HTTP original não deverá ficar aguardando o processamento completo da fatura.

---

# Parsing de faturas

Fornecedores diferentes podem possuir formatos diferentes.

O sistema deverá possuir uma camada responsável por transformar formatos externos em um formato interno normalizado.

Fluxo:

```text
Invoice File
     ↓
Supplier Identification
     ↓
Parser Selection
     ↓
Specific Parser
     ↓
Normalized Invoice
```

A aplicação não deverá espalhar regras específicas de fornecedores pelas demais camadas.

---

# Design Pattern obrigatório — Factory

A seleção ou criação dos parsers deverá utilizar um padrão de criação adequado.

O objetivo é permitir a adição de novos fornecedores sem espalhar condicionais por toda a aplicação.

---

# Rateio de custos

Depois de processada, uma fatura poderá ser distribuída entre vários centros de custo.

Exemplo:

```text
Fatura: R$ 100.000

Administrativo    20%
Engenharia        30%
Operações         40%
Comercial         10%
```

Resultado:

```text
Administrativo    R$ 20.000
Engenharia        R$ 30.000
Operações         R$ 40.000
Comercial         R$ 10.000
```

---

# Estratégias de rateio

O sistema deverá suportar pelo menos três estratégias.

Exemplos:

```text
Fixed Percentage
Headcount
Consumption
```

Opcionalmente:

```text
Custom
```

Cada estratégia deverá possuir regras próprias.

---

# Design Pattern obrigatório — Strategy

O mecanismo de rateio deverá utilizar Strategy.

A aplicação não deverá precisar conhecer os detalhes de cálculo de cada estratégia.

---

# Consumption

Faturas poderão possuir informações de consumo.

Exemplos:

```text
Energy
38.500 kWh
```

ou:

```text
Water
850 m³
```

A aplicação deverá manter histórico de consumo.

---

# Anomaly Detection

O sistema deverá analisar consumo histórico e detectar variações relevantes.

Exemplo:

```text
Abril      31.200
Maio       32.100
Junho      30.900
Julho      32.800
Agosto     31.500
Setembro   48.900
```

O sistema deve conseguir identificar que setembro apresenta comportamento anormal.

Não é necessário utilizar Machine Learning.

A regra deverá ser determinística e explicável.

---

# Reporting

O sistema deverá disponibilizar informações agregadas.

No mínimo:

- custo mensal;
- custo por unidade;
- custo por fornecedor;
- custo por centro de custo;
- histórico de consumo;
- anomalias detectadas.

---

# Cache

Relatórios e agregações poderão possuir custo elevado de consulta.

Valkey deverá ser utilizado para cache.

Fluxo esperado:

```text
Request
   ↓
Cache
 ┌─┴──────┐
 │        │
HIT      MISS
 │        │
 ▼        ▼
Response Database
          ↓
       Aggregate
          ↓
        Cache
          ↓
       Response
```

Também deverá existir uma estratégia coerente de invalidação.

---

# Persistência

PostgreSQL deverá ser utilizado como banco principal.

TypeORM deverá ser utilizado para persistência.

O projeto deverá demonstrar uso de:

- migrations;
- constraints;
- relacionamentos;
- índices;
- transactions;
- paginação;
- queries agregadas.

---

# Multi-tenancy

Praticamente todos os dados de negócio deverão possuir vínculo com uma organização.

O sistema deverá garantir:

```text
Organization A
      ↓
apenas dados A
```

e:

```text
Organization B
      ↓
apenas dados B
```

Nenhuma consulta deverá permitir acesso acidental entre tenants.

---

# Processamento duplicado

Considere que uma mensagem pode ser entregue mais de uma vez.

O sistema deve permanecer consistente mesmo que o mesmo evento seja recebido repetidamente.

Fluxo conceitual:

```text
Message
   ↓
Already processed?
 ├── YES → Ignore
 └── NO
       ↓
    Process
       ↓
    Persist
       ↓
    Mark processed
```

---

# Idempotência

Consumidores assíncronos deverão ser idempotentes.

Você deverá definir uma estratégia para identificar processamentos duplicados.

---

# Falhas e retries

Considere que processamento de faturas pode falhar.

Fluxo:

```text
SQS
 ↓
Worker
 ↓
Error
 ↓
Retry
 ↓
Retry
 ↓
Retry limit
 ↓
DLQ
```

Uma Dead Letter Queue deverá existir.

---

# Design Pattern obrigatório — Adapter

Serviços externos e infraestrutura deverão ser acessados através de abstrações apropriadas.

Exemplos:

```text
Storage
    ↓
S3 Adapter
```

```text
Queue
    ↓
SQS Adapter
```

```text
Cache
    ↓
Valkey Adapter
```

```text
Repository
    ↓
TypeORM/PostgreSQL Adapter
```

---

# Design Pattern opcional — State

Avalie se o lifecycle da fatura possui complexidade suficiente para justificar State.

Não utilize o pattern apenas porque ele faz parte do desafio.

Você deverá conseguir justificar a decisão de:

- utilizar;
- ou não utilizar.

---

# Design Pattern opcional — Chain of Responsibility

Avalie a utilização durante o pipeline de processamento.

Exemplo:

```text
Validate File
     ↓
Identify Supplier
     ↓
Parse
     ↓
Validate Data
     ↓
Normalize
     ↓
Allocate
     ↓
Detect Anomalies
```

Novamente, sua utilização deve ser justificada.

---

# Entrypoints HTTP

O sistema deverá possuir APIs para operações de negócio.

No mínimo devem existir operações equivalentes a:

### Organizations

```text
Create Organization
Get Organization
```

### Units

```text
Create Unit
List Units
```

### Cost Centers

```text
Create Cost Center
List Cost Centers
```

### Suppliers

```text
Create Supplier
List Suppliers
```

### Invoices

```text
Create Invoice
Get Invoice
List Invoices
Generate Upload Authorization
```

### Reports

```text
Monthly Costs
Costs By Unit
Consumption History
Anomalies
```

A definição exata das rotas HTTP fica a seu critério.

---

# Paginação

Listagens grandes deverão possuir paginação.

Evite assumir que sempre existirão poucos registros.

Você deverá definir uma estratégia de paginação adequada.

---

# Observabilidade

O backend deverá possuir logs estruturados.

Os logs deverão permitir rastrear uma operação entre diferentes componentes.

Considere informações como:

```text
requestId
correlationId
organizationId
invoiceId
function
duration
status
```

Evite logs sem contexto.

---

# Ambiente local

Todo o ambiente deverá ser executável localmente.

Esperado:

```text
Docker Compose
│
├── PostgreSQL
├── Valkey
└── LocalStack
     ├── S3
     ├── SQS
     ├── Lambda
     └── API Gateway
```

O objetivo é reproduzir localmente a arquitetura utilizada na AWS.

---

# Serverless Framework

A infraestrutura serverless deverá ser declarada utilizando Serverless Framework.

Deverão existir definições para:

- Lambdas;
- API Gateway;
- S3;
- eventos;
- filas;
- DLQ;
- permissões necessárias.

---

# Segurança

O projeto deverá levar em consideração pelo menos:

- isolamento de tenants;
- validação de entrada;
- autorização;
- princípio do menor privilégio;
- proteção de secrets;
- validação de arquivos;
- tratamento seguro de erros.

---

# CI/CD

GitHub Actions deverá ser utilizado.

Em Pull Requests:

```text
Install
   ↓
Lint
   ↓
Type Check
   ↓
Tests
   ↓
Build
```

Uma estratégia de deployment também deverá ser definida.

Exemplo:

```text
main
 ↓
CI
 ↓
Deploy Development
```

Opcionalmente:

```text
Release
 ↓
Deploy Production
```

---

# Testes

O projeto deverá possuir três níveis.

## Unit

Principalmente:

- domínio;
- value objects;
- strategies;
- use cases;
- regras de negócio.

## Integration

Principalmente:

- repositories;
- PostgreSQL;
- TypeORM;
- Valkey.

## End-to-End

Validar fluxos como:

```text
API Gateway
 ↓
Lambda
 ↓
Application
 ↓
PostgreSQL
```

E principalmente:

```text
Upload
 ↓
S3
 ↓
SQS
 ↓
Lambda
 ↓
Processing
 ↓
PostgreSQL
```

---

# Fluxo principal completo

```text
                         CLIENT
                            │
                            ▼
                      API Gateway
                            │
                            ▼
                         Lambda
                            │
                            ▼
                       Application
                            │
                            ▼
                          Domain
                            │
                            ▼
                       PostgreSQL
```

Upload:

```text
Client
   ↓
S3
   ↓
ObjectCreated
   ↓
Lambda
   ↓
SQS
```

Processamento:

```text
SQS
 ↓
Processing Lambda
 ↓
Idempotency Check
 ↓
Parser Factory
 ↓
Normalize Invoice
 ↓
Validate Domain
 ↓
Allocation Strategy
 ↓
Consumption
 ↓
Anomaly Detection
 ↓
Persist
 ↓
Invalidate Cache
 ↓
PROCESSED
```

Leitura:

```text
Client
 ↓
API Gateway
 ↓
Lambda
 ↓
Application
 ↓
Valkey
 ↓
PostgreSQL
```

---

# Requisitos arquiteturais

Durante o projeto, mantenha estas regras:

1. Domain não conhece infraestrutura.
2. Use cases não conhecem AWS SDK diretamente.
3. Handlers Lambda não possuem regra de negócio.
4. Entidades TypeORM não precisam necessariamente ser suas entidades de domínio.
5. Integrações externas devem possuir adapters.
6. Processamento assíncrono deve assumir entrega duplicada.
7. Multi-tenancy deve ser tratado como requisito de segurança.
8. Patterns devem resolver problemas reais.
9. Não utilize abstrações apenas para aumentar a complexidade do projeto.
10. Decisões arquiteturais importantes devem poder ser justificadas.

---

# Critérios de conclusão

O projeto será considerado completo quando você conseguir demonstrar:

### Backend

- API funcional;
- regras de negócio;
- persistência;
- migrations;
- paginação;
- transactions.

### AWS / Serverless

- Lambda;
- API Gateway;
- S3;
- SQS;
- DLQ;
- Serverless Framework.

### Desenvolvimento local

- LocalStack;
- PostgreSQL;
- Valkey;
- Docker Compose.

### Arquitetura

- Hexagonal Architecture;
- Ports and Adapters;
- SOLID;
- separação Domain/Application/Infrastructure.

### Patterns

Obrigatórios:

- Strategy;
- Factory;
- Adapter.

Avaliados conforme necessidade:

- State;
- Chain of Responsibility.

### Backend distribuído

- processamento assíncrono;
- idempotência;
- retry;
- DLQ;
- cache;
- invalidação;
- tratamento de concorrência.

### Qualidade

- unit tests;
- integration tests;
- E2E tests;
- logs estruturados;
- CI/CD.

---

# Desafios extras

Depois de concluir o núcleo do projeto, escolha alguns dos seguintes.

## Extra 1 — Auditoria

Toda mudança relevante deverá gerar histórico.

```text
quem
quando
o que mudou
```

---

## Extra 2 — Relatório assíncrono

Relatórios muito grandes não deverão ser gerados durante uma requisição HTTP.

Fluxo:

```text
Request Report
 ↓
Queue
 ↓
Worker
 ↓
Generate File
 ↓
S3
 ↓
Report Ready
```

---

## Extra 3 — Rate limiting

Implemente limites de utilização por organização.

---

## Extra 4 — Optimistic Locking

Evite alterações concorrentes incorretas em determinados recursos.

---

## Extra 5 — Event-driven

Em vez de executar todas as ações diretamente durante `ProcessInvoice`, publique eventos de domínio como:

```text
InvoiceProcessed
ConsumptionRegistered
AnomalyDetected
AllocationCompleted
```

E permita que outros componentes reajam a esses eventos.

---

## Extra 6 — Scheduled Jobs

Execute periodicamente análises como:

```text
DetectConsumptionAnomalies
GenerateMonthlySummary
RemoveExpiredCache
```

---

# Perguntas que você deve conseguir responder no final

Ao terminar, você deverá conseguir explicar sem consultar documentação:

- Por que utilizar Lambda?
- Quando não utilizar Lambda?
- O que é cold start?
- Como API Gateway e Lambda se relacionam?
- Por que utilizar S3 para upload?
- Por que colocar SQS entre upload e processamento?
- O que acontece se uma mensagem chegar duas vezes?
- Como tornar um consumidor idempotente?
- Para que serve uma DLQ?
- Como retries funcionam?
- Como Lambda afeta conexões com PostgreSQL?
- Para que serve Valkey?
- Quando cache não deve ser utilizado?
- Como invalidar cache?
- Como impedir acesso entre tenants?
- Quando utilizar uma transaction?
- Por que criar índices?
- Quando um índice pode prejudicar?
- Qual a diferença entre Unit, Integration e E2E?
- Por que utilizar Ports and Adapters?
- Qual problema Strategy resolveu?
- Qual problema Factory resolveu?
- Onde Adapter foi utilizado?
- State realmente foi necessário?
- Chain of Responsibility realmente foi necessário?
- Como o sistema se comporta em caso de falha?
- Como você investigaria uma fatura que falhou em produção?
- Como faria deploy com segurança?

---

# Regra final

Durante todo o desafio, priorize esta sequência:

```text
Entender o problema
      ↓
Modelar o domínio
      ↓
Implementar solução simples
      ↓
Identificar complexidade
      ↓
Aplicar abstração/pattern quando necessário
      ↓
Testar
      ↓
Observar
      ↓
Refatorar
```

O objetivo não é construir o maior número possível de classes.

O objetivo é construir um backend que você consiga **defender tecnicamente em uma entrevista**.