const { mapDbComment, mapDbReply } = require('../MapDb');

describe('MapDbComment', () => {
  it('should Map Comment retrieved from database', () => {
    // arrange
    const comments = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2021-08-08T07:59:48.766Z',
        content: 'this is a comment',
        is_deleted: true,
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-09-08T07:59:48.766Z',
        content: 'this is another comment',
        is_deleted: false,
      },
    ];

    const expectedComment = [
      {
        id: 'comment-123',
        username: 'userA',
        date: '2021-08-08T07:59:48.766Z',
        content: '**komentar telah dihapus**',
      },
      {
        id: 'comment-456',
        username: 'userB',
        date: '2021-09-08T07:59:48.766Z',
        content: 'this is another comment',
      },
    ];

    // action
    const newComment = comments.map((comment) => mapDbComment(comment));

    // assert
    expect(newComment).toStrictEqual(expectedComment);
  });
});

describe('MapDbReply', () => {
  it('should Map Reply retrieved from database', () => {
    // Arrange
    const replies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'this is another reply',
        date: '2021-08-08T07:59:48.766Z',
        username: 'userA',
        is_deleted: true,
      },
      {
        id: 'reply-456',
        comment_id: 'comment-456',
        content: 'this is another reply',
        date: '2021-08-09T07:59:48.766Z',
        username: 'userB',
        is_deleted: false,
      },
    ];

    const expectedReplies = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        content: '**balasan telah dihapus**',
        date: '2021-08-08T07:59:48.766Z',
        username: 'userA',
      },
      {
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'this is another reply',
        date: '2021-08-09T07:59:48.766Z',
        username: 'userB',
      },
    ];

    // Action
    const newReply = replies.map((reply) => mapDbReply(reply));

    // assert
    expect(newReply).toStrictEqual(expectedReplies);
  });
});
