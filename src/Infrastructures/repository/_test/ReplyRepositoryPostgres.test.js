const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  it('should be instance of ReplyRepository', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});

    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('behavior test', () => {
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
      it('should add reply to database', async () => {
        // arrange
        const newReply = new NewReply({
          commentId: 'comment-123',
          owner: 'user-123',
          content: 'a reply',
        });

        const fakeIdGenerator = (id = '123') => id;
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(
          pool, fakeIdGenerator,
        );

        // action
        const addedReply = await replyRepositoryPostgres.addReply(newReply);
        const reply = await RepliesTableTestHelper.findReplyById(addedReply.id);

        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: newReply.content,
          owner: newReply.owner,
        }));
        expect(reply).toBeDefined();
      });
    });

    describe('verifyReplyOwnership function', () => {
      it('should not throw error when user has access', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({});

        await expect(replyRepositoryPostgres.verifyReplyOwnership({
          ownerId: 'user-123',
          replyId: 'reply-123',
        })).resolves.toBeUndefined();
      });

      it('should throw error when user does not have access', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({});

        await expect(replyRepositoryPostgres.verifyReplyOwnership({
          ownerId: 'user-456',
          replyId: 'reply-123',
        })).rejects.toThrowError('Anda tidak memiliki akses');
      });
    });

    describe('getRepliesByThreadId function', () => {
      it('it should return all of the replies in a thread', async () => {
        // arrange

        const replyA = {
          id: 'reply-123', commentId: 'comment-123', content: 'this is a reply', date: new Date('2021-08-09T07:59:48.766Z'), isDeleted: false,
        };
        const replyB = {
          id: 'reply-456', commentId: 'comment-123', content: 'this is another reply', date: new Date('2021-08-18T07:59:48.766Z'), isDeleted: false,
        };

        const expectedReplies = [
          { ...replyA, username: 'userB' }, { ...replyB, username: 'user' },
        ];

        await RepliesTableTestHelper.addReply({ ...replyA, owner: 'user-456' });
        await RepliesTableTestHelper.addReply({ ...replyB, owner: 'user-123' });

        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

        const retrievedReplies = await replyRepositoryPostgres.getRepliesByThreadId('thread-123');

        expect(retrievedReplies).toEqual(expectedReplies);
      });
    });

    describe('deleteReplyById function', () => {
      it('should not throw error when reply deleted successfully', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({});

        await expect(replyRepositoryPostgres.deleteReplyById('reply-123'))
          .resolves.toBeDefined();
      });

      it('deleted reply should have is_deleted column as true in database', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({});
        await replyRepositoryPostgres.deleteReplyById('reply-123');

        const reply = await RepliesTableTestHelper.findReplyById('reply-123');
        expect(reply.is_deleted).toEqual(true);
      });

      it('should throw error when reply has been already deleted', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await expect(replyRepositoryPostgres.deleteReplyById('reply-123'))
          .rejects.toThrowError('reply tidak ditemukan');
      });
    });

    describe('findReplyById function', () => {
      it('should not throw error when reply is exist', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await RepliesTableTestHelper.addReply({});

        await expect(replyRepositoryPostgres.findReplyById('reply-123'))
          .resolves.toBeUndefined();
      });

      it('should throw error when reply is not found', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {}, {});

        await expect(replyRepositoryPostgres.findReplyById('reply-xyz'))
          .rejects.toThrowError('reply tidak ditemukan');
      });
    });
  });
});
