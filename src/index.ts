import { Context, Hono } from 'hono';
import { router } from './api';
import { prettyJSON } from 'hono/pretty-json';
import { Bindings } from './types';
import { bearerAuth } from 'hono/bearer-auth';
import { doSomeTaskOnASchedule } from './model';

const app = new Hono();
app.use('/', prettyJSON());
app.use(
  '/scheduled',
  async (
    c: Context<{
      Bindings: Bindings;
    }>,
    next,
  ) => {
    const token = c.env.BEARER_TOKEN;
    const auth = bearerAuth({ token });
    return auth(c, next);
  },
);
app.route('/', router);
const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (event, env, ctx) => {
  ctx.waitUntil(doSomeTaskOnASchedule(env.API_URL, env.BEARER_TOKEN));
};
export default {
  fetch: app.fetch,
  scheduled,
};
