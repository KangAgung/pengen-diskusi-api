const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const PutLikeUseCase = require('../PutLikeUseCase');

describe('PutLikeUseCase', () => {
  it('should orchestrate add like action correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseAuth = {
      id: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.findCommentById = jest.fn(() => Promise.resolve());
    mockLikeRepository.getLikeByCommentIdAndOwner = jest.fn(() => Promise.resolve([]));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.removeLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const putLikeUseCase = new PutLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // action
    await putLikeUseCase.execute(useCaseParam, useCaseAuth);

    // assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockThreadRepository.getThreadById).toBeTruthy();
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCaseParam.commentId);
    expect(mockCommentRepository.findCommentById).toBeTruthy();
    expect(mockLikeRepository.getLikeByCommentIdAndOwner).toBeCalledWith({
      commentId: useCaseParam.commentId, owner: useCaseAuth.id,
    });
    expect(mockLikeRepository.addLike).toBeCalledWith({
      commentId: useCaseParam.commentId, owner: useCaseAuth.id,
    });
    expect(mockLikeRepository.removeLike).not.toBeCalled();
  });

  it('should orchestrate remove like action correctly', async () => {
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseAuth = {
      id: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.findCommentById = jest.fn(() => Promise.resolve());
    mockLikeRepository.getLikeByCommentIdAndOwner = jest.fn(() => Promise.resolve([
      { id: 'like-123', comment_id: 'comment-123', owner: 'user-123' },
    ]));
    mockLikeRepository.removeLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const putLikeUseCase = new PutLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // action
    await putLikeUseCase.execute(useCaseParam, useCaseAuth);

    // assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockThreadRepository.getThreadById).toBeTruthy();
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCaseParam.commentId);
    expect(mockCommentRepository.findCommentById).toBeTruthy();
    expect(mockLikeRepository.getLikeByCommentIdAndOwner).toBeCalledWith({
      commentId: useCaseParam.commentId, owner: useCaseAuth.id,
    });
    expect(mockLikeRepository.addLike).not.toBeCalled();
    expect(mockLikeRepository.removeLike).toBeCalledWith('like-123');
  });
});
