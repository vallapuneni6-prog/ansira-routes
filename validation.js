const validators = {
  user: {
    email: (val) => {
      if (!val) return { valid: false, error: 'Email is required' }
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regex.test(val)) return { valid: false, error: 'Invalid email format' }
      return { valid: true }
    },
    password: (val) => {
      if (!val) return { valid: false, error: 'Password is required' }
      if (val.length < 6) return { valid: false, error: 'Password must be at least 6 characters' }
      return { valid: true }
    },
    name: (val) => {
      if (!val || typeof val !== 'string') return { valid: false, error: 'Name is required' }
      if (val.trim().length < 2) return { valid: false, error: 'Name must be at least 2 characters' }
      return { valid: true }
    },
  },
  outlet: {
    name: (val) => {
      if (!val || typeof val !== 'string') return { valid: false, error: 'Outlet name is required' }
      if (val.trim().length < 2) return { valid: false, error: 'Outlet name must be at least 2 characters' }
      return { valid: true }
    },
    phone: (val) => {
      if (!val) return { valid: false, error: 'Phone is required' }
      const clean = val.toString().replace(/\D/g, '')
      if (clean.length !== 10) return { valid: false, error: 'Phone must be 10 digits' }
      return { valid: true }
    },
    gstin: (val) => {
      if (!val) return { valid: false, error: 'GSTIN is required' }
      const regex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{3}$/
      if (!regex.test(val.toUpperCase())) return { valid: false, error: 'Invalid GSTIN format' }
      return { valid: true }
    },
    email: (val) => {
      if (!val) return { valid: false, error: 'Email is required' }
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regex.test(val)) return { valid: false, error: 'Invalid email' }
      return { valid: true }
    },
    address: (val) => {
      if (!val) return { valid: false, error: 'Address is required' }
      return { valid: true }
    },
  },
  customer: {
    name: (val) => {
      if (!val) return { valid: false, error: 'Name required' }
      return { valid: true }
    },
    mobile: (val) => {
      if (!val) return { valid: false, error: 'Mobile required' }
      const clean = val.toString().replace(/\D/g, '')
      if (clean.length !== 10) return { valid: false, error: 'Mobile must be 10 digits' }
      return { valid: true }
    },
    email: (val) => {
      if (!val) return { valid: false, error: 'Email required' }
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regex.test(val)) return { valid: false, error: 'Invalid email' }
      return { valid: true }
    },
    address: (val) => {
      if (!val) return { valid: false, error: 'Address required' }
      return { valid: true }
    },
  },
  package: {
    name: (val) => { if (!val) return { valid: false, error: 'Name required' }; return { valid: true } },
    code: (val) => { if (!val) return { valid: false, error: 'Code required' }; return { valid: true } },
    description: (val) => { if (!val) return { valid: false, error: 'Description required' }; return { valid: true } },
    price: (val) => { if (!val || parseFloat(val) < 0) return { valid: false, error: 'Valid price required' }; return { valid: true } },
    duration: (val) => { if (!val || parseInt(val) <= 0) return { valid: false, error: 'Valid duration required' }; return { valid: true } },
  },
  voucher: {
    packageId: (val) => { if (!val) return { valid: false, error: 'Package required' }; return { valid: true } },
    customerId: (val) => { if (!val) return { valid: false, error: 'Customer required' }; return { valid: true } },
    purchaseDate: (val) => { if (!val) return { valid: false, error: 'Purchase date required' }; return { valid: true } },
    expiryDate: (val) => { if (!val) return { valid: false, error: 'Expiry date required' }; return { valid: true } },
  },
  service: {
    name: (val) => { if (!val) return { valid: false, error: 'Name required' }; return { valid: true } },
    description: (val) => { if (!val) return { valid: false, error: 'Description required' }; return { valid: true } },
  },
  staff: {
    name: (val) => { if (!val) return { valid: false, error: 'Name required' }; return { valid: true } },
    phone: (val) => { if (!val) return { valid: false, error: 'Phone required' }; const clean = val.toString().replace(/\D/g, ''); if (clean.length !== 10) return { valid: false, error: 'Phone must be 10 digits' }; return { valid: true } },
    position: (val) => { if (!val) return { valid: false, error: 'Position required' }; return { valid: true } },
  },
  invoice: {
    customerId: (val) => { if (!val) return { valid: false, error: 'Customer required' }; return { valid: true } },
    total: (val) => { if (!val || parseFloat(val) <= 0) return { valid: false, error: 'Valid total required' }; return { valid: true } },
  },
}

