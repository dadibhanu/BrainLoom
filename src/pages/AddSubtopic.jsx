import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAuth } from "../lib/auth";

export default function AddSubtopic() {
  const { parentId } = useParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userAuth = getAuth();
    setAuth(userAuth);
    if (!userAuth || userAuth.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(title.toLowerCase().replace(/\s+/g, "-"));
  }, [title]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !slug || !description) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    const payload = {
      parent_id: Number(parentId),
      title,
      slug,
      description,
      order_no: 0, // Auto-increment on backend
    };

    try {
      setLoading(true);
      const res = await fetch("http://31.97.202.194/api/topics/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setMessage("✅ Subtopic created successfully!");
      setTimeout(() => navigate(`/topic/${slug}`), 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
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
            <BackButton onClick={() => navigate(-1)}>
              <span>←</span> Back
            </BackButton>
            <PageIcon>📝</PageIcon>
            <PageTitle>Create New Subtopic</PageTitle>
            <PageDescription>
              Add a new learning path or module to expand your course content. 
              Fill in the details below to create an engaging subtopic for your students.
            </PageDescription>
          </BrandSection>

          <InfoSection>
            <InfoCard>
              <InfoIcon>💡</InfoIcon>
              <InfoText>
                <InfoTitle>Auto-Generated Slug</InfoTitle>
                <InfoDesc>The URL slug is automatically created from your title</InfoDesc>
              </InfoText>
            </InfoCard>
            <InfoCard>
              <InfoIcon>🎯</InfoIcon>
              <InfoText>
                <InfoTitle>Clear Descriptions</InfoTitle>
                <InfoDesc>Write engaging descriptions to attract learners</InfoDesc>
              </InfoText>
            </InfoCard>
            <InfoCard>
              <InfoIcon>⚡</InfoIcon>
              <InfoText>
                <InfoTitle>Instant Publishing</InfoTitle>
                <InfoDesc>Your subtopic goes live immediately after creation</InfoDesc>
              </InfoText>
            </InfoCard>
          </InfoSection>
        </LeftSection>

        <RightSection>
          <Card>
            <CardHeader>
              <CardBadge>Admin Panel</CardBadge>
              <CardTitle>Subtopic Details</CardTitle>
            </CardHeader>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>
                  Title
                  <Required>*</Required>
                </Label>
                <InputWrapper>
                  <InputIcon>✏️</InputIcon>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Advanced Python Concepts"
                    required
                  />
                </InputWrapper>
                <InputHint>Give your subtopic a clear, descriptive title</InputHint>
              </InputGroup>

              <InputGroup>
                <Label>
                  URL Slug
                  <Required>*</Required>
                </Label>
                <InputWrapper>
                  <InputIcon>🔗</InputIcon>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated-from-title"
                    required
                  />
                </InputWrapper>
                <InputHint>Used in the URL path (auto-generated from title)</InputHint>
              </InputGroup>

              <InputGroup>
                <Label>
                  Description
                  <Required>*</Required>
                </Label>
                <TextareaWrapper>
                  <TextareaIcon>📄</TextareaIcon>
                  <Textarea
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn in this subtopic..."
                    required
                  />
                </TextareaWrapper>
                <InputHint>Provide a compelling overview of the subtopic content</InputHint>
              </InputGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <ButtonSpinner />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Subtopic</span>
                    <ButtonIcon>✓</ButtonIcon>
                  </>
                )}
              </SubmitButton>
            </Form>

            {message && (
              <Message $isSuccess={message.includes("✅")}>
                {message}
              </Message>
            )}
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
  padding: 60px 20px;
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
  gap: 48px;

  @media (max-width: 968px) {
    gap: 32px;
  }
`;

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
  font-size: 0.95rem;

  span {
    font-size: 1.2rem;
  }

  &:hover {
    background: ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(0, 102, 255, 0.1)"
        : "rgba(0, 102, 255, 0.08)"};
    border-color: ${({ theme }) => theme.brand};
    transform: translateX(-4px);
  }
`;

const PageIcon = styled.div`
  font-size: 4rem;
  margin-top: 12px;

  @media (max-width: 968px) {
    font-size: 3rem;
  }
`;

const PageTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  margin: 0;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #ffffff 0%, #a8c7fa 100%)"
      : "linear-gradient(135deg, #0066ff 0%, #8b5cf6 100%)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
`;

const PageDescription = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.muted};
  margin: 0;
  line-height: 1.7;
  max-width: 520px;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(255, 255, 255, 0.03)"
      : "rgba(255, 255, 255, 0.8)"};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(0, 102, 255, 0.05)"
        : "rgba(0, 102, 255, 0.03)"};
    border-color: ${({ theme }) => theme.brand};
    transform: translateX(4px);
  }
`;

const InfoIcon = styled.div`
  font-size: 1.8rem;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const InfoDesc = styled.p`
  margin: 0;
  font-size: 0.9rem;
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
  max-width: 540px;
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
      ? "rgba(139, 92, 246, 0.15)"
      : "rgba(139, 92, 246, 0.1)"};
  color: #8b5cf6;
  margin-bottom: 16px;
`;

const CardTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Required = styled.span`
  color: #f43f5e;
  font-size: 1rem;
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

const TextareaWrapper = styled.div`
  position: relative;
`;

const TextareaIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 14px;
  font-size: 1.2rem;
  opacity: 0.6;
`;

const Textarea = styled.textarea`
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
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
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

const InputHint = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.muted};
  margin-top: -2px;
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

const ButtonIcon = styled.span`
  font-size: 1.3rem;
  transition: transform 0.3s ease;

  ${SubmitButton}:hover:not(:disabled) & {
    transform: scale(1.2);
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