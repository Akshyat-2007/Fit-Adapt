const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require('../models');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Sign up new user and initialize condition profile
async function signup(req, res) {
  try {
    const { name, email, password, condition_type, severity, notes } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existing = await models.User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await models.User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash
    });

    // Create condition profile
    const profile = await models.ConditionProfile.create({
      user_id: user.id,
      condition_type: condition_type || 'other',
      severity: severity || 'mild',
      notes: notes || ''
    });

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        conditionProfile: profile
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed. ' + err.message });
  }
}

// Log in existing user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await models.User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [{ model: models.ConditionProfile, as: 'conditionProfile' }]
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        conditionProfile: user.conditionProfile
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Login failed. ' + err.message });
  }
}

// Get logged-in user profile
async function getProfile(req, res) {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [{ model: models.ConditionProfile, as: 'conditionProfile' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({ success: true, user, profile: user.conditionProfile });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Update condition profile
async function updateProfile(req, res) {
  try {
    const { condition_type, severity, notes } = req.body;

    let profile = await models.ConditionProfile.findOne({ where: { user_id: req.user.id } });
    if (profile) {
      await profile.update({
        condition_type: condition_type || profile.condition_type,
        severity: severity || profile.severity,
        notes: notes !== undefined ? notes : profile.notes
      });
    } else {
      profile = await models.ConditionProfile.create({
        user_id: req.user.id,
        condition_type: condition_type || 'other',
        severity: severity || 'mild',
        notes: notes || ''
      });
    }

    return res.json({ success: true, conditionProfile: profile, profile });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Reset / forgot password
async function resetPassword(req, res) {
  try {
    const { email, new_password } = req.body;

    if (!email || !new_password) {
      return res.status(400).json({ success: false, error: 'Email and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const user = await models.User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await user.update({ password_hash });

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Log out user
function logout(req, res) {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully.' });
}

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  logout,
  resetPassword
};
