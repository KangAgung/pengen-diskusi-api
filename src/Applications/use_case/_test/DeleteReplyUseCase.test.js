const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply use case properly', async () => {
    // arrange

    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    const useCaseHeader = {
      authorization: 'Bearer token',
    };

    const userIdFromAccessToken = 'user-123';

    const expectedAccessToken = 'token';

    /** creating dependency for use case */
    const mockReplyRepository = new ReplyRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed functions */
    mockAuthenticationTokenManager.getTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAccessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: userIdFromAccessToken }));
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwnership = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // action
    await deleteReplyUseCase.execute(useCaseParam, useCaseHeader);

    // assert
    expect(mockAuthenticationTokenManager.getTokenFromHeader)
      .toBeCalledWith(useCaseHeader.authorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(expectedAccessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(expectedAccessToken);
    expect(mockReplyRepository.findReplyById).toBeCalledWith(useCaseParam.replyId);
    expect(mockReplyRepository.verifyReplyOwnership).toBeCalledWith({
      ownerId: userIdFromAccessToken, replyId: useCaseParam.replyId,
    });
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(useCaseParam.replyId);
  });
});
