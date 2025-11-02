import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("12345");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, "admin");
      setMsg("✅ Login successful!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Wrapper>
      <BackgroundGlow />
      <BackgroundGlowSecondary />
      
      <Container>
        <LeftSection>
          <BrandSection>
            <Logo>🧠</Logo>
            <BrandTitle>Brainloom</BrandTitle>
            <BrandTagline>Weave Knowledge into Skill</BrandTagline>
          </BrandSection>
          
          <FeatureList>
            <Feature>
              <FeatureIcon>✨</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Interactive Learning</FeatureTitle>
                <FeatureDesc>Hands-on tutorials and real-world projects</FeatureDesc>
              </FeatureText>
            </Feature>
            <Feature>
              <FeatureIcon>🚀</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Progress Tracking</FeatureTitle>
                <FeatureDesc>Monitor your growth and achievements</FeatureDesc>
              </FeatureText>
            </Feature>
            <Feature>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureText>
                <FeatureTitle>Structured Paths</FeatureTitle>
                <FeatureDesc>Carefully designed learning roadmaps</FeatureDesc>
              </FeatureText>
            </Feature>
          </FeatureList>
        </LeftSection>

        <RightSection>
          <Card>
            <CardHeader>
              <CardBadge>Admin Access</CardBadge>
              <CardTitle>Welcome Back</CardTitle>
              <CardSubtitle>Sign in to manage your learning platform</CardSubtitle>
            </CardHeader>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>Email Address</Label>
                <InputWrapper>
                  <InputIcon>📧</InputIcon>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="admin@example.com"
                    required
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <Label>Password</Label>
                <InputWrapper>
                  <InputIcon>🔒</InputIcon>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </InputWrapper>
              </InputGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <ButtonSpinner />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ButtonArrow>→</ButtonArrow>
                  </>
                )}
              </SubmitButton>
            </Form>

            {msg && (
              <Message $isSuccess={msg.includes("✅")}>
                {msg}
              </Message>
            )}

            <CardFooter>
              <FooterText>
                Don't have an account?{" "}
                <FooterLink onClick={() => navigate("/")}>
                  Explore as guest
                </FooterLink>
              </FooterText>
            </CardFooter>
          </Card>
        </RightSection>
      </Container>
    </Wrapper>
  );
}

/* ---------- Styled Components ---------- */

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #0a1628 0%, #0c1528 50%, #0a1323 100%)"
      : "linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #faf5ff 100%)"};
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
`;

const BackgroundGlow = styled.div`
  position: absolute;
  width: 600px;
  height: 600px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "radial-gradient(circle, rgba(42,132,246,0.15) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(42,132,246,0.12) 0%, transparent 70%)"};
  top: -200px;
  right: -200px;
  border-radius: 50%;
  filter: blur(100px);
  animation: float 10s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-30px, 30px); }
  }
`;

const BackgroundGlowSecondary = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)"};
  bottom: -150px;
  left: -150px;
  border-radius: 50%;
  filter: blur(100px);
  animation: float 12s ease-in-out infinite;
  animation-delay: 2s;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1400px;
  width: 100%;
  gap: 80px;
  align-items: center;
  z-index: 1;
  padding: 0 60px;

  @media (max-width: 1200px) {
    gap: 60px;
    padding: 0 40px;
  }

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 0 20px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;

  @media (max-width: 968px) {
    gap: 40px;
    text-align: center;
  }
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Logo = styled.div`
  font-size: 4rem;
  margin-bottom: 8px;
  
  @media (max-width: 968px) {
    font-size: 3rem;
  }
`;

const BrandTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  margin: 0;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #ffffff 0%, #a8c7fa 100%)"
      : "linear-gradient(135deg, #0066ff 0%, #8b5cf6 100%)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
`;

const BrandTagline = styled.p`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.muted};
  margin: 0;
  font-weight: 500;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 968px) {
    align-items: center;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 450px;

  @media (max-width: 968px) {
    text-align: left;
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FeatureTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const FeatureDesc = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.muted};
  line-height: 1.5;
`;

const RightSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #fafbff 100%)"};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 32px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: ${({ theme }) =>
    theme.name === "dark"
      ? "0 20px 60px rgba(0, 0, 0, 0.4)"
      : "0 20px 60px rgba(0, 102, 255, 0.1)"};
  backdrop-filter: blur(10px);

  @media (max-width: 968px) {
    padding: 36px;
  }
`;

const CardHeader = styled.div`
  text-align: center;
`;

const CardBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(0, 102, 255, 0.15)"
      : "rgba(0, 102, 255, 0.1)"};
  color: ${({ theme }) => theme.brand};
  margin-bottom: 20px;
`;

const CardTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
  color: ${({ theme }) => theme.text};
`;

const CardSubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.muted};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 16px;
  font-size: 1.2rem;
  opacity: 0.6;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.border};
  background: ${({ theme }) =>
    theme.name === "dark" 
      ? "rgba(255, 255, 255, 0.03)" 
      : "#ffffff"};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.brand};
    box-shadow: 0 0 0 3px ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(0, 102, 255, 0.15)"
        : "rgba(0, 102, 255, 0.1)"};
  }

  &::placeholder {
    color: ${({ theme }) => theme.muted};
    opacity: 0.6;
  }
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 16px 24px;
  border-radius: 16px;
  border: none;
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.brand} 0%, #0052cc 100%)`};
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 102, 255, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonArrow = styled.span`
  font-size: 1.3rem;
  transition: transform 0.3s ease;

  ${SubmitButton}:hover & {
    transform: translateX(4px);
  }
`;

const ButtonSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Message = styled.p`
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 14px 20px;
  border-radius: 14px;
  margin: -8px 0 0;
  background: ${({ $isSuccess, theme }) =>
    $isSuccess
      ? theme.name === "dark"
        ? "rgba(16, 185, 129, 0.15)"
        : "rgba(16, 185, 129, 0.1)"
      : theme.name === "dark"
      ? "rgba(244, 63, 94, 0.15)"
      : "rgba(244, 63, 94, 0.1)"};
  color: ${({ $isSuccess }) => ($isSuccess ? "#10b981" : "#f43f5e")};
  border: 1px solid ${({ $isSuccess }) =>
    $isSuccess ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"};
`;

const CardFooter = styled.div`
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const FooterText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.muted};
  margin: 0;
`;

const FooterLink = styled.span`
  color: ${({ theme }) => theme.brand};
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;