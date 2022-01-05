const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-1234',
      title: 'a thread',
      body: 'a content from a thread',
      date: '2021-08-08T07:59:48.766Z',
      username: 'user',
      comments: [],
    });

    const comments = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2021-09-08T07:59:48.766Z',
        content: 'this is a comment',
        replies: [],
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-10-08T07:59:48.766Z',
        content: 'this is another comment',
        replies: [],
      },
    ];

    const replies = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'this is a reply for a comment',
        date: '2021-10-08T07:59:48.766Z',
        username: 'userB',
      },
      {
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'this is another reply',
        date: '2021-11-08T07:59:48.766Z',
        username: 'userA',
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(replies));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const expectedCommentsAndReplies = [
      { ...comments[0], replies: [replies[0]] },
      { ...comments[1], replies: [replies[1]] },
    ];

    // action
    const useCaseResult = await getThreadDetailUseCase.execute(useCaseParam);

    // assert
    expect(useCaseResult).toEqual(new DetailThread({
      ...expectedDetailThread, comments: expectedCommentsAndReplies,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParam.threadId);
  });
});
