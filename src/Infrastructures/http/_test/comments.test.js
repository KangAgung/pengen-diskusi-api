const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/comments endpoints', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted thread', async () => {
      // arrange
      const requestPayload = {
        content: 'a comment',
      };

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
      expect(responseJson.data.addedComment).toBeDefined();
      expect(typeof responseJson.data.addedComment).toBe('object');
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(typeof responseJson.data.addedComment.id).toBe('string');
      expect(responseJson.data.addedComment.content).toEqual('a comment');
      expect(responseJson.data.addedComment.owner).toEqual(user.id);
    });

    it('should respond with 400 when comment payload has wrong data type', async () => {
      // arrange
      const requestPayload = {
        content: undefined,
      };

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      const threadId = 'thread-123';

      await ThreadTableTestHelper.addThread({ id: threadId, owner: user.id });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond with 200 and return success', async () => {
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

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should respond with 403 when delete comment from other user', async () => {
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

      const firstThreadId = 'thread-123';
      const firstCommentId = 'comment-123';

      await ThreadTableTestHelper.addThread({ id: firstThreadId, owner: userA.id });
      await CommentsTableTestHelper.addComment({ id: firstCommentId, owner: userA.id });

      const accessToken = await ServerTestHelper.getAccessToken(userB);

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${firstThreadId}/comments/${firstCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });
});
