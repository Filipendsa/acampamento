import { describe, expect, it } from 'vitest';
import { AliancaUnidades } from '../src/acampamento/unidades-e-desbravadores/domain/AliancaUnidades';
import { RegraFusaoUnidades } from '../src/acampamento/unidades-e-desbravadores/domain/RegraFusaoUnidades';
import { Unidade } from '../src/acampamento/unidades-e-desbravadores/domain/Unidade';
import { UNIDADES_OFICIAIS_SEED } from '../src/acampamento/unidades-e-desbravadores/infrastructure/UnidadesParticipantesSeed';

describe('Domínio de Unidades, Desbravadores e Fusão por Gênero', () => {
  const unidades = UNIDADES_OFICIAIS_SEED.map((u) => Unidade.criar(u));

  it('carrega as 6 unidades oficiais e os 33 participantes confirmados', () => {
    expect(unidades).toHaveLength(6);
    const total = unidades.reduce((acc, u) => acc + u.membros.length, 0);
    expect(total).toBe(33);
  });

  it('permite unir unidades femininas entre si e masculinas entre si', () => {
    const harpia = unidades.find((u) => u.id === 'unidade-1-harpia')!;
    const coruja = unidades.find((u) => u.id === 'unidade-2-coruja')!;
    const aguiaReal = unidades.find((u) => u.id === 'unidade-1-aguia-real')!;
    const aguiaNegra = unidades.find((u) => u.id === 'unidade-3-aguia-negra')!;

    const aliancaFem = AliancaUnidades.unir('al-fem-1', [harpia, coruja], '2026-11-20T09:00:00Z');
    const aliancaMasc = AliancaUnidades.unir('al-masc-1', [aguiaReal, aguiaNegra], '2026-11-20T09:00:00Z');

    expect(aliancaFem.genero).toBe('FEMININO');
    expect(aliancaMasc.genero).toBe('MASCULINO');

    const equipes = RegraFusaoUnidades.resolverEquipesOperacionais(unidades, [aliancaFem, aliancaMasc]);
    expect(equipes).toHaveLength(4); // 2 alianças + 2 unidades femininas ainda separadas
  });

  it('bloqueia estritamente a união de unidade masculina com feminina', () => {
    const harpia = unidades.find((u) => u.id === 'unidade-1-harpia')!;
    const aguiaReal = unidades.find((u) => u.id === 'unidade-1-aguia-real')!;

    expect(() =>
      AliancaUnidades.unir('al-invalida', [harpia, aguiaReal], '2026-11-20T09:00:00Z')
    ).toThrowError(/somente é permitido unir unidade feminina com feminina e masculina com masculina/i);
  });

  it('impede que uma unidade já unida participe de outra aliança ativa simultaneamente', () => {
    const harpia = unidades.find((u) => u.id === 'unidade-1-harpia')!;
    const coruja = unidades.find((u) => u.id === 'unidade-2-coruja')!;
    const aguiaDourada = unidades.find((u) => u.id === 'unidade-3-aguia-dourada')!;

    const alianca1 = AliancaUnidades.unir('al-1', [harpia, coruja], '2026-11-20T09:00:00Z');

    expect(() =>
      RegraFusaoUnidades.validarUniaoDisponivel([harpia, aguiaDourada], [alianca1])
    ).toThrowError(/já faz parte da união/i);
  });
});
