const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

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
    const useCaseAuth = {
      id: 'user-123',
    };
    const newReply = new NewReply(useCasePayload);

    const expectedAddedReply = new AddedReply({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCaseAuth.id,
    });

    /** creating dependancies for use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed functions */
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
    });

    // action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload, useCaseParam, useCaseAuth,
    );

    // assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockThreadRepository.getThreadById).toBeTruthy();
    expect(mockCommentRepository.findCommentById).toBeCalledWith(useCaseParam.commentId);
    expect(mockCommentRepository.findCommentById).toBeTruthy();
    expect(mockReplyRepository.addReply).toBeCalledWith(newReply, useCaseAuth.id, useCaseParam.commentId);
  });
});
