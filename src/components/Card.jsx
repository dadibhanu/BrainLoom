import styled from "styled-components";

const CardWrap = styled.article`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 150ms ease, box-shadow 150ms ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const Desc = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.muted};
  font-size: 14px;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.muted};
  font-size: 12px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, ${({ theme }) => theme.brand} 0%, #0b63d8 100%);
`;

export default function Card({ title, description, created_at, order_no }) {
  const dateStr = created_at ? new Date(created_at).toLocaleDateString() : "";
  return (
    <CardWrap>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <div>
          <Title>{title}</Title>
          <Desc>{description || "No description provided."}</Desc>
        </div>
        <Badge>{String(order_no ?? 0)}</Badge>
      </div>
      <Meta>
        <span>{dateStr}</span>
        <button
          style={{
            color: "inherit",
            fontWeight: 600,
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          Learn more →
        </button>
      </Meta>
    </CardWrap>
  );
}
