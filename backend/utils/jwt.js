import jwt from 'jsonwebtoken';

// Generate access token
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '2h',
  });
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Send token response
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Remove sensitive data
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', accessToken, cookieOptions)
    .json({
      success: true,
      message,
      data: {
        user,
        accessToken,
      },
    });
};
