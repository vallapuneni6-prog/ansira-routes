import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()
const TABLE = 'table_name' // Change this

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${TABLE}`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const id = Date.now().toString()
  try {
    const cols = Object.keys(req.body).join(', ')
    const vals = Object.values(req.body)
    const placeholders = vals.map(() => '?').join(', ')
    await pool.query(`INSERT INTO ${TABLE} (id, ${cols}) VALUES (?, ${placeholders})`, [id, ...vals])
    res.json({ id, ...req.body })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const updates = Object.entries(req.body).map(([k, v]) => `${k} = ?`).join(', ')
    const vals = Object.values(req.body)
    await pool.query(`UPDATE ${TABLE} SET ${updates} WHERE id = ?`, [...vals, id])
    res.json({ id, ...req.body })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM ${TABLE} WHERE id = ?`, [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
