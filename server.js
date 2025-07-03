require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Initialize database tables
const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        userType ENUM('user', 'lawyer', 'mokhtar') NOT NULL,
        businessName VARCHAR(100),
        licenseNumber VARCHAR(100),
        barAssociation VARCHAR(100),
        mokhtarOffice VARCHAR(100),
        isApproved BOOLEAN DEFAULT FALSE,
        subscriptionPlan ENUM('free', 'starter', 'pro') DEFAULT 'free',
        subscriptionStatus ENUM('active', 'canceled', 'expired') DEFAULT 'active',
        subscriptionStartDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        subscriptionEndDate DATETIME,
        autoRenew BOOLEAN DEFAULT FALSE,
        isVerified BOOLEAN DEFAULT FALSE,
        verificationToken VARCHAR(255),
        verificationExpires DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create documents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        isTemplate BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create document_tags table for many-to-many relationship
    await connection.query(`
      CREATE TABLE IF NOT EXISTS document_tags (
        documentId INT NOT NULL,
        tag VARCHAR(50) NOT NULL,
        PRIMARY KEY (documentId, tag),
        FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
      )
    `);

    // Create user_documents table for file uploads
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        documentUrl VARCHAR(255) NOT NULL,
        documentType VARCHAR(50) NOT NULL,
        uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Initialize database on startup
initDb();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helper function to get a database connection
const getConnection = async () => {
  return await pool.getConnection();
};

// Routes

