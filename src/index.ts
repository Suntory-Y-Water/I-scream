import { Hono } from 'hono';
import { router } from './api';
import { prettyJSON } from 'hono/pretty-json';
import { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();
app.use('/', prettyJSON());
app.route('/', router);

export default {
  fetch: app.fetch,
};
