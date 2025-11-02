import styled from "styled-components";

const Wrap = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 20px 0;
  color: ${({ theme }) => theme.muted};
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

export default function Footer() {
  return (
    <Wrap>
      <div className="container">
        <Row>
          <p>© {new Date().getFullYear()} Brainloom. Learn brilliantly.</p>
          <nav style={{ display: "flex", gap: 12 }}>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Contact</a>
          </nav>
        </Row>
      </div>
    </Wrap>
  );
}
