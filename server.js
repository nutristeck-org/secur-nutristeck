const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const DATA_DIR = './data';

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Data storage helpers
async function readData(filename) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeData(filename, data) {
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// API Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName,
      phoneNumber,
      dateOfBirth,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      taxId,
      employmentStatus,
      annualIncome,
      securityQuestion,
      securityAnswer,
      pin
    } = req.body;
    
    // Validate required fields
    const requiredFields = {
      username, email, password, firstName, lastName,
      phoneNumber, dateOfBirth, streetAddress, city, state,
      zipCode, country, taxId, employmentStatus, annualIncome,
      securityQuestion, securityAnswer, pin
    };
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value && value !== 0) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    
    // Validate PIN format (must be 4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }
    
    // Validate annual income is a number
    const income = parseInt(annualIncome);
    if (isNaN(income) || income < 0) {
      return res.status(400).json({ error: 'Annual income must be a valid positive number' });
    }

    const users = await readData('users.json');
    
    // Check if user already exists
    if (users[username] || Object.values(users).find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password and PIN
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);
    
    // Create user
    const user = {
      id: Date.now().toString(),
      username,
      email,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      taxId,
      employmentStatus,
      annualIncome: income,
      securityQuestion,
      securityAnswer, // Note: In production, this should also be hashed
      password: hashedPassword,
      pin: hashedPin,
      isAdmin: false,
      isActive: false, // Requires admin approval
      createdAt: new Date().toISOString(),
      accounts: []
    };
    
    users[username] = user;
    await writeData('users.json', users);
    
    // Don't return sensitive fields
    const { password: _, pin: __, securityAnswer: ___, ...userResponse } = user;
    void _; void __; void ___; // Mark as intentionally unused
    res.status(201).json({ user: userResponse, message: 'Registration successful. Awaiting admin approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const users = await readData('users.json');
    const user = users[username];
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account not yet approved by admin' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Don't return sensitive fields
    const { password: _, pin: __, securityAnswer: ___, ...userResponse } = user;
    void _; void __; void ___; // Mark as intentionally unused
    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const users = await readData('users.json');
    const user = users[req.user.username];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't return sensitive fields
    const { password: _, pin: __, securityAnswer: ___, ...userResponse } = user;
    void _; void __; void ___; // Mark as intentionally unused
    res.json(userResponse);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Admin routes - Get all users for approval
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await readData('users.json');
    const userList = Object.values(users).map(user => {
      const { password: _, pin: __, securityAnswer: ___, ...userResponse } = user;
      void _; void __; void ___; // Mark as intentionally unused
      return userResponse;
    });
    res.json(userList);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Admin - Approve user
app.post('/api/admin/users/:username/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    const users = await readData('users.json');
    
    if (!users[username]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[username].isActive = true;
    users[username].approvedAt = new Date().toISOString();
    users[username].approvedBy = req.user.username;
    
    await writeData('users.json', users);
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('User approval error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Initialize admin user if none exists
async function initializeAdmin() {
  try {
    await ensureDataDir();
    const users = await readData('users.json');
    
    // Check if admin already exists
    const hasAdmin = Object.values(users).some(user => user.isAdmin);
    
    if (!hasAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@nutristeck.com',
        firstName: 'System',
        lastName: 'Administrator',
        phoneNumber: '000-000-0000',
        dateOfBirth: '1990-01-01',
        streetAddress: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '00000',
        country: 'Admin Country',
        taxId: '000-00-0000',
        employmentStatus: 'employed',
        annualIncome: 0,
        securityQuestion: 'pet',
        securityAnswer: 'admin',
        password: hashedPassword,
        pin: await bcrypt.hash('0000', 10),
        isAdmin: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        accounts: []
      };
      
      users.admin = adminUser;
      await writeData('users.json', users);
      console.log(`Admin user created with username: admin, password: ${adminPassword}`);
    }
  } catch (error) {
    console.error('Admin initialization error:', error);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await initializeAdmin();
  app.listen(PORT, () => {
    console.log(`NutriSteck Secure Banking API server running on port ${PORT}`);
    console.log(`Admin login - Username: admin, Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  });
}

startServer().catch(console.error);