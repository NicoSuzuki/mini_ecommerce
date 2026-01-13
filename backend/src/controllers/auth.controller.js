const pool = require("../../db/pool")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Basic validation
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
      return res.status(400).json({ error: 'Last name must be at least 2 characters' });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check existing user
    const [existing] = await pool.query(
      'SELECT id_user FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role
    const role = 'customer';

    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [firstName.trim(), lastName.trim(), normalizedEmail, hashedPassword, role]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        id_user: result.insertId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        role
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await pool.query(
        `SELECT id_user, first_name, last_name, email, password_hash, role, is_active
        FROM users
        WHERE email = ?
        LIMIT 1`,
        [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    if (user.is_active === 0) return res.status(403).json({ error: 'Account disabled' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { sub: user.id_user, role: user.role };

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not configured' });
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id_user: user.id_user,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error on login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};