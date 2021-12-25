class getThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParam) {
    const { threadId } = useCaseParam;
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    threadDetail.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const threadReplies = await this._replyRepository.getRepliesByThreadId(threadId);

    threadDetail.comments = this._checkIsDeletedComments(threadDetail.comments);
    threadDetail.comments = this._getRepliesForComments(threadDetail.comments, threadReplies);

    return threadDetail;
  }

  _checkIsDeletedComments(comments) {
    comments.forEach((comment) => {
      comment.content = comment.isDeleted ? '**komentar telah dihapus**' : comment.content;
      delete comment.isDeleted;
    });
    return comments;
  }

  _getRepliesForComments(comments, threadReplies) {
    comments.forEach((comment) => {
      const commentId = comment.id;
      comment.replies = threadReplies
        .filter((reply) => reply.commentId === commentId)
        .map(({ commentId, ...reply }) => {
          reply.content = reply.isDeleted ? '**balasan telah dihapus**' : reply.content;
          delete reply.isDeleted;
          return reply;
        });
    });
    return comments;
  }
}

module.exports = getThreadUseCase;