// Register User
app.post('/api/register', async (req, res) => {
  let connection;
  try {
    const {
  firstName, lastName, email, password, userType, businessName,
  licenseNumber, barAssociation, mokhtarOffice,
  phone, specialties, languages, pricePerSession, experience
} = req.body;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Check if user already exists
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert new user
      const [result] = await connection.query(
  `INSERT INTO users 
   (firstName, lastName, email, password, userType, businessName, licenseNumber, barAssociation, mokhtarOffice, isApproved,
    phone, specialties, languages, pricePerSession, experience)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    firstName,
    lastName,
    email,
    hashedPassword,
    userType,
    businessName || null,
    (userType === 'lawyer' ? licenseNumber : null),
    (userType === 'lawyer' ? barAssociation : null),
    (userType === 'mokhtar' ? mokhtarOffice : null),
    false, // isApproved
userType === 'lawyer' ? phone : null,
userType === 'lawyer' ? specialties : null,
userType === 'lawyer' ? languages : null,
userType === 'lawyer' ? pricePerSession : null,
userType === 'lawyer' ? experience : null
  ]
);

      const userId = result.insertId;

      // Generate JWT
      const token = jwt.sign(
        { userId, email, userType },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Commit transaction
      await connection.commit();

      res.status(201).json({ 
        message: 'User registered successfully', 
        token,
        user: {
          id: userId,
          email,
          userType,
          isApproved: false
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Find user
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Get user subscription info
    const subscription = {
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      autoRenew: user.autoRenew
    };

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isApproved: user.isApproved,
        subscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Upload documents for verification (lawyers/mokhtars)
app.post('/api/upload-documents', authenticateToken, upload.array('documents', 5), async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Check if user exists and is lawyer/mokhtar
    const [users] = await connection.query('SELECT id, userType FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    if (user.userType === 'user') {
      return res.status(403).json({ message: 'Only lawyers and mokhtars can upload verification documents' });
    }

    // Save document references to database
    const files = req.files.map(file => ({
      userId,
      documentUrl: `/uploads/${file.filename}`,
      documentType: 'verification'
    }));
    
    // Insert all documents
    for (const file of files) {
      await connection.query(
        'INSERT INTO user_documents (userId, documentUrl, documentType) VALUES (?, ?, ?)',
        [file.userId, file.documentUrl, file.documentType]
      );
    }

    res.status(200).json({ 
      message: 'Documents uploaded successfully', 
      documents: files.map(f => f.documentUrl) 
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Error uploading documents', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Get user profile
    const [users] = await connection.query(
      'SELECT id, firstName, lastName, email, userType, businessName, isApproved, ' +
      'subscriptionPlan, subscriptionStatus, subscriptionStartDate, subscriptionEndDate, autoRenew ' +
      'FROM users WHERE id = ?', 
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get user documents
    const [documents] = await connection.query(
      'SELECT id, documentUrl, documentType, uploadedAt FROM user_documents WHERE userId = ?',
      [userId]
    );
    
    // Format response
    const profile = {
      ...user,
      documents: documents || [],
      subscription: {
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        autoRenew: user.autoRenew
      }
    };
    
    // Remove subscription fields from root
    delete profile.subscriptionPlan;
    delete profile.subscriptionStatus;
    delete profile.subscriptionStartDate;
    delete profile.subscriptionEndDate;
    delete profile.autoRenew;
    
    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update subscription
app.post('/api/subscription', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { plan, isYearly } = req.body;
    const userId = req.user.userId;
    
    if (!['free', 'starter', 'pro'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }
    
    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    // Get connection from pool
    connection = await getConnection();
    
    // Update subscription
    await connection.query(
      `UPDATE users 
       SET subscriptionPlan = ?, 
           subscriptionStatus = 'active',
           subscriptionStartDate = ?,
           subscriptionEndDate = ?,
           autoRenew = ?,
           updatedAt = NOW()
       WHERE id = ?`,
      [plan, startDate, endDate, true, userId]
    );
    
    // Get updated user
    const [users] = await connection.query(
      'SELECT subscriptionPlan, subscriptionStatus, subscriptionStartDate, subscriptionEndDate, autoRenew ' +
      'FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    const subscription = {
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      autoRenew: user.autoRenew
    };
    
    res.json({ 
      message: 'Subscription updated successfully', 
      subscription 
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ message: 'Error updating subscription', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Document CRUD operations

// Create document
app.post('/api/documents', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { title, content, type, tags = [] } = req.body;
    const userId = req.user.userId;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Insert document
      const [result] = await connection.query(
        `INSERT INTO documents (userId, title, content, type, isTemplate)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, title, content, type, false]
      );
      
      const documentId = result.insertId;
      
      // Insert tags if any
      if (tags && tags.length > 0) {
        const tagValues = tags.map(tag => [documentId, tag]);
        await connection.query(
          'INSERT INTO document_tags (documentId, tag) VALUES ?',
          [tagValues]
        );
      }
      
      // Commit transaction
      await connection.commit();
      
      // Get the created document
      const [documents] = await connection.query(
        'SELECT * FROM documents WHERE id = ?',
        [documentId]
      );
      
      if (documents.length === 0) {
        throw new Error('Failed to retrieve created document');
      }
      
      const document = documents[0];
      
      // Get document tags
      const [tagRows] = await connection.query(
        'SELECT tag FROM document_tags WHERE documentId = ?',
        [documentId]
      );
      
      document.tags = tagRows.map(row => row.tag);
      
      res.status(201).json({ 
        message: 'Document created successfully', 
        document 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Document creation error:', error);
    res.status(500).json({ message: 'Error creating document', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Get user's documents
app.get('/api/documents', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Get documents with tags
    const [documents] = await connection.query(
      `SELECT d.*, GROUP_CONCAT(dt.tag) as tagList 
       FROM documents d
       LEFT JOIN document_tags dt ON d.id = dt.documentId
       WHERE d.userId = ?
       GROUP BY d.id
       ORDER BY d.updatedAt DESC`,
      [userId]
    );
    
    // Format tags as array
    const formattedDocs = documents.map(doc => ({
      ...doc,
      tags: doc.tagList ? doc.tagList.split(',') : []
    }));
    
    res.json(formattedDocs);
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update document
app.put('/api/documents/:id', authenticateToken, async (req, res) => {
  let connection;
  try {
    const documentId = req.params.id;
    const { title, content, tags = [] } = req.body;
    const userId = req.user.userId;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Check if document exists and belongs to user
      const [documents] = await connection.query(
        'SELECT id FROM documents WHERE id = ? AND userId = ?',
        [documentId, userId]
      );
      
      if (documents.length === 0) {
        return res.status(404).json({ message: 'Document not found or unauthorized' });
      }
      
      // Update document
      await connection.query(
        `UPDATE documents 
         SET title = ?, content = ?, updatedAt = NOW()
         WHERE id = ?`,
        [title, content, documentId]
      );
      
      // Update tags
      // First, delete existing tags
      await connection.query(
        'DELETE FROM document_tags WHERE documentId = ?',
        [documentId]
      );
      
      // Then insert new tags if any
      if (tags.length > 0) {
        const tagValues = tags.map(tag => [documentId, tag]);
        await connection.query(
          'INSERT INTO document_tags (documentId, tag) VALUES ?',
          [tagValues]
        );
      }
      
      // Commit transaction
      await connection.commit();
      
      // Get the updated document with tags
      const [updatedDocs] = await connection.query(
        `SELECT d.*, GROUP_CONCAT(dt.tag) as tagList 
         FROM documents d
         LEFT JOIN document_tags dt ON d.id = dt.documentId
         WHERE d.id = ?
         GROUP BY d.id`,
        [documentId]
      );
      
      if (updatedDocs.length === 0) {
        throw new Error('Failed to retrieve updated document');
      }
      
      const updatedDoc = {
        ...updatedDocs[0],
        tags: updatedDocs[0].tagList ? updatedDocs[0].tagList.split(',') : []
      };
      
      res.json({ 
        message: 'Document updated successfully', 
        document: updatedDoc 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Document update error:', error);
    res.status(500).json({ message: 'Error updating document', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Delete document
app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  let connection;
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;
    
    // Get connection from pool
    connection = await getConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Check if document exists and belongs to user
      const [documents] = await connection.query(
        'SELECT id FROM documents WHERE id = ? AND userId = ?',
        [documentId, userId]
      );
      
      if (documents.length === 0) {
        return res.status(404).json({ message: 'Document not found or unauthorized' });
      }
      
      // Delete document (cascading delete will handle document_tags)
      await connection.query('DELETE FROM documents WHERE id = ?', [documentId]);
      
      // Commit transaction
      await connection.commit();
      
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { firstName, lastName, businessName } = req.body;

    connection = await getConnection();

    await connection.query(
      `UPDATE users SET firstName = ?, lastName = ?, businessName = ?, updatedAt = NOW() WHERE id = ?`,
      [firstName, lastName, businessName, userId]
    );

    // Return updated profile
    const [users] = await connection.query(
      'SELECT id, firstName, lastName, email, userType, businessName FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/lawyers', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [lawyers] = await connection.query(
      `SELECT id, firstName, lastName, email, businessName, userType, createdAt,
              phone, specialties, languages, pricePerSession, experience
       FROM users 
       WHERE userType = 'lawyer'`
    );
    res.json(lawyers);
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({ message: 'Error fetching lawyers', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/mokhtars', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [mokhtars] = await connection.query(
      `SELECT id, firstName, lastName, email, businessName, userType, mokhtarOffice, createdAt 
       FROM users 
       WHERE userType = 'mokhtar'`
    );
    res.json(mokhtars);
  } catch (error) {
    console.error('Error fetching mokhtars:', error);
    res.status(500).json({ message: 'Error fetching mokhtars', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing purposes
