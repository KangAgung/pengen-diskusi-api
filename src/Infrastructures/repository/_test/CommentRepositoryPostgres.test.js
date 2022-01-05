const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
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
    it('should add comment then return added comment', async () => {
      // arrange
      const newComment = new NewComment({
        content: 'ini adalah sebuah konten',
      });
      const threadId = 'thread-123';
      const owner = 'user-123';

      const idGen = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, idGen);

      // action
      const addedComment = await commentRepositoryPostgres.addComment(newComment, owner, threadId);
      const comments = await CommentsTableTestHelper.findCommentById(addedComment.id);

      // assert
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: newComment.content,
        owner,
      }));
    });
  });

  describe('deleteCommentById', () => {
    it('should not throw error when success delete comment by id', async () => {
      // arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // action
      const comment = await commentRepositoryPostgres.deleteCommentById('comment-123');

      // assert
      expect(comment).toBeUndefined();
    });

    it('should change value of is_deleted column in the database when comment is deleted', async () => {
      // arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', threadId: 'thread-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      await commentRepositoryPostgres.deleteCommentById('comment-123');
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');

      // assert
      expect(comment).toHaveLength(1);
      expect(comment[0].is_deleted).toEqual(true);
    });

    it('should throw error when comment does not exist', async () => {
      // arrange
      const addedCommentId = 'comment-123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {}, {});

      // action & assert
      await expect(commentRepositoryPostgres.deleteCommentById(addedCommentId)).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwnership', () => {
    it('should not throw error if comment belong to user', async () => {
      // arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // action
      const comment = await commentRepositoryPostgres.verifyCommentOwnership({
        commentId: 'comment-123', owner: 'user-123',
      });

      // assert
      expect(comment).toBeUndefined();
    });

    it('should throw error if comment not belong to user', async () => {
      // arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // assert
      await expect(commentRepositoryPostgres.verifyCommentOwnership({
        commentId: 'comment-123', owner: 'user-456',
      })).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return all comments from a thread', async () => {
      // arrange
      const comment = [
        {
          id: 'comment-123',
          date: new Date('2021-08-09T07:59:48.766Z'),
          content: 'first comment',
        },
        {
          id: 'comment-456',
          date: new Date('2021-09-09T07:59:48.766Z'),
          content: 'second comment',
        },
      ];

      await CommentsTableTestHelper.addComment(comment[0]);
      await CommentsTableTestHelper.addComment(comment[1]);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const expectedComment = [
        { ...comment[0], username: 'user' },
        { ...comment[1], username: 'user' },
      ];

      // action
      const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // assert
      expect(commentDetails).toHaveLength(2);
      expect(commentDetails).toEqual(expectedComment);
    });
  });

  describe('findCommentById', () => {
    it('should not throw error when comment found', async () => {
      // arrange
      const comment = {
        id: 'comment-123', date: new Date('2021-08-09T07:59:48.766Z'), content: 'first comment', isDeleted: false,
      };

      await CommentsTableTestHelper.addComment(comment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // assert
      await expect(commentRepositoryPostgres.findCommentById('comment-123'))
        .resolves.toBeUndefined();
    });

    it('should throw NotFoundError when comment is not found', async () => {
      // arrange
      const comment = {
        id: 'comment-123', date: new Date('2021-08-09T07:59:48.766Z'), content: 'first comment', isDeleted: false,
      };

      await CommentsTableTestHelper.addComment(comment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // assert
      await expect(commentRepositoryPostgres.findCommentById('comment-xyz'))
        .rejects.toThrowError(NotFoundError);
    });
  });
});
