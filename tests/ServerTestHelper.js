/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken({ id = 'user-123', username = 'dicoding' }) {
    await UsersTableTestHelper.addUser({ id, username });

    const accessToken = Jwt.token.generate(
      { username, id },
      process.env.ACCESS_TOKEN_KEY,
    );

    const refreshToken = Jwt.token.generate(
      { username, id },
      process.env.REFRESH_TOKEN_KEY,
    );

    await AuthenticationsTableTestHelper.addToken(refreshToken);

    return accessToken;
  },
};

module.exports = ServerTestHelper;
