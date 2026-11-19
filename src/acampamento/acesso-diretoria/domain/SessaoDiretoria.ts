import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainError } from '../../../shared/domain/DomainError';
import { NivelPermissao } from './NivelPermissao';

// Senha administrativa oficial do Clube Dorina Azevedo
const SENHA_ADMIN_ESPERADA = '#SouDorina2027';

export interface SessaoDiretoriaProps {
  id: string;
  nomeOperador: string;
  nivel: NivelPermissao;
  autenticadoAdminEm?: string;
}

export class SessaoDiretoria extends AggregateRoot<string> {
  private _nomeOperador: string;
  private _nivel: NivelPermissao;
  private _autenticadoAdminEm?: string;

  private constructor(props: SessaoDiretoriaProps) {
    super(props.id);
    this._nomeOperador = props.nomeOperador;
    this._nivel = props.nivel;
    this._autenticadoAdminEm = props.autenticadoAdminEm;
  }

  public static iniciarPadrao(nomeOperador = 'Diretoria em Campo'): SessaoDiretoria {
    return new SessaoDiretoria({
      id: 'sessao-local',
      nomeOperador: nomeOperador.trim() || 'Diretoria em Campo',
      nivel: 'DIRETORIA_GERAL',
    });
  }

  public static restaurar(props: SessaoDiretoriaProps): SessaoDiretoria {
    return new SessaoDiretoria(props);
  }

  public get nomeOperador(): string {
    return this._nomeOperador;
  }

  public get nivel(): NivelPermissao {
    return this._nivel;
  }

  public get isAdministrativa(): boolean {
    return this._nivel === 'DIRETORIA_ADMINISTRATIVA';
  }

  public get autenticadoAdminEm(): string | undefined {
    return this._autenticadoAdminEm;
  }

  public definirOperador(nome: string): void {
    const limpo = nome.trim();
    if (limpo.length < 2) {
      throw new DomainError(
        'OPERADOR_INVALIDO',
        'Informe seu nome (mínimo 2 caracteres) para assinar registros e ocorrências.'
      );
    }
    this._nomeOperador = limpo;
  }

  public autenticarAdministrativa(senha: string, agoraIso: string): void {
    if (senha.trim() !== SENHA_ADMIN_ESPERADA) {
      throw new DomainError(
        'SENHA_ADMIN_INVALIDA',
        'Senha da Diretoria Administrativa incorreta. Acesso negado à pontuação.'
      );
    }
    this._nivel = 'DIRETORIA_ADMINISTRATIVA';
    this._autenticadoAdminEm = agoraIso;
  }

  public bloquearAdministrativa(): void {
    this._nivel = 'DIRETORIA_GERAL';
    this._autenticadoAdminEm = undefined;
  }

  public toSnapshot(): SessaoDiretoriaProps {
    return {
      id: this.id,
      nomeOperador: this._nomeOperador,
      nivel: this._nivel,
      autenticadoAdminEm: this._autenticadoAdminEm,
    };
  }
}
