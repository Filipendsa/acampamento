import { AvisoCentralProps } from '../../../acampamento/programacao-e-avisos/domain/ItinerarioAcampamento';
import { LancamentoPontuacaoProps } from '../../../acampamento/pontuacao-e-disciplina/domain/LancamentoPontuacao';
import { OcorrenciaIndividualProps } from '../../../acampamento/prontuario-ocorrencias/domain/OcorrenciaIndividual';
import { StatusOcorrencia } from '../../../acampamento/prontuario-ocorrencias/domain/TipoOcorrencia';
import { MusicaAcampamentoProps } from '../../../acampamento/repertorio-musical/domain/MusicaAcampamento';
import { AliancaUnidadesProps } from '../../../acampamento/unidades-e-desbravadores/domain/AliancaUnidades';
import { ParticipanteProps } from '../../../acampamento/unidades-e-desbravadores/domain/Participante';

export interface TempoBateriaPistaFio {
  id: string;
  equipeId: string;
  nomeEquipe: string;
  duracaoMs: number;
  registradoEm: string;
  registradoPor: string;
}

export type SyncEventPayload =
  | { kind: 'ALIANCA_CRIADA'; alianca: AliancaUnidadesProps }
  | { kind: 'ALIANCA_DESFEITA'; aliancaId: string }
  | { kind: 'ALIANCA_RENOMEADA'; aliancaId: string; novoNome: string }
  | { kind: 'MEMBRO_ADICIONADO'; membro: ParticipanteProps }
  | { kind: 'OCORRENCIA_REGISTRADA'; ocorrencia: OcorrenciaIndividualProps }
  | {
      kind: 'OCORRENCIA_STATUS_ATUALIZADO';
      ocorrenciaId: string;
      status: StatusOcorrencia;
      providencia?: string;
      atualizadoEm: string;
    }
  | { kind: 'LANCAMENTO_PONTUACAO'; lancamento: LancamentoPontuacaoProps }
  | { kind: 'LANCAMENTO_REMOVIDO'; lancamentoId: string }
  | { kind: 'MUSICA_ADICIONADA'; musica: MusicaAcampamentoProps }
  | {
      kind: 'MUSICA_EDITADA';
      musicaId: string;
      dados: Partial<
        Pick<MusicaAcampamentoProps, 'titulo' | 'interpreteOuOrigem' | 'momento' | 'observacao' | 'ordem'>
      >;
      atualizadaEm: string;
    }
  | { kind: 'MUSICA_TOCADA_ALTERNADA'; musicaId: string; tocada: boolean; atualizadaEm: string }
  | { kind: 'MUSICA_REMOVIDA'; musicaId: string; atualizadaEm: string }
  | { kind: 'AVISO_PUBLICADO'; aviso: AvisoCentralProps }
  | { kind: 'AVISO_REMOVIDO'; avisoId: string }
  | { kind: 'TEMPO_PISTA_FIO_REGISTRADO'; registro: TempoBateriaPistaFio };

export interface SyncEvent {
  id: string;
  deviceId: string;
  author: string;
  createdAt: string;
  payload: SyncEventPayload;
}
