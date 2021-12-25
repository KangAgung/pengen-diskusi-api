const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  it('should be an instance of ThreadRepository', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {});

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should create new thread and return added thread correctly', async () => {
        // arrange

        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        });

        const fakeIdGenerator = (id = '123') => id;

        const newThread = new NewThread({
          title: 'a thread',
          body: 'content from thread',
          owner: 'user-123',
        });

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(
          pool, fakeIdGenerator,
        );

        // action
        const addedThread = await threadRepositoryPostgres.addThread(newThread);

        // assert
        const threads = await ThreadsTableTestHelper.findThreadById(addedThread.id);
        expect(addedThread).toStrictEqual(new AddedThread({
          id: `thread-${fakeIdGenerator()}`,
          title: 'a thread',
          owner: 'user-123',
        }));
        expect(threads).toBeDefined();
      });
    });

    describe('getThreadById function', () => {
      it('should return NotFoundError when thread is not found', async () => {
        // arrange
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

        // action & assert
        await expect(threadRepositoryPostgres.getThreadById('thread-x'))
          .rejects
          .toThrowError(NotFoundError);
      });

      it('should return thread when thread is found', async () => {
        // arrange
        const newThread = {
          id: 'thread-123', title: 'a thread', body: 'content from thread', owner: 'user-123', date: new Date('2021-08-08T07:59:48.766Z'),
        };
        const expectedThread = {
          id: 'thread-123',
          title: 'a thread',
          date: new Date('2021-08-08T07:59:48.766Z'),
          username: 'Dicoding',
          body: 'content from thread',
        };
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({ id: 'user-123', username: expectedThread.username });
        await ThreadsTableTestHelper.addThread(newThread);

        // action
        const acquiredThread = await threadRepositoryPostgres.getThreadById('thread-123');

        // assert
        expect(acquiredThread).toStrictEqual(expectedThread);
      });
    });
  });
});
