const User = require('../models/User');
const SecurityEvent = require('../models/SecurityEvent');

// Generate token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department
    });

    // Log security event
    await SecurityEvent.create({
      type: 'user_created',
      severity: 'info',
      description: `User ${name} (${email}) registered`,
      source: {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      target: {
        resource: 'User',
        id: user._id
      }
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Log failed login attempt
      await SecurityEvent.create({
        type: 'login_failed',
        severity: 'medium',
        description: `Failed login attempt for email: ${email}`,
        source: {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        target: {
          resource: 'User',
          id: user._id
        }
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Log successful login
    await SecurityEvent.create({
      type: 'login_success',
      severity: 'info',
      description: `User ${user.name} logged in successfully`,
      source: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user._id
      },
      target: {
        resource: 'User',
        id: user._id
      }
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};