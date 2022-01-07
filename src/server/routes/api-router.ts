import bodyParser from 'body-parser';
import { Router, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as config from '../config';
import { Schema } from '../../shared/utils';
import {
  User, IUser
} from '../models';

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.post('/api/@me', async (req: Request<{}, {}, { email: string, password: string, remember: boolean }>, res) => {
    const userSchema = new Schema({
      email: 'string',
      password: 'string',
      remember: 'boolean'
    });

    if (userSchema.validate(req.body)) {
      try {
        const user = await User.login(req.body.email, req.body.password);
        const token = jwt.sign({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }, config.JWT_SECRET);

        res.status(200).send({ message: 'ok', token: token });
      } catch (error) {
        console.error(error);
      }
    } else {
      res.status(400).send({ message: 'invalid parameters' });
    }
  });

  router.post('/api/users', async (req: Request<{}, {}, IUser>, res) => {
    const newUserSchema = new Schema({
      firstName: 'string',
      lastName: 'string',
      password: 'string',
      email: 'string',
    });

    if (newUserSchema.validate(req.body)) {
      try {
        const user = await new User(
          req.body.firstName,
          req.body.lastName,
          req.body.email,
          req.body.password
        ).save();

        res.status(200).send({ message: 'ok' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'server failure' });
      }
    } else {
      res.status(400).send({ message: 'failure' });
    }
  });

  return router;
}
