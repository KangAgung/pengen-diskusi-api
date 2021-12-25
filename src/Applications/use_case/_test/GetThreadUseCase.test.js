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

    const retrievedComments = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2021-09-08T07:59:48.766Z',
        content: 'this is a comment',
        replies: [],
        isDeleted: false,
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-10-08T07:59:48.766Z',
        content: 'this is another comment',
        replies: [],
        isDeleted: false,
      },
    ];

    const retrievedReplies = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'this is a reply for a comment',
        date: '2021-10-08T07:59:48.766Z',
        username: 'userB',
        isDeleted: false,
      },
      {
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'this is another reply',
        date: '2021-11-08T07:59:48.766Z',
        username: 'userA',
        isDeleted: false,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(retrievedReplies));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(retrievedComments));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // filtering retrievedComments to remove isDeleted property
    const {
      isDeleted: isDeletedCommentA,
      ...filteredCommentDetailsA
    } = retrievedComments[0];
    const {
      isDeleted: isDeletedCommentB,
      ...filteredCommentDetailsB
    } = retrievedComments[1];

    // filtering retrievedReplies to removed commentId and isDeleted property
    const {
      commentId: commentIdReplyA,
      isDeleted: isDeletedReplyA,
      ...filteredReplyDetailsA
    } = retrievedReplies[0];
    const {
      commentId: commentIdReplyB,
      isDeleted: isDeletedReplyB,
      ...filteredReplyDetailsB
    } = retrievedReplies[1];

    const expectedCommentsAndReplies = [
      { ...filteredCommentDetailsA, replies: [filteredReplyDetailsA] },
      { ...filteredCommentDetailsB, replies: [filteredReplyDetailsB] },
    ];

    getThreadDetailUseCase._checkIsDeletedComments = jest.fn()
      .mockImplementation(() => [filteredCommentDetailsA, filteredCommentDetailsB]);
    getThreadDetailUseCase._getRepliesForComments = jest.fn()
      .mockImplementation(() => expectedCommentsAndReplies);

    // action
    const useCaseResult = await getThreadDetailUseCase.execute(useCaseParam);

    // assert
    expect(useCaseResult).toEqual(new DetailThread({
      ...expectedDetailThread, comments: expectedCommentsAndReplies,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(getThreadDetailUseCase._checkIsDeletedComments).toBeCalledWith(retrievedComments);
    expect(getThreadDetailUseCase._getRepliesForComments)
      .toBeCalledWith([filteredCommentDetailsA, filteredCommentDetailsB], retrievedReplies);
  });

  it('should _checkIsDeletedComments function working properly', () => {
    // arrange
    const getThreadDetailUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );
    const retrievedComments = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2021-08-08T07:59:48.766Z',
        content: 'this is a comment',
        replies: [],
        isDeleted: true,
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-08-09T07:59:48.766Z',
        content: 'this is another comment',
        replies: [],
        isDeleted: false,
      },
    ];

    const {
      isDeleted: isDeletedCommentA,
      ...filteredCommentDetailsA
    } = retrievedComments[0];
    const {
      isDeleted: isDeletedCommentB,
      ...filteredCommentDetailsB
    } = retrievedComments[1];
    const SpyCheckIsDeletedComments = jest.spyOn(getThreadDetailUseCase, '_checkIsDeletedComments');

    // action
    getThreadDetailUseCase._checkIsDeletedComments(retrievedComments);

    // assert
    expect(SpyCheckIsDeletedComments)
      .toReturnWith([
        { ...filteredCommentDetailsA, content: '**komentar telah dihapus**' },
        filteredCommentDetailsB]);

    SpyCheckIsDeletedComments.mockClear();
  });

  it('should _getRepliesForComments function working properly', () => {
    // arrange
    const getThreadDetailUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {}, likeRepository: {} },
    );
    const filteredComments = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2021-08-08T07:59:48.766Z',
        content: '**komentar telah dihapus**',
        replies: [],
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-09-08T07:59:48.766Z',
        content: 'this is a comment',
        replies: [],
      },
    ];

    const retrievedReplies = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'this is a reply',
        date: '2021-08-08T07:59:48.766Z',
        username: 'userA',
        isDeleted: true,
      },
      {
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'this is another reply',
        date: '2021-08-09T07:59:48.766Z',
        username: 'userB',
        isDeleted: false,
      },
    ];

    const {
      commentId: commentIdReplyA, isDeleted: isDeletedReplyA,
      ...filteredReplyDetailsA
    } = retrievedReplies[0];
    const {
      commentId: commentIdReplyB, isDeleted: isDeletedReplyB,
      ...filteredReplyDetailsB
    } = retrievedReplies[1];

    const expectedCommentsAndReplies = [
      { ...filteredComments[0], replies: [{ ...filteredReplyDetailsA, content: '**balasan telah dihapus**' }] },
      { ...filteredComments[1], replies: [filteredReplyDetailsB] },
    ];

    const SpyGetRepliesForComments = jest.spyOn(getThreadDetailUseCase, '_getRepliesForComments');

    // action
    getThreadDetailUseCase
      ._getRepliesForComments(filteredComments, retrievedReplies);

    // assert
    expect(SpyGetRepliesForComments)
      .toReturnWith(expectedCommentsAndReplies);

    SpyGetRepliesForComments.mockClear();
  });
});
