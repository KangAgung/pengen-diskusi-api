const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'userB' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
  });
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should add reply and then return added reply', async () => {
      // arrange
      const newReply = new NewReply({
        content: 'a reply',
      });

      const idGen = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, idGen);

      // action
      const addedReply = await replyRepositoryPostgres.addReply(newReply, 'user-123', 'comment-123');
      const reply = await RepliesTableTestHelper.findReplyById(addedReply.id);

      // assert
      expect(reply).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: newReply.content,
        owner: 'user-123',
      }));
    });
  });

  describe('verifyReplyOwnership function', () => {
    it('should not throw error when reply belong to user', async () => {
      // arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await RepliesTableTestHelper.addReply({});

      const payload = {
        owner: 'user-123',
        replyId: 'reply-123',
      };

      // action
      const verify = await replyRepositoryPostgres.verifyReplyOwnership(payload);

      // assert
      expect(verify).toBeUndefined();
    });

    it('should throw error when reply not belong to user', async () => {
      // arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});
      await RepliesTableTestHelper.addReply({});

      // assert
      await expect(replyRepositoryPostgres.verifyReplyOwnership({
        owner: 'user-456',
        replyId: 'reply-123',
      })).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return all of the replies from a thread', async () => {
      // arrange
      const reply = [
        {
          id: 'reply-123',
          comment_id: 'comment-123',
          content: 'this is a reply',
          date: new Date('2021-08-09T07:59:48.766Z'),
          is_deleted: true,
        },
        {
          id: 'reply-456',
          comment_id: 'comment-123',
          content: 'this is another reply',
          date: new Date('2021-08-18T07:59:48.766Z'),
          is_deleted: false,
        },
      ];

      const expectedReplies = [
        { ...reply[0], username: 'userB' },
        { ...reply[1], username: 'user' },
      ];

      await RepliesTableTestHelper.addReply({
        ...reply[0], owner: 'user-456', commentId: reply[0].comment_id, isDeleted: reply[0].is_deleted,
      });
      await RepliesTableTestHelper.addReply({
        ...reply[1], owner: 'user-123', commentId: reply[1].comment_id, isDeleted: reply[1].is_deleted,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

      // assert
      expect(replies).toEqual(expectedReplies);
    });
  });

  describe('deleteReplyById function', () => {
    it('should not throw error when success delete a reply', async () => {
      // arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});
      await RepliesTableTestHelper.addReply({});

      // action
      const reply = await replyRepositoryPostgres.deleteReplyById('reply-123');

      // assert
      expect(reply).toBeUndefined();
    });

    it('should change value of is_deleted column in the database when reply is deleted', async () => {
      // arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      await RepliesTableTestHelper.addReply({});
      await replyRepositoryPostgres.deleteReplyById('reply-123');

      // action
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');

      // assert
      expect(reply).toHaveLength(1);
      expect(reply[0].is_deleted).toEqual(true);
    });

    it('should throw error when reply is not found', async () => {
      // arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // assert
      await expect(replyRepositoryPostgres.deleteReplyById('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('findReplyById function', () => {
    it('should not throw error when reply is found', async () => {
      // arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});
      await RepliesTableTestHelper.addReply({});

      // assert
      await expect(replyRepositoryPostgres.findReplyById('reply-123'))
        .resolves.toBeUndefined();
    });

    it('should throw error when reply is not found', async () => {
      // arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

      // assert
      await expect(replyRepositoryPostgres.findReplyById('reply-xyz'))
        .rejects.toThrowError(NotFoundError);
    });
  });
});
