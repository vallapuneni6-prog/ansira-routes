import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { applyCors } from './utils.js'
import loginRouter from './routes/login-vps.js'
import usersRouter from './routes/users.js'
import outletsRouter from './routes/outlets.js'
import servicesRouter from './routes/services.js'
import customersRouter from './routes/customers.js'
import vouchersRouter from './routes/vouchers.js'
import packagesRouter from './routes/packages.js'
import invoicesRouter from './routes/invoices.js'
import staffRouter from './routes/staff.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const envPath = path.join(__dirname, '.env')
const envProdPath = path.join(__dirname, '.env.production')
const envLocalPath = path.join(__dirname, '.env.local')

// Load environment variables in order of priority
const dotenv = await import('dotenv')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else if (fs.existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath })
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
}

app.use((req, res, next) => applyCors(req, res, next))
app.use(express.json())

const distDir = path.join(__dirname, 'dist')

// Serve patched bundle to remove Partner voucher at source
app.get('/assets/index-DouW72DT.js', (req, res) => {
  const bundlePath = path.join(distDir, 'assets', 'index-DouW72DT.js')
  if (!fs.existsSync(bundlePath)) return res.status(404).end()
  let code = fs.readFileSync(bundlePath, 'utf8')
  code = code.replace('onClick:()=>ye(da.PARTNER)', 'onClick:()=>null')
  code = code.replace(
    'className:"w-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to hover:opacity-90 transition-colors text-white font-bold py-3 text-base rounded-xl shadow-md flex flex-col items-center justify-center"',
    'className:"hidden"'
  )
  code = code.replace('y.fillText("",60,75)', 'y.fillText("Naturals",60,75)')
  code = code.replace('y.fillText("VOUCHER PORTAL",60,95)', 'y.fillText("",60,95)')
  const injection = ';(function(){var _orig=Date.prototype.toLocaleDateString;Date.prototype.toLocaleDateString=function(){var d=this;try{var dd=("0"+d.getDate()).slice(-2);var mm=("0"+(d.getMonth()+1)).slice(-2);var yyyy=d.getFullYear();return dd+"/"+mm+"/"+yyyy;}catch(e){return _orig.apply(this,arguments)}}})();'
  res.set('Content-Type', 'application/javascript')
  res.set('Cache-Control', 'no-store')
  return res.send(code + injection)
})

// Serve static assets

if (fs.existsSync(distDir)) {
  app.use(
    express.static(distDir, {
      etag: false,
      lastModified: false,
      maxAge: 0,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store')
        } else {
          res.setHeader('Cache-Control', 'no-cache')
        }
      },
    })
  )
}

app.use('/api/login.php', loginRouter)
app.use('/api/users.php', usersRouter)
app.use('/api/outlets.php', outletsRouter)
app.use('/api/services.php', servicesRouter)
app.use('/api/customers.php', customersRouter)
app.use('/api/vouchers.php', vouchersRouter)
app.use('/api/packages.php', packagesRouter)
app.use('/api/invoices.php', invoicesRouter)
app.use('/api/staff.php', staffRouter)

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  const indexPath = path.join(distDir, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.set('Cache-Control', 'no-store')
    return res.sendFile(indexPath)
  }
  return res.status(404).json({ error: 'Not Found' })
})

const port = process.env.PORT ? Number(process.env.PORT) : 8000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
