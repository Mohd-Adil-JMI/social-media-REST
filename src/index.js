const express = require('express');
require('./db/mongoose');
const UserRouter = require('./routers/user');
const PostRouter = require('./routers/post');
const FeedRouter = require('./routers/feeds');
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', UserRouter);
app.use('/api', PostRouter);
app.use('/api', FeedRouter);
app.get('*', (req, res) => {
  res.status(200).send('I am alive');
});
app.listen(PORT, () => {
  console.log(`App Listening at http://localhost:${PORT}`);
});
