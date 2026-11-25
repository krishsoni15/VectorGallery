import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

async function main() {
  const localIp = process.env.HOST_IP || 'localhost'
  const port = process.env.PORT || '3000'
  const installUrl = `http://${localIp}:${port}/install`
  const directApkUrl = `http://${localIp}:${port}/vectorgallery.apk`

  console.log(`\n======================================================`)
  console.log(`📱 VectorGallery Mobile Installation Link:`)
  console.log(`👉 ${installUrl}`)
  console.log(`======================================================\n`)

  // 1. Generate Terminal QR code (small inverted blocks for clean scanning on dark terminal)
  const terminalQR = await QRCode.toString(installUrl, {
    type: 'terminal',
    small: true
  })
  console.log(terminalQR)

  // 2. Generate PNG in public folder
  const publicDir = path.resolve(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  await QRCode.toFile(path.join(publicDir, 'qr.png'), installUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  })

  // 3. Generate SVG in public folder
  const svgString = await QRCode.toString(installUrl, {
    type: 'svg',
    margin: 2
  })
  fs.writeFileSync(path.join(publicDir, 'qr.svg'), svgString)

  console.log(`\n✅ Saved QR codes to public/qr.png and public/qr.svg`)
}

main().catch(console.error)

