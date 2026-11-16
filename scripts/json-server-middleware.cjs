// POST /posts 요청이 오면 id를 직접 만들어서
// db.json 안의 키 순서를 userId, id, title, body 로 맞춰 줌
module.exports = (req, res, next) => {
  if (req.method === 'POST' && req.path === '/posts' && req.body.id === undefined) {
    const posts = req.app.db.get('posts').value();
    const nextId = posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const { userId, title, body, ...rest } = req.body;
    req.body = { userId, id: nextId, title, body, ...rest };
  }
  next();
};
