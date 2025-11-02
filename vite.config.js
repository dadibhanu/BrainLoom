import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
plugins: [react()],
server: {
proxy: {
// Optional: if the API has CORS issues during dev, uncomment the next lines
// '/api': {
// target: 'http://31.97.202.194',
// changeOrigin: true,
// }
}
}
})