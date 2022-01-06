import bodyParser from 'body-parser';
import { Router, Request } from 'express';
import { users, getUserById } from '../db';
import * as jwt from 'jsonwebtoken';
import * as config from '../config';
import { Schema } from '../../shared/utils';

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.post('/api/@me', (req, res) => {
    const userSchema = new Schema({
      email: 'string',
      password: 'string',
      remember: 'boolean'
    });

    if (userSchema.validate(req.body)) {
      res.send({ message: 'hello back!' });
    } else {
      res.send({ message: 'whoops!' });
    }
  });

  router.get('/api/users', (req, res) => {
    res.json(users);
  });

  router.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId as unknown as number;
    res.json(getUserById(userId));
  });

  router.post('/api/set-user', (req, res) => {
    res.send(`ok`);
  });

  return router;
}
