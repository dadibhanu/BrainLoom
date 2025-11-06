import styled from "styled-components";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRootTopics } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


export default function Home() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    order: "",
  });
  const { auth } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const parentId = null; // root topics → null or parent topic id

  useEffect(() => {
    fetchRootTopics()
      .then((data) => setTopics(data.topics || []))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIsAdmin(auth?.role === "admin" || auth?.user?.role === "admin");
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "title") {
      const slug = value.toLowerCase().trim().replace(/\s+/g, "-");
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        parentId: null,
        description: form.description,
        order: parseInt(form.order || topics.length + 1),
      };

      const res = await fetch("http://31.97.202.194/api/topics/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();

      alert("✅ Topic created successfully!");
      setTopics((prev) => [...prev, data.topic || payload]);
      setShowModal(false);
      setForm({ title: "", slug: "", description: "", order: "" });
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTopic(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`http://31.97.202.194/api/topics/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      alert("✅ Topic deleted successfully!");
      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  }

 // 🧩 Handle drag and drop reorder
const handleDragEnd = async (result) => {
  if (!result.destination) return;

  const newOrder = Array.from(topics);
  const [movedItem] = newOrder.splice(result.source.index, 1);
  newOrder.splice(result.destination.index, 0, movedItem);

  // Update frontend order numbers
  const updated = newOrder.map((t, index) => ({
    ...t,
    order_no: index,
  }));

  setTopics(updated);

  try {
    const res = await fetch(
      `http://31.97.202.194/api/topics/${parentId || ""}reorder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(
          updated.map((t) => ({ id: t.id, order_no: t.order_no }))
        ),
      }
    );
    if (!res.ok) throw new Error(`Reorder failed (${res.status})`);
    console.log("✅ Reorder applied!");
  } catch (err) {
    alert(`❌ Error applying reorder: ${err.message}`);
  }
};


  return (
    <Wrapper>
      {/* -------- Hero Section -------- */}
      <Hero>
        <HeroContent>
          <Title>Weave Knowledge into Skill.</Title>
          <SubTitle>
            Learn Python, Rust, Bash, and more — explore interactive tutorials
            and master real-world coding skills on Brainloom.
          </SubTitle>
          <HeroButtons>
            <PrimaryButton to="/explore">Explore Courses</PrimaryButton>
            <SecondaryButton to="/login">Get Started</SecondaryButton>
          </HeroButtons>
        </HeroContent>
        <HeroGlow />
        <HeroGlowSecondary />
      </Hero>

      {/* -------- Features -------- */}
      <FeatureGrid>
        {[
          {
            title: "Structured Learning",
            desc: "Follow guided tracks that take you from basics to mastery.",
            icon: "📚",
          },
          {
            title: "Dynamic Content",
            desc: "Stay updated with constantly evolving topics and exercises.",
            icon: "⚡",
          },
          {
            title: "Dark & Light Themes",
            desc: "Switch instantly for a comfortable coding experience.",
            icon: "🎨",
          },
        ].map((f) => (
          <FeatureCard key={f.title}>
            <IconWrapper>{f.icon}</IconWrapper>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </FeatureCard>
        ))}
      </FeatureGrid>

      {/* -------- Topics Section -------- */}
      <TopicsSection>
        <HeaderRow>
          <div>
            <SectionTitle>Popular Topics</SectionTitle>
            <SectionSubtitle>
              Start your learning journey with our most popular courses
            </SectionSubtitle>
          </div>
          {isAdmin && (
            <AddButton onClick={() => setShowModal(true)}>+ Create Topic</AddButton>
          )}
        </HeaderRow>

        {loading ? (
          <LoadingText>Loading topics...</LoadingText>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="topics">
              {(provided) => (
                <TopicGrid ref={provided.innerRef} {...provided.droppableProps}>
                  {topics.map((topic, index) => (
                    <Draggable
                      key={topic.id}
                      draggableId={topic.id.toString()}
                      index={index}
                      isDragDisabled={!isAdmin}
                    >
                      {(dragProvided) => (
                        <TopicCard
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          to={`/topic/${topic.slug}`}
                          title={`Open ${topic.title}`}
                        >
                          <TopicContent>
                            <h4>{topic.title}</h4>
                            <p>{topic.description || "No description available."}</p>
                          </TopicContent>

                          {isAdmin && (
                            <DeleteBtn
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteTopic(topic.id, topic.title);
                              }}
                              title="Delete topic"
                            >
                              🗑️
                            </DeleteBtn>
                          )}
                        </TopicCard>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TopicGrid>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </TopicsSection>

      {/* -------- Modal -------- */}
      {showModal && (
        <ModalOverlay>
          <ModalCard>
            <h2>Create New Topic</h2>
            <form onSubmit={handleSubmit}>
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
              <label>Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
              />
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
              <label>Order</label>
              <input
                name="order"
                type="number"
                value={form.order}
                onChange={handleChange}
              />
              <ModalButtons>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </ModalButtons>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

/* ---------------- Styled Components ---------------- */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding: 40px 80px 80px;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  box-sizing: border-box;
`;

const Hero = styled.section`
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #0a1628 0%, #1a2f4a 50%, #0f1e36 100%)"
      : "linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #faf5ff 100%)"};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 100px 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 1000px;
`;

const Title = styled.h1`
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.1;
  font-weight: 900;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #0066ff 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SubTitle = styled.p`
  color: ${({ theme }) => theme.muted};
  font-size: 1.15rem;
  line-height: 1.7;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Link)`
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  color: #fff;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
`;

const SecondaryButton = styled(Link)`
  border: 2px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  padding: 14px 28px;
  border-radius: 16px;
  text-decoration: none;
`;

// Add these styled components (e.g., after Hero, before FeatureGrid)

const HeroGlow = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "radial-gradient(circle, rgba(42,132,246,0.2) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(42,132,246,0.15) 0%, transparent 70%)"};
  top: -150px;
  right: -150px;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  animation: float1 8s ease-in-out infinite;

  @keyframes float1 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-20px, 20px); }
  }
`;

const HeroGlowSecondary = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)"};
  bottom: -100px;
  left: -100px;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  animation: float2 10s ease-in-out infinite;
  animation-delay: 2s;

  @keyframes float2 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(16px, -18px); }
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
`;

const FeatureCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 24px;
  padding: 32px 28px;
  background: ${({ theme }) => theme.card};
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 16px;
`;

const TopicsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  color: #fff;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  text-align: left;
`;

const SectionSubtitle = styled.p`
  color: ${({ theme }) => theme.muted};
`;

const TopicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 40px;
`;

const TopicCard = styled(Link)`
  position: relative; /* <-- needed for the delete button */
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 24px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
`;

const TopicContent = styled.div`
  h4 {
    margin-bottom: 8px;
  }
`;

const OrderNo = styled.div`
  margin-top: 16px;
  align-self: flex-end;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
  color: #fff;
  font-weight: 700;
`;

/* 🗑️ Small delete button */
const DeleteBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
  border: none;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  &:hover {
    background: rgba(244, 63, 94, 0.2);
    transform: translateY(-2px);
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.muted};
  font-size: 1.1rem;
  padding: 40px 0;
`;

/* Modal */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 30px;
  border-radius: 16px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.border};

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  input,
  textarea {
    border-radius: 8px;
    padding: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: transparent;
    color: ${({ theme }) => theme.text};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  button[type="button"] {
    background: ${({ theme }) => theme.card};
  }

  button[type="submit"] {
    background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
    color: white;
  }
`;
