const LikeRepository = require('../../Domains/likes/LikeRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike({ commentId, owner }) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes (id, comment_id, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getLikeByCommentIdAndOwner({ commentId, owner }) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async removeLike(id) {
    const query = {
      text: 'DELETE FROM likes WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('like tidak ditemukan');
    }
  }

  async getLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*)::int FROM LIKES WHERE comment_id = $1',
      values: [commentId],
    };
    const { rows } = await this._pool.query(query);
    return rows[0].count;
  }
}

module.exports = LikeRepositoryPostgres;
