const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'a thread',
      body: 'dolor sit amet',
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 1234,
      title: {},
      body: 'dolor sit amet',
      date: '2021',
      username: 'dicoding',
      comments: 'lorem ipsum',
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'a thread',
      body: 'dolor sit amet',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const {
      id, title, body, date, username, comments,
    } = new DetailThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toEqual(payload.comments);
  });
});
