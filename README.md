# Acampamento "A Alegria de Ser Desbravador" — Clube Dorina Azevedo (2026)

Aplicativo Web **PWA Offline-First** para gestão do acampamento preparatório para o VI Campori Sul-Americano (*20 a 22 de Novembro de 2026 — Chácara Morete, Hortolândia/SP*), estruturado com **DDD (Domain-Driven Design)**, **Domínio Rico** e **Screaming Architecture**.

## Arquitetura (Screaming Architecture)

- `src/acampamento/programacao-e-avisos`: Itinerário oficial (Sexta, Sábado e Domingo), Central de Avisos em tempo real e alertas automáticos (10 min antes e na hora).
- `src/acampamento/treinamento-campori`: Manuais das provas adaptadas, cola rápida dos requisitos de *Amigo* a *Guia*, Roleta Digital das Classes, guia de nós às cegas e Cronômetro de Bateria da Pista de Fio.
- `src/acampamento/unidades-e-desbravadores`: 6 unidades oficiais, 33 participantes confirmados e regra de fusão restrita ao mesmo gênero (`FEMININO` com `FEMININO` e `MASCULINO` com `MASCULINO`).
- `src/acampamento/pontuacao-e-disciplina`: Pontuação livre, inspeções, punições e ranking (Oscar DBV 2026) protegido pela senha administrativa **`#SouDorina2027`**.
- `src/acampamento/prontuario-ocorrencias`: Registro individual no nome de cada criança/desbravador (comportamento, saúde, incidente, observação).
- `src/acampamento/repertorio-musical`: Músicas organizadas por momento do itinerário (editáveis na hora, sem letras).
- `src/acampamento/acesso-diretoria`: Controle de sessão e permissão da Diretoria Administrativa.
- `src/shared/infrastructure`: Persistência local em **IndexedDB**, notificações locais e motor **Pull & Push** (`SyncEngine`) para sincronizar ao conectar na internet/Wi-Fi.

## Comandos

```bash
# Desenvolvimento
pnpm dev

# Testes de domínio e sincronização
pnpm test

# Build de produção PWA (gera dist/ com Service Worker offline)
pnpm build

# Servidor opcional de sincronização local via Wi-Fi (Pull & Push)
pnpm sync-server
```
