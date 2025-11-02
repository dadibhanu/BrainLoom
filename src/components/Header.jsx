import styled from "styled-components";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const Wrap = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(11,18,32,0.72)"
      : "rgba(255,255,255,0.72)"};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background 0.3s ease;
`;

const Row = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
`;

const Badge = styled.span`
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.brand} 0%,
    #0b63d8 100%
  );
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: none;
  gap: 6px;
  margin-left: 12px;
  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavBtn = styled(NavLink)`
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  transition: all 0.2s ease;

  &.active {
    background: ${({ theme }) =>
      theme.name === "dark" ? "#162036" : "#f2f6ff"};
    border-color: ${({ theme }) => theme.border};
  }

  &:hover {
    background: ${({ theme }) =>
      theme.name === "dark" ? "#121a2d" : "#f7faff"};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Ghost = styled(Link)`
  display: none;
  @media (min-width: 480px) {
    display: inline-flex;
  }
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  }
`;

const LogoutBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(244, 63, 94, 0.1)"
      : "rgba(244, 63, 94, 0.08)"};
  color: #f43f5e;
  border: 1px solid rgba(244, 63, 94, 0.2);
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(244, 63, 94, 0.2)"
        : "rgba(244, 63, 94, 0.15)"};
  }
`;

export default function Header({ themeName, setThemeName }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/"); // go home immediately
  };

  return (
    <Wrap>
      <div className="container">
        <Row>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Brand to="/">
              <Badge>B</Badge> Brainloom
            </Brand>
            <Nav>
              <NavBtn to="/" end>
                Home
              </NavBtn>
              <NavBtn to="/explore">Explore</NavBtn>
            </Nav>
          </div>

          <Actions>
            {/* 🔁 Reacts instantly on login/logout */}
            {!auth ? (
              <Ghost
                to="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
              >
                Login
              </Ghost>
            ) : (
              <>
                <Ghost
                  to="/profile"
                  aria-current={
                    pathname === "/profile" ? "page" : undefined
                  }
                >
                  👤 {auth.user?.name || auth.user?.email || "Admin"}
                </Ghost>
                <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
              </>
            )}
            <ThemeToggle
              themeName={themeName}
              setThemeName={setThemeName}
            />
          </Actions>
        </Row>
      </div>
    </Wrap>
  );
}
