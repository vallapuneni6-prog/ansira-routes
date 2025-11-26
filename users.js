import { Router } from 'express'
import { pool } from '../db.js'
import bcrypt from 'bcryptjs'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { action, id, username, password, role, outlet_id } = req.body
  
  if (action === 'delete') {
    try {
      await pool.query('DELETE FROM users WHERE id = ?', [id])
      return res.json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
  
  const newId = id || Date.now().toString()
  try {
    const hash = password ? await bcrypt.hash(password, 10) : 'temp'
    await pool.query('INSERT INTO users (id, username, password_hash, role, outlet_id) VALUES (?, ?, ?, ?, ?)', 
      [newId, username, hash, role, outlet_id])
    res.json({ id: newId, username, role, outlet_id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { username, password, role, outlet_id } = req.body
  try {
    let query = 'UPDATE users SET '
    const params = []
    if (username) { query += 'username = ?, '; params.push(username) }
    if (password) { const hash = await bcrypt.hash(password, 10); query += 'password_hash = ?, '; params.push(hash) }
    if (role) { query += 'role = ?, '; params.push(role) }
    if (outlet_id !== undefined) { query += 'outlet_id = ?, '; params.push(outlet_id) }
    query = query.slice(0, -2) + ' WHERE id = ?'
    params.push(id)
    await pool.query(query, params)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
