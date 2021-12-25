const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const { mapDbReply } = require('../../Commons/utils/mapDb');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const {
      commentId, owner, content,
    } = newReply;

    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, commentId, owner, content, date],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyOwnership({ ownerId, replyId }) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE owner = $1 AND id = $2',
      values: [ownerId, replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('Anda tidak memiliki akses');
    }
  }

  async getRepliesByThreadId(id) {
    const query = {
      text: `SELECT replies.id, replies.is_deleted, replies.content, replies.date,
              comments.id AS comment_id, users.username
              FROM replies 
              INNER JOIN comments ON replies.comment_id = comments.id
              INNER JOIN users ON replies.owner = users.id
              WHERE comments.thread_id = $1
              ORDER BY date ASC`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.map((data) => mapDbReply(data));
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted=TRUE WHERE id=$1 returning id',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    return { status: 'success' };
  }

  async findReplyById(replyId) {
    const query = {
      text: 'SELECT id from replies WHERE id=$1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
