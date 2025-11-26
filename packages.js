import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const type = req.query.type
    let table
    if (type === 'templates') table = 'package_templates'
    else if (type === 'customerPackages') table = 'customer_packages'
    else if (type === 'serviceRecords') table = 'service_records'
    else table = 'package_templates'
    
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { action, id, name, packageValue, serviceValue } = req.body
  const newId = id || Date.now().toString()
  
  if (action === 'delete') {
    try {
      await pool.query('DELETE FROM package_templates WHERE id = ?', [id])
      return res.json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
  
  try {
    await pool.query('INSERT INTO package_templates (id, name, package_value, service_value) VALUES (?, ?, ?, ?)', 
      [newId, name, packageValue, serviceValue])
    res.json({ id: newId, name, packageValue, serviceValue })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { name, packageValue, serviceValue } = req.body
  try {
    await pool.query('UPDATE package_templates SET name = ?, package_value = ?, service_value = ? WHERE id = ?', 
      [name, packageValue, serviceValue, id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
