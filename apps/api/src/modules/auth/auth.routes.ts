import { Router } from 'express';
import Joi from 'joi';

import { authRequired } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { Usuario } from '../../db/models/index.js';

import { login, refresh } from './AuthService.js';

export const authRouter = Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body.email, req.body.senha);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const result = await refresh(req.body.refreshToken);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', authRequired, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.auth!.sub, {
      attributes: { exclude: ['senhaHash', 'refreshTokenHash'] },
    });
    if (!usuario) return next(new Error('Usuário não encontrado'));
    res.json(usuario);
  } catch (e) {
    next(e);
  }
});
