import type { Papel } from '../enums.js';
export interface UsuarioDto {
    id: number;
    email: string;
    nome: string;
    papel: Papel;
    professorId?: number;
    ativo: boolean;
    ultimoLogin?: string;
    createdAt: string;
    updatedAt: string;
}
export interface LoginDto {
    email: string;
    senha: string;
}
export interface LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    usuario: UsuarioDto;
}
export interface RefreshTokenDto {
    refreshToken: string;
}
export interface CreateUsuarioDto {
    email: string;
    nome: string;
    senha: string;
    papel: Papel;
    professorId?: number;
}
export interface ChangePasswordDto {
    senhaAtual: string;
    novaSenha: string;
}
//# sourceMappingURL=usuario.d.ts.map