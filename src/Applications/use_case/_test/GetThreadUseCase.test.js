const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const retrieveComment = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2021-09-08T07:59:48.766Z',
        content: 'this is a comment',
        is_deleted: true,
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-10-08T07:59:48.766Z',
        content: 'this is another comment',
        is_deleted: false,
      },
    ];

    const retrieveReply = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'this is a reply for a comment',
        date: '2021-10-08T07:59:48.766Z',
        username: 'userB',
        is_deleted: false,
      },
      {
        id: 'reply-456',
        comment_id: 'comment-456',
        content: 'this is another reply',
        date: '2021-11-08T07:59:48.766Z',
        username: 'userA',
        is_deleted: true,
      },
    ];

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
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
        content: '**komentar telah dihapus**',
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-10-08T07:59:48.766Z',
        content: 'this is another comment',
      },
    ];

    const replies = [
      {
        id: 'reply-123',
        content: 'this is a reply for a comment',
        date: '2021-10-08T07:59:48.766Z',
        username: 'userB',
      },
      {
        id: 'reply-456',
        content: '**balasan telah dihapus**',
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
      .mockImplementation(() => Promise.resolve(retrieveComment));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(retrieveReply));

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

    const spyCheckDeletedComments = jest.spyOn(getThreadDetailUseCase, '_checkDeletedComments');
    const spyCheckDeletedReplies = jest.spyOn(getThreadDetailUseCase, '_checkDeletedReplies');
    const spyMapRepliesForComments = jest.spyOn(getThreadDetailUseCase, '_mapRepliesForComments');

    // action
    const useCaseResult = await getThreadDetailUseCase.execute(useCaseParam);

    // assert
    expect(useCaseResult).toEqual(new DetailThread({
      ...expectedDetailThread, comments: expectedCommentsAndReplies,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(spyCheckDeletedComments).toBeCalledTimes(1);
    expect(spyCheckDeletedReplies).toBeCalledTimes(1);
    expect(spyMapRepliesForComments).toBeCalledTimes(1);
  });
});
