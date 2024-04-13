import { Hono } from 'hono';
import { iscream } from './iscream/api';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono();
app.use('/api/iscream', prettyJSON());
app.route('/api/iscream', iscream);

export default app;
