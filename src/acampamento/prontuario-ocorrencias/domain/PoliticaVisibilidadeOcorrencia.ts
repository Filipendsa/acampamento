import { DomainError } from '../../../shared/domain/DomainError';
import { SessaoDiretoria } from '../../acesso-diretoria/domain/SessaoDiretoria';
import { OcorrenciaIndividual } from './OcorrenciaIndividual';

export class PoliticaVisibilidadeOcorrencia {
  public static podeVisualizar(
    ocorrencia: OcorrenciaIndividual,
    sessao: SessaoDiretoria,
    deviceIdAtual?: string
  ): boolean {
    if (sessao.isAdministrativa) {
      return true;
    }

    if (
      ocorrencia.registradoPorDeviceId &&
      deviceIdAtual &&
      ocorrencia.registradoPorDeviceId === deviceIdAtual
    ) {
      return true;
    }

    const autor = ocorrencia.registradoPor.trim().toLowerCase();
    const operador = sessao.nomeOperador.trim().toLowerCase();

    if (!autor || !operador) return false;
    if (operador === 'diretoria em campo' && ocorrencia.registradoPorDeviceId && deviceIdAtual) {
      return ocorrencia.registradoPorDeviceId === deviceIdAtual;
    }

    return autor === operador;
  }

  public static filtrarVisiveis(
    ocorrencias: ReadonlyArray<OcorrenciaIndividual>,
    sessao: SessaoDiretoria,
    deviceIdAtual?: string
  ): OcorrenciaIndividual[] {
    return ocorrencias.filter((oc) => this.podeVisualizar(oc, sessao, deviceIdAtual));
  }

  public static podeAtualizarStatus(
    ocorrencia: OcorrenciaIndividual,
    sessao: SessaoDiretoria,
    deviceIdAtual?: string
  ): boolean {
    return this.podeVisualizar(ocorrencia, sessao, deviceIdAtual);
  }

  public static podeExcluir(sessao: SessaoDiretoria): boolean {
    return sessao.isAdministrativa;
  }

  public static exigirAdminParaExcluir(sessao: SessaoDiretoria): void {
    if (!this.podeExcluir(sessao)) {
      throw new DomainError(
        'EXCLUSAO_OCORRENCIA_NEGADA',
        'Somente a Diretoria Administrativa (ADM) pode excluir ocorrências.'
      );
    }
  }
}
