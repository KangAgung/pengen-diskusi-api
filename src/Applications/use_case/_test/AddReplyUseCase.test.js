const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply use case properly', async () => {
    // arrange
    const useCasePayload = {
      content: 'this is a reply',
    };

    const useCaseParam = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const useCaseHeader = {
      authorization: 'Bearer token',
    };

    const userIdFromAccessToken = 'user-123';

    const expectedAccessToken = 'token';

    const expectedAddedReply = new AddedReply({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: userIdFromAccessToken,
    });

    /** creating dependancies for use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed functions */
    mockAuthenticationTokenManager.getTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAccessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'user-123' }));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload, useCaseParam, useCaseHeader,
    );

    // assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockAuthenticationTokenManager.getTokenFromHeader)
      .toBeCalledWith(useCaseHeader.authorization);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(expectedAccessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(expectedAccessToken);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCaseParam.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(new NewReply({
      threadId: useCaseParam.threadId,
      commentId: useCaseParam.commentId,
      owner: userIdFromAccessToken,
      content: useCasePayload.content,
    }));
  });
});