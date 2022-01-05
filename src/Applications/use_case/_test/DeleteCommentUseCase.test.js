const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment use case properly', async () => {
    // arrange
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseAuth = {
      id: 'user-123',
    };

    /** creating dependency for use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed functions */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwnership = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // action
    await deleteCommentUseCase.execute(useCaseParam, useCaseAuth);

    // assert
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCaseParam.commentId);
    expect(mockCommentRepository.findCommentById).toBeTruthy();
    expect(mockCommentRepository.verifyCommentOwnership).toBeCalledWith({
      owner: useCaseAuth.id, commentId: useCaseParam.commentId,
    });
    expect(mockCommentRepository.verifyCommentOwnership).toBeTruthy();
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCaseParam.commentId);
    expect(mockCommentRepository.deleteCommentById).toBeTruthy();
  });
});
