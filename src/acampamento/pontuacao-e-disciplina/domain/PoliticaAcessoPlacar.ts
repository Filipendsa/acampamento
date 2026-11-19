import { DomainError } from '../../../shared/domain/DomainError';
import { SessaoDiretoria } from '../../acesso-diretoria/domain/SessaoDiretoria';

export class PoliticaAcessoPlacar {
  public static exigirDiretoriaAdministrativa(sessao: SessaoDiretoria): void {
    if (!sessao.isAdministrativa) {
      throw new DomainError(
        'ACESSO_NEGADO_PLACAR',
        'Somente Você e a Diretoria Administrativa têm acesso à pontuação das unidades.'
      );
    }
  }
}
