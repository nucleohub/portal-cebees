import bcrypt from 'bcrypt';

import type { LoginResponseDto } from '@cebees/shared-types';

import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../config/errors.js';
import { Usuario } from '../../db/models/index.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../../middleware/auth.js';

export async function login(email: string, senha: string): Promise<LoginResponseDto> {
  const user = await Usuario.findOne({ where: { email, ativo: true } });
  if (!user) throw new UnauthorizedError('Credenciais inválidas');
  const ok = await bcrypt.compare(senha, user.senhaHash);
  if (!ok) throw new UnauthorizedError('Credenciais inválidas');

  user.ultimoLogin = new Date();
  await user.save();

  const payload = {
    sub: user.id,
    email: user.email,
    nome: user.nome,
    papel: user.papel,
    professorId: user.professorId ?? null,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: user.id }),
    usuario: {
      id: user.id,
      email: user.email,
      nome: user.nome,
      papel: user.papel,
      professorId: user.professorId ?? undefined,
      ativo: user.ativo,
      ultimoLogin: user.ultimoLogin?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  };
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  let decoded: { sub: number };
  try {
    decoded = verifyToken<{ sub: number }>(refreshToken);
  } catch {
    throw new UnauthorizedError('Refresh token inválido');
  }
  const user = await Usuario.findByPk(decoded.sub);
  if (!user || !user.ativo) throw new UnauthorizedError();

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    nome: user.nome,
    papel: user.papel,
    professorId: user.professorId ?? null,
  });
  return { accessToken };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.bcryptRounds);
}
