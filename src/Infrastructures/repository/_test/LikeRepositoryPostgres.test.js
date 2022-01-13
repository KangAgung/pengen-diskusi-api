const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'SomeUser' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addLike function', () => {
    it('should add like to a comment and then return the like id', async () => {
      // arrange
      const like = {
        commentId: 'comment-123',
        owner: 'user-123',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      // action
      const addedLike = await likeRepository.addLike(like);
      const likedComment = await LikesTableTestHelper.getLikeByCommentIdAndOwner(like);

      // assert
      expect(likedComment).toHaveLength(1);
      expect(addedLike).toStrictEqual({ id: 'like-123' });
    });
  });

  describe('getLikeByCommentIdAndOwner function', () => {
    it('should find like by comment id and owner then return the result', async () => {
      // arrange
      const like = {
        commentId: 'comment-123',
        owner: 'user-123',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');
      await LikesTableTestHelper.addLike({});

      // action
      const getLike = await likeRepository.getLikeByCommentIdAndOwner(like);

      // assert
      expect(getLike).toHaveLength(1);
    });

    it('should return zero array when like not found by comment id or owner', async () => {
      // arrange
      const like = {
        commentId: 'comment-456',
        owner: 'user-123',
      };

      const anotherLike = {
        commentId: 'comment-123',
        owner: 'user-456',
      };

      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');
      await LikesTableTestHelper.addLike({});

      // action
      const getLike = await likeRepository.getLikeByCommentIdAndOwner(like);
      const getAnotherLike = await likeRepository.getLikeByCommentIdAndOwner(anotherLike);

      // assert
      expect(getLike).toHaveLength(0);
      expect(getAnotherLike).toHaveLength(0);
    });
  });

  describe('removeLike function', () => {
    it('should not throw error when remove like by id', async () => {
      // arrange
      await LikesTableTestHelper.addLike({});
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // action & assert
      await expect(likeRepository.removeLike('like-123')).resolves.not.toThrowError();
    });

    it('should throw error when like id not found', async () => {
      // arrange
      await LikesTableTestHelper.addLike({});
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // action & assert
      await expect(likeRepository.removeLike('like-456')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getLikeCount function', () => {
    it('should return comment\'s like count when get like count by comment id', async () => {
      // arrange
      await LikesTableTestHelper.addLike({});
      const likeRepository = new LikeRepositoryPostgres(pool, {});

      // action
      const result = await likeRepository.getLikeCount('comment-123');

      // asserts
      expect(result).toEqual(1);
    });
  });
});
