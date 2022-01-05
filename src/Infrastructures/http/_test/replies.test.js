const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoints', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('on POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should return with 201 and return success status with payload', async () => {
      // arrange
      const requestPayload = {
        content: 'a reply',
      };

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: user.id });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(typeof responseJson.data).toBe('object');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(typeof responseJson.data.addedReply).toBe('object');
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(typeof responseJson.data.addedReply.id).toBe('string');
      expect(responseJson.data.addedReply.content).toEqual('a reply');
      expect(responseJson.data.addedReply.owner).toEqual(user.id);
    });

    it('should return with 400 when payload has missing requirements', async () => {
      // arrange
      const requestPayload = {};

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: user.id });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });

    it('should return with 400 when payload wrong data type', async () => {
      // arrange
      const requestPayload = {
        content: 2021,
      };

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: user.id });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });

  describe('on DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
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
      const replyId = 'reply-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: user.id });
      await RepliesTableTestHelper.addReply({ id: replyId, owner: user.id });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should return with 403 if user does not have access to reply', async () => {
      // arrange
      const server = await createServer(container);

      const userA = {
        id: 'user-123',
        username: 'dicoding',
      };

      const userB = {
        id: 'user-456',
        username: 'dicodingIndo',
      };

      await ServerTestHelper.getAccessToken(userA);

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: userA.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userA.id });
      await RepliesTableTestHelper.addReply({ id: replyId, owner: userA.id });

      const accessToken = await ServerTestHelper.getAccessToken(userB);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });

    it('should return with 404 if reply is not exist', async () => {
      // arrange
      const server = await createServer(container);

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: user.id });
      await RepliesTableTestHelper.addReply({ id: replyId, owner: user.id });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/xyz`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });
});
