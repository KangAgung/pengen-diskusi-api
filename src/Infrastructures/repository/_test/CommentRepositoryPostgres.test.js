const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of CommentRepository', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  describe('behavior test', () => {
    beforeAll(async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    });
    afterEach(async () => {
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await pool.end();
    });

    describe('addComment function', () => {
      it('should add comment to database entry', async () => {
        // arrange
        const newComment = new NewComment({
          content: 'ini adalah sebuah konten',
          threadId: 'thread-123',
          owner: 'user-123',
        });
        const fakeIdGenerator = (id = '123') => id;
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, fakeIdGenerator,
        );

        // action
        const addedComment = await commentRepositoryPostgres.addComment(newComment);
        const comments = await CommentsTableTestHelper.findCommentById(addedComment.id);

        // assert
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: newComment.content,
          owner: newComment.owner,
        }));
        expect(comments).toBeDefined();
      });
    });

    describe('deleteCommentById', () => {
      it('should be able to delete added comment by id', async () => {
        // arrange
        const addedComment = {
          id: 'comment-123',
          threadId: 'thread-123',
        };

        await CommentsTableTestHelper.addComment({
          id: addedComment.id, threadId: addedComment.threadId,
        });

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        // action
        await commentRepositoryPostgres.deleteCommentById(addedComment.id);
        const comment = await CommentsTableTestHelper.findCommentById('comment-123');

        // assert
        expect(comment.is_deleted).toEqual(true);
      });

      it('should throw error when comment that wants to be deleted does not exist', async () => {
        // arrange
        const addedCommentId = 'comment-123';

        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

        // action & assert
        await expect(commentRepositoryPostgres.deleteCommentById(addedCommentId)).rejects.toThrowError('comment tidak dapat ditemukan');
      });
    });

    describe('verifyCommentOwnership', () => {
      it('should not throw error if user has authorization', async () => {
        await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {},
        );
        await expect(commentRepositoryPostgres.verifyCommentOwnership({
          commentId: 'comment-123', ownerId: 'user-123',
        })).resolves.toBeUndefined();
      });

      it('should throw error if user has no authorization', async () => {
        await ThreadsTableTestHelper.addThread({ id: 'thread-xyz' });
        await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-123' });
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool, {},
        );
        await expect(commentRepositoryPostgres.verifyCommentOwnership({
          threadId: 'thread-123', owner: 'user-456',
        })).rejects.toThrowError('Anda tidak mempunyai akses');
      });
    });

    describe('getCommentsByThreadId', () => {
      it('should return all comments from a thread', async () => {
        const firstComment = {
          id: 'comment-123', date: new Date('2021-08-09T07:59:48.766Z'), content: 'first comment', isDeleted: false,
        };
        const secondComment = {
          id: 'comment-456', date: new Date('2021-09-09T07:59:48.766Z'), content: 'second comment', isDeleted: false,
        };
        await CommentsTableTestHelper.addComment(firstComment);
        await CommentsTableTestHelper.addComment(secondComment);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        const expectedComment = [
          { ...firstComment, username: 'user' },
          { ...secondComment, username: 'user' },
        ];

        const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
        expect(commentDetails).toEqual(expectedComment);
      });
    });

    describe('findCommentById', () => {
      it('should not throw error when comment found', async () => {
        const comment = {
          id: 'comment-123', date: new Date('2021-08-09T07:59:48.766Z'), content: 'first comment', isDeleted: false,
        };

        await CommentsTableTestHelper.addComment(comment);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        await expect(commentRepositoryPostgres.findCommentById('comment-123'))
          .resolves.toBeUndefined();
      });

      it('should throw error when comment not found', async () => {
        const comment = {
          id: 'comment-123', date: new Date('2021-08-09T07:59:48.766Z'), content: 'first comment', isDeleted: false,
        };

        await CommentsTableTestHelper.addComment(comment);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        await expect(commentRepositoryPostgres.findCommentById('comment-xyz'))
          .rejects.toThrowError('comment tidak dapat ditemukan');
      });
    });
  });
});
