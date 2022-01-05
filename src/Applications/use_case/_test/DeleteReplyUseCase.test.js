const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply use case properly', async () => {
    // arrange
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };
    const useCaseAuth = {
      id: 'user-123',
    };

    /** creating dependency for use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed functions */
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwnership = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // action
    await deleteReplyUseCase.execute(useCaseParam, useCaseAuth);

    // assert
    expect(mockReplyRepository.findReplyById).toBeCalledWith(useCaseParam.replyId);
    expect(mockReplyRepository.findReplyById).toBeTruthy();
    expect(mockReplyRepository.verifyReplyOwnership).toBeCalledWith({
      owner: useCaseAuth.id, replyId: useCaseParam.replyId,
    });
    expect(mockReplyRepository.verifyReplyOwnership).toBeTruthy();
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(useCaseParam.replyId);
    expect(mockReplyRepository.deleteReplyById).toBeTruthy();
  });
});
