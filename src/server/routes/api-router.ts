import bodyParser from 'body-parser';
import { Router, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as config from '../config';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import { Validation } from '../../shared/utils';
import {
  User, IUser, createUser,
  Posting, IPosting, Currency
} from '../models';

const { Schema } = Validation;

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'assets', 'uploads'),
  filename: function (_, file, callback) {
    let extension = '.';
    switch (file.mimetype) {
      case 'image/png':
        extension += 'png';
        break;
      case 'image/gif':
        extension += 'gif';
        break;
      case 'image/jpeg':
        extension += 'jpg';
        break;
      default:
        return callback(new Error('invalid image'), null);
    }
    return callback(null, uuid() + extension);
  }
});

const upload = multer({ storage: storage });

export function useToken(request: Request): string[] {
  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new Error('invalid authorization');
  } else {
    return authorization.split(/\s+/);
  }
}

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
          user_id: user.user_id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password
        }, config.JWT_SECRET);

        res.status(200).send({ message: 'ok', token: token, remember: req.body.remember });
      } catch (error) {
        console.error(error);
        res.status(400).send({ message: 'invalid credentials' });
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

  router.get('/api/@me/postings', async (req, res) => {
    try {
      const [_, token] = useToken(req);
      const user = createUser(<IUser>jwt.verify(token, config.JWT_SECRET));

      try {
        const postings = await user.fetchPostings();
        res.send(postings);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'internal server error' });
      }
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'invalid authorization token' });
    }
  });

  router.post('/api/postings/', upload.single('image'), async (req: Request<{}, {}, IPosting>, res) => {
    try {
      const [_, token] = useToken(req);
      const user = createUser(<User>jwt.verify(token, config.JWT_SECRET));
      const schema = new Schema({
        title: 'string',
        description: 'string',
        currency: 'string',
        price: 'string',
      });

      if (schema.validate(req.body)) {
        try {
          const filename = req.file ? req.file.filename : 'default-placeholder.png';
          const posting = await new Posting(user, req.body.title, req.body.description, req.body.price, 'USD', undefined, undefined, filename).save();
          res.status(200).send({ id: posting.postingId, image: filename });
        } catch (error) {
          console.error(error);
          res.status(500).send({ message: 'internal server error' });
        }
      } else {
        res.status(400).send({ message: 'invalid data format' });
      }
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'invalid token' });
    }
  });

  router.delete('/api/postings/:postingId', async (req: Request<{ postingId: string }>, res) => {
    try {
      const _ = useToken(req);
      const id = Number(req.params.postingId);

      if (isNaN(id)) {
        res.status(404).send({ message: 'resource not found' });
      } else {
        try {
          await Posting.delete(id);
        } catch (error) {
          console.error(error);
          res.status(404).send({ message: 'resource not found' });
        }
        res.status(200).send({ message: 'ok' });
      }
    } catch (error) {
      console.error(error);
      res.status(400).send({ message: 'invalid token' });
    }
  })

  return router;
}
