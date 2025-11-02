import styled from 'styled-components'


const Btn = styled.button`
padding: 8px; border-radius: 12px; border: 1px solid ${({ theme }) => theme.border};
background: ${({ theme }) => theme.card};
line-height: 0; transition: transform 150ms ease, box-shadow 150ms ease;
&:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }
`


export default function ThemeToggle({ themeName, setThemeName }) {
const isDark = themeName === 'dark'
return (
<Btn aria-label="Toggle theme" onClick={() => setThemeName(isDark ? 'light' : 'dark')}>
{isDark ? '🌞' : '🌙'}
</Btn>
)
}