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
import Middleware from './middleware';

const { protectedByUser } = Middleware;
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

export function apiRouter() {
  const router = Router();
  router.use(bodyParser.json());

  router.get('/api/@me', protectedByUser, async (req, res) => {
    const user = createUser(req.user);
    return res.send({
      user_id: user.user_id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  });

  router.post('/api/@me/login', async (req: Request<{}, {}, { email: string, password: string, remember: boolean }>, res) => {
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

        res.status(200).send({
          message: 'ok',
          token: token,
          remember: req.body.remember,
          user_id: user.user_id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
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
        switch (error.errno) {
          case 19:
            return res.status(400).send({ message: 'an account already exists with this email' });
          default:
            return res.status(500).send({ message: 'server failure' });
        }
      }
    } else {
      res.status(400).send({ message: 'failure' });
    }
  });

  router.get('/api/@me/postings', protectedByUser, async (req, res) => {
    try {
      const user = createUser(req.user);

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

  router.post('/api/postings/', upload.single('image'), protectedByUser, async (req: Request< {}, {}, IPosting>, res) => {
    try {
      const user = createUser(req.user);

      req.body.price = Number(req.body.price);
      if (isNaN(req.body.price)) {
        return res.status(400).send({ message: 'invalid request body'});
      }

      const schema = new Schema({
        title: 'string',
        description: 'string',
        currency: 'string',
        price: 'number',
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

  router.get('/api/postings/search', protectedByUser, async (req: Request<{}, {}, {}, { search: string }>, res) => {
    try {
      const schema = new Schema({
        search: 'string'
      });

      if (schema.validate(req.query)) {
        const user = createUser(req.user);
        try {
          const results = await user.search(req.query.search);
          res.status(200).send(results);
        } catch (error) {
          console.error(error);
          res.status(500).send({ message: 'server error' });
        }
      } else {
        return res.status(400).send({ message: 'invalid request' });
      }
    } catch (error) {
      return res.status(400).send({ message: 'invalid token' });
    }
  });

  // accessible to everyone (no user authentication required)
  router.get('/api/postings/:postingId', async (req: Request<{ postingId: string }>, res) => {
    try {
      const id = Number(req.params.postingId);
      
      if (isNaN(id)) {
        res.status(404).send({ message: 'resource not found' });
      } else {
        const posting = await Posting.build(id, true);
        res.status(200).send(posting.toJSON());
      }
    } catch (error) {
      console.error(error);
      res.status(400)
    }
  });

  router.delete('/api/postings/:postingId', protectedByUser, async (req: Request<{ postingId: string }>, res) => {
    try {
      const user = req.user;
      const id = Number(req.params.postingId);

      if (isNaN(id)) {
        res.status(404).send({ message: 'resource not found' });
      } else {
        try {
          const posting = await Posting.build(id, true);
          if (posting.author.user_id !== user.user_id) {
            return res.status(404).send({ message: 'resource not found' });
          }
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
  });

  return router;
}
