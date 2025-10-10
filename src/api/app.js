// Express app scaffolding for umbrella endpoints
const express = require('express');
const bodyParser = require('body-parser');

const { router: searchRouter } = require('./routes/search');
const { router: cartRouter } = require('./routes/cart');
const { router: checkoutRouter } = require('./routes/checkout');
const { router: ordersRouter } = require('./routes/orders');
// CMS routers
const { router: cmsArticlesRouter } = require('./routes/cms/articles');
const { router: cmsBannersRouter } = require('./routes/cms/banners');
const { router: cmsPreviewRouter } = require('./routes/cms/preview');
const { mountSwagger } = require('./swagger');

const app = express();
// Trust proxy headers so protocol/host are detected correctly when behind proxies
app.set('trust proxy', true);
app.use(bodyParser.json());

app.use('/search', searchRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/orders', ordersRouter);
// CMS mounts
app.use('/cms/articles', cmsArticlesRouter);
app.use('/cms/banners', cmsBannersRouter);
app.use('/cms/preview', cmsPreviewRouter);

// Swagger UI and raw spec
mountSwagger(app);

module.exports = { app };
