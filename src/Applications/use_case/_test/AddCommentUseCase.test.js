const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment use case properly', async () => {
    // arrange
    const useCasePayload = {
      content: 'this is a comment',
    };
    const useCaseParam = {
      threadId: 'thread-123',
    };
    const useCaseAuth = {
      id: 'user-123',
    };
    const newComment = new NewComment(useCasePayload);

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCaseAuth.id,
    });

    /** creating dependency of for use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed functions */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload, useCaseParam, useCaseAuth,
    );

    // assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockThreadRepository.getThreadById).toBeTruthy();
    expect(mockCommentRepository.addComment).toBeCalledWith(newComment, useCaseAuth.id, useCaseParam.threadId);
  });
});
