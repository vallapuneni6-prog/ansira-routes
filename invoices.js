import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM invoices')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { action, id, ...data } = req.body
  const newId = id || Date.now().toString()
  
  if (action === 'delete') {
    try {
      await pool.query('DELETE FROM invoices WHERE id = ?', [id])
      return res.json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
  
  try {
    const cols = Object.keys(data).join(', ')
    const vals = Object.values(data)
    const placeholders = vals.map(() => '?').join(', ')
    await pool.query(`INSERT INTO invoices (id, ${cols}) VALUES (?, ${placeholders})`, [newId, ...vals])
    res.json({ id: newId, ...data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const data = req.body
  try {
    const updates = Object.keys(data).map(k => `${k} = ?`).join(', ')
    await pool.query(`UPDATE invoices SET ${updates} WHERE id = ?`, [...Object.values(data), id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
