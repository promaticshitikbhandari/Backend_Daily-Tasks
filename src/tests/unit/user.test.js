import { jest } from '@jest/globals';


/* 1️⃣ MOCK FIRST (ESM WAY) */
jest.unstable_mockModule('../../models/userModel.js', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  }
}));

jest.unstable_mockModule('../../utils/generateAccessAndRefreshToken.utils.js', () => ({
    generateAccessTokenAndRefreshToken: jest.fn()
}));

/* 2️⃣ IMPORT AFTER MOCKING */
const { register } = await import('../../controllers/userControllers.js');
const { User } = await import('../../models/userModel.js');
const { login } = await import('../../controllers/userControllers.js');
const {generateAccessTokenAndRefreshToken} = await import('../../utils/generateAccessAndRefreshToken.utils.js');

describe('Register Controller', () => {

  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        username: "Hitik",
        fullName: "Hitik Bhandari",
        email: "hitik@test.com",
        password: "123456",
        role: "admin"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  /* 🧪 TEST 1 */
  test('should return 401 if required fields are empty', async () => {
    req.body.username = "";

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "All are Required Fields"
    });
  });

  /* 🧪 TEST 2 */
  test('should return 400 if user already exists', async () => {
    User.findOne.mockResolvedValue({ _id: 1 });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User Already Exists"
    });
  });

  /* 🧪 TEST 3 */
  test('should register new user successfully', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 1 });

    User.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue ({
          _id: 1,
          username: "Hitik",
          email: "hitik@test.com"
        })
      })

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "New User Registered SuccessFully",
      data: {
        _id: 1,
        username: "Hitik",
        email: "hitik@test.com"
      }
    });
  });
});




describe('Login Controller', () => {

        let req;
        let res;
      
        beforeEach(() => {
          req = {
            body: {
              username: 'hitik',
              email: '',
              password: '123456'
            }
          };
      
          res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis()
          };
      
          jest.clearAllMocks();
        });
      
        /* 🧪 TEST 1 */
        test('should return 400 if username/email is missing', async () => {
          req.body.username = '';
          req.body.email = '';
      
          await login(req, res);
      
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Username or Email is Required'
          });
        });
      
        /* 🧪 TEST 2 */
        test('should return 400 if password is missing', async () => {
          req.body.password = '';
      
          await login(req, res);
      
          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Password is Required'
          });
        });
      
        /* 🧪 TEST 3 */
        test('should return 404 if user not found', async () => {
          User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
          });
      
          await login(req, res);
      
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'User not Found'
          });
        });
      
        /* 🧪 TEST 4 */
        test('should return 402 if password is invalid', async () => {
          User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
              _id: 1,
              comparePassword: jest.fn().mockResolvedValue(false)
            })
          });
      
          await login(req, res);
      
          expect(res.status).toHaveBeenCalledWith(402);
          expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Invalid credentials'
          });
        });
      
        /* 🧪 TEST 5 */
        test('should login successfully and return tokens', async () => {
          User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue({
              _id: 1,
              comparePassword: jest.fn().mockResolvedValue(true)
            })
          });
      
          generateAccessTokenAndRefreshToken.mockResolvedValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token'
          });
      
          User.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: 1,
                username: 'hitik'
            })
          });
      
          await login(req, res);
      
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.cookie).toHaveBeenCalledTimes(2);
          expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'LoggedIn Successfully',
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            data: {
              _id: 1,
              username: 'hitik'
            }
          });
        });
      });

