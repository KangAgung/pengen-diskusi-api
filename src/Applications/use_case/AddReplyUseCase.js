const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, useCaseParam, useCaseAuth) {
    const { id } = useCaseAuth;

    await this._verifyCommentAvailability(useCaseParam);
    const newReply = new NewReply(useCasePayload);
    return this._replyRepository.addReply(newReply, id, useCaseParam.commentId);
  }

  async _verifyCommentAvailability({ threadId, commentId }) {
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.findCommentById(commentId);
  }
}

module.exports = AddReplyUseCase;
