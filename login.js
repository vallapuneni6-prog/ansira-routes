import { Router } from 'express'
import { pool } from '../db.js'
import bcrypt from 'bcryptjs'

const router = Router()

router.post('/', async (req, res) => {
  const { username, password } = req.body
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' })
    
    const user = users[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' })
    
    res.json({ id: user.id, username: user.username, role: user.role })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
