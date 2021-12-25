const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment use case properly', async () => {
    // arrange
    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const useCaseHeader = {
      authorization: 'Bearer token',
    };

    const userIdFromAccessToken = 'user-123';

    const expectedAccessToken = 'token';

    const expectedDeletedComment = {
      id: 'comment-123',
    };

    /** creating dependency for use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed functions */
    mockAuthenticationTokenManager.getTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAccessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: userIdFromAccessToken }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwnership = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const addCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // action
    await addCommentUseCase.execute(useCaseParam, useCaseHeader);

    // assert
    expect(mockAuthenticationTokenManager.getTokenFromHeader)
      .toBeCalledWith(useCaseHeader.authorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(expectedAccessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(expectedAccessToken);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(expectedDeletedComment.id);
    expect(mockCommentRepository.verifyCommentOwnership).toBeCalledWith({
      ownerId: userIdFromAccessToken, commentId: useCaseParam.commentId,
    });
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(expectedDeletedComment.id);
  });
});
