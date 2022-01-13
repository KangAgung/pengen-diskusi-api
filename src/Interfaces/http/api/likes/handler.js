const PutLikeUseCase = require('../../../../Applications/use_case/PutLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const putLikeUseCase = this._container.getInstance(PutLikeUseCase.name);
    await putLikeUseCase.execute(request.params, request.auth.credentials);
    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
