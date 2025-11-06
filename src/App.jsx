import { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from './globalStyles'
import { lightTheme, darkTheme } from './theme'
import { storage } from './lib/storage'

import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Login from './pages/Login'
import Profile from './pages/Profile'
import TopicDetail from "./pages/TopicDetail.jsx"
import AddContent from "./pages/AddContent.jsx"
import UpdateContent from "./pages/UpdateContent";

export default function App() {
  const [themeName, setThemeName] = useState(() => storage.get('theme', 'light'))
  const theme = useMemo(() => (themeName === 'dark' ? darkTheme : lightTheme), [themeName])

  useEffect(() => {
    storage.set('theme', themeName)
  }, [themeName])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Header themeName={themeName} setThemeName={setThemeName} />
        <main className="container" style={{ padding: '24px 16px', flex: 1 }}>
         <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/explore" element={<Explore />} />
  <Route path="/login" element={<Login />} />
  <Route path="/profile" element={<Profile />} />

  {/* ✅ Put AddContent BEFORE TopicDetail and use wildcard */}
  <Route path="/topic/:slug/add-content" element={<AddContent />} />
  <Route path="/topic/:slug/update-content" element={<UpdateContent />} />
  <Route path="/topic/:parentSlug/:childSlug/add-content" element={<AddContent />} />
  <Route path="/topic/:parentSlug/:childSlug/:subChildSlug/add-content" element={<AddContent />} />

  {/* ✅ This catch-all goes last */}
  <Route path="/topic/*" element={<TopicDetail />} />
</Routes>

        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