function validateField(resource, field, value) {
  const validator = validators[resource]?.[field]
  if (!validator) return { valid: true }
  return validator(value)
}

function validateFields(resource, data, requiredFields = []) {
  const errors = {}
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) errors[field] = `${field} is required`
  }
  const resourceValidators = validators[resource] || {}
  for (const [field, value] of Object.entries(data)) {
    if (field in resourceValidators) {
      const result = validateField(resource, field, value)
      if (!result.valid) errors[field] = result.error
    }
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

function toSnakeCase(obj) {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)
    result[snakeKey] = value
  }
  return result
}

function toCamelCase(obj) {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (m, l) => l.toUpperCase())
    result[camelKey] = value
  }
  return result
}

class ValidationError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.name = 'ValidationError'
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message)
    this.statusCode = 409
    this.name = 'ConflictError'
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.statusCode = 404
    this.name = 'NotFoundError'
  }
}

class BusinessRuleError extends Error {
  constructor(message) {
    super(message)
    this.statusCode = 422
    this.name = 'BusinessRuleError'
  }
}

function sendError(res, error) {
  if (error instanceof ValidationError) return res.status(error.statusCode).json({ success: false, message: error.message, errors: error.errors })
  if (error instanceof ConflictError) return res.status(409).json({ success: false, message: error.message })
  if (error instanceof NotFoundError) return res.status(404).json({ success: false, message: error.message })
  if (error instanceof BusinessRuleError) return res.status(422).json({ success: false, message: error.message })
  return res.status(500).json({ success: false, message: error.message || 'Server error' })
}

function sendSuccess(res, data = null, statusCode = 200, message = null) {
  const response = { success: true }
  if (message) response.message = message
  if (data !== null) response.data = data
  return res.status(statusCode).json(response)
}

async function checkDuplicates(db, table, field, value, excludeId = null) {
  let query = `SELECT id FROM ${table} WHERE ${field} = ?`
  const params = [value]
  if (excludeId) { query += ' AND id != ?'; params.push(excludeId) }
  const results = await db.query(query, params)
  if (results.length > 0) throw new ConflictError(`${field} already exists`)
  return true
}

async function canDeleteOutlet(db, id) {
  const users = await db.query('SELECT id FROM users WHERE outlet_id = ?', [id])
  if (users.length > 0) throw new BusinessRuleError('Cannot delete: has users')
  const pkgs = await db.query('SELECT id FROM package_templates WHERE outlet_id = ?', [id])
  if (pkgs.length > 0) throw new BusinessRuleError('Cannot delete: has packages')
  return true
}

async function canDeleteCustomer(db, id) {
  const v = await db.query('SELECT id FROM vouchers WHERE customer_id = ?', [id])
  if (v.length > 0) throw new BusinessRuleError('Cannot delete: has vouchers')
  return true
}

async function canDeletePackage(db, id) {
  const v = await db.query('SELECT id FROM vouchers WHERE package_id = ?', [id])
  if (v.length > 0) throw new BusinessRuleError('Cannot delete: has vouchers')
  return true
}

async function canDeleteService(db, id) {
  const r = await db.query('SELECT id FROM service_records WHERE service_id = ?', [id])
  if (r.length > 0) throw new BusinessRuleError('Cannot delete: has records')
  return true
}

export { validators, validateField, validateFields, toSnakeCase, toCamelCase, ValidationError, ConflictError, NotFoundError, BusinessRuleError, sendError, sendSuccess, checkDuplicates, canDeleteOutlet, canDeleteCustomer, canDeletePackage, canDeleteService }
