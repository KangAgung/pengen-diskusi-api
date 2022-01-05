const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoints', () => {
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

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // arrange
      const requestPayload = {
        title: 'lorem ipsum',
        body: 'dolor sit amet',
      };

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
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
      expect(responseJson.data.addedThread).toBeDefined();
      expect(typeof responseJson.data.addedThread).toBe('object');
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(typeof responseJson.data.addedThread.id).toBe('string');
      expect(responseJson.data.addedThread.title).toEqual('lorem ipsum');
      expect(responseJson.data.addedThread.owner).toEqual(user.id);
    });

    it('should respond with 403 when no access token is provided', async () => {
      // arrange
      const requestPayload = {
        title: 'lorem ipsum',
        body: 'dolor sit amet',
      };

      const server = await createServer(container);

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response with 400 when payload does not meet structure specifications', async () => {
      // arrange
      const requestPayload = {
        title: 'lorem ipsum',
      };

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });

    it('should response with 400 when payload does not meet data type specifications', async () => {
      // arrange
      const requestPayload = {
        title: {},
        body: 123,
      };

      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const server = await createServer(container);

      const accessToken = await ServerTestHelper.getAccessToken(user);

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond with 200 with thread details and comments', async () => {
      const server = await createServer(container);

      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'Dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'DicodingIndo' });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: 'user-123', title: 'a thread' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', threadId, owner: 'user-123', content: 'comment 1',
      });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-456', commentId: 'comment-123', owner: 'user-456' });

      // action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(typeof responseJson.data).toBe('object');
      expect(responseJson.data.thread).toBeDefined();
      expect(typeof responseJson.data.thread).toBe('object');
      expect(responseJson.data.thread.id).toBeDefined();
      expect(typeof responseJson.data.thread.id).toBe('string');
      expect(responseJson.data.thread.title).toEqual('a thread');
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].content).toEqual('comment 1');
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
    });

    it('should respond with 200 and with thread details with empty comments', async () => {
      const server = await createServer(container);

      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadTableTestHelper.addThread({ id: threadId, owner: 'user-123', title: 'a title' });

      // action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(typeof responseJson.data).toBe('object');
      expect(responseJson.data.thread).toBeDefined();
      expect(typeof responseJson.data.thread).toBe('object');
      expect(responseJson.data.thread.id).toBeDefined();
      expect(typeof responseJson.data.thread.id).toBe('string');
      expect(responseJson.data.thread.title).toEqual('a title');
      expect(responseJson.data.thread.comments).toHaveLength(0);
    });

    it('should respond with 404 if thread does not exist', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/xyz',
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
