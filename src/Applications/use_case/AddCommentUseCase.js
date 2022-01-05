const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, useCaseParam, useCaseAuth) {
    const { id } = useCaseAuth;

    await this._threadRepository.getThreadById(useCaseParam.threadId);
    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.addComment(newComment, id, useCaseParam.threadId);
  }
}

module.exports = AddCommentUseCase;
