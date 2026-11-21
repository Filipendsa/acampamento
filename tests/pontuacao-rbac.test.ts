import { describe, expect, it } from 'vitest';
import { SessaoDiretoria } from '../src/acampamento/acesso-diretoria/domain/SessaoDiretoria';
import { PlacarUnidade } from '../src/acampamento/pontuacao-e-disciplina/domain/PlacarUnidade';
import { AliancaUnidades } from '../src/acampamento/unidades-e-desbravadores/domain/AliancaUnidades';
import { RegraFusaoUnidades } from '../src/acampamento/unidades-e-desbravadores/domain/RegraFusaoUnidades';
import { Unidade } from '../src/acampamento/unidades-e-desbravadores/domain/Unidade';
import { UNIDADES_OFICIAIS_SEED } from '../src/acampamento/unidades-e-desbravadores/infrastructure/UnidadesParticipantesSeed';

describe('Domínio de Pontuação, Punições e Segurança Administrativa', () => {
  const unidades = UNIDADES_OFICIAIS_SEED.map((u) => Unidade.criar(u));

  it('exige senha #SouDorina2027 para acessar ou lançar pontos no placar', () => {
    const sessao = SessaoDiretoria.iniciarPadrao('Conselheiro');
    const placar = PlacarUnidade.restaurar([]);
    const equipes = RegraFusaoUnidades.resolverEquipesOperacionais(unidades, []);

    expect(() => sessao.autenticarAdministrativa('senha-errada', '2026-11-20T10:00:00Z')).toThrowError(
      /Senha da Diretoria Administrativa incorreta/i
    );

    expect(() => placar.calcularRanking(sessao, equipes)).toThrowError(
      /Diretoria Administrativa/i
    );

    sessao.autenticarAdministrativa('#SouDorina2027', '2026-11-20T10:01:00Z');
    expect(sessao.isAdministrativa).toBe(true);
    expect(placar.calcularRanking(sessao, equipes)).toHaveLength(8);
  });

  it('suporta pontuação livre, normaliza punições como negativas e observações como 0 pontos', () => {
    const sessao = SessaoDiretoria.iniciarPadrao('Diretor Admin');
    sessao.autenticarAdministrativa('#SouDorina2027', '2026-11-20T10:00:00Z');

    const harpia = unidades.find((u) => u.id === 'unidade-1-harpia')!;
    const coruja = unidades.find((u) => u.id === 'unidade-2-coruja')!;
    const alianca = AliancaUnidades.unir('al-hc', [harpia, coruja], '2026-11-20T09:00:00Z');
    const equipes = RegraFusaoUnidades.resolverEquipesOperacionais(unidades, [alianca]);

    const placar = PlacarUnidade.restaurar([]);

    // Pontuação livre (ex: 137)
    placar.registrarLancamento(sessao, {
      id: 'l-1',
      equipeAlvoId: alianca.id,
      unidadeIdsEnvolvidas: [...alianca.unidadeIds],
      nomeEquipe: alianca.nome,
      categoria: 'PROVA',
      pontos: 137,
      motivo: 'Venceu Labirinto das Classes',
      autor: sessao.nomeOperador,
      criadoEm: '2026-11-20T15:00:00Z',
    });

    // Punição informada como valor positivo é normalizada para negativo (-25)
    placar.registrarLancamento(sessao, {
      id: 'l-2',
      equipeAlvoId: alianca.id,
      unidadeIdsEnvolvidas: [...alianca.unidadeIds],
      nomeEquipe: alianca.nome,
      categoria: 'PUNICAO',
      pontos: 25,
      motivo: 'Atraso na formação',
      autor: sessao.nomeOperador,
      criadoEm: '2026-11-20T16:00:00Z',
    });

    // Observação é sempre 0 pts
    placar.registrarLancamento(sessao, {
      id: 'l-3',
      equipeAlvoId: alianca.id,
      unidadeIdsEnvolvidas: [...alianca.unidadeIds],
      nomeEquipe: alianca.nome,
      categoria: 'OBSERVACAO',
      pontos: 999,
      motivo: 'Organizaram muito bem as mochilas',
      autor: sessao.nomeOperador,
      criadoEm: '2026-11-20T16:30:00Z',
    });

    const ranking = placar.calcularRanking(sessao, equipes);
    expect(ranking[0].equipe.id).toBe(alianca.id);
    expect(ranking[0].saldoTotal).toBe(112); // 137 - 25 + 0
    expect(ranking[0].totalPositivo).toBe(137);
    expect(ranking[0].totalPunicoes).toBe(-25);
    expect(ranking[0].quantidadeObservacoes).toBe(1);
  });
});
