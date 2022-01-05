class getThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParam) {
    const threadDetail = await this._threadRepository.getThreadById(useCaseParam.threadId);
    threadDetail.comments = await this._commentRepository.getCommentsByThreadId(useCaseParam.threadId);
    const threadReplies = await this._replyRepository.getRepliesByThreadId(useCaseParam.threadId);
    threadDetail.comments = threadDetail.comments.map((comment) => {
      comment.replies = threadReplies.filter((reply) => (reply.commentId === comment.id));
      return comment;
    });

    return threadDetail;
  }
}

module.exports = getThreadUseCase;
