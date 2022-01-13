const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/likes endpoint', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('on PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should return with 200 and return success status', async () => {
      // arrange
      const server = await createServer(container);

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: user.id });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should return with 401 when no token provided', async () => {
      // arrange
      const server = await createServer(container);

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({});
      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: user.id });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });

    it('should return with 404 when comment not found', async () => {
      // arrange
      const server = await createServer(container);

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/xyz/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });
});
