import { pool } from '../db.js'
import bcrypt from 'bcryptjs'

export async function handleCrud(table, req, res) {
  const { action, id, ...data } = req.body
  
  try {
    if (action === 'delete' || req.method === 'DELETE') {
      await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id || req.params.id])
      return res.json({ success: true })
    }
    
    if (action === 'update' || req.method === 'PUT') {
      const updates = Object.keys(data).map(k => `${k} = ?`).join(', ')
      await pool.query(`UPDATE ${table} SET ${updates} WHERE id = ?`, [...Object.values(data), id])
      return res.json({ success: true })
    }
    
    // Create
    const newId = id || Date.now().toString()
    const cols = Object.keys(data).join(', ')
    const vals = Object.values(data)
    const placeholders = vals.map(() => '?').join(', ')
    await pool.query(`INSERT INTO ${table} (id, ${cols}) VALUES (?, ${placeholders})`, [newId, ...vals])
    res.json({ id: newId, ...data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
