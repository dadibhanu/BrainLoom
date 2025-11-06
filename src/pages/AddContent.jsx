import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getAuth } from "../lib/auth";

const BLOCK_TYPES = [
  { id: "heading", label: "Heading", icon: "📝", color: "#0066ff" },
  { id: "paragraph", label: "Paragraph", icon: "📄", color: "#8b5cf6" },
  { id: "example", label: "Example", icon: "💡", color: "#10b981" },
  { id: "note", label: "Note", icon: "📌", color: "#f59e0b" },
  { id: "code", label: "Code Block", icon: "💻", color: "#ef4444" },
  { id: "image", label: "Image", icon: "🖼️", color: "#06b6d4" },
  { id: "carousel", label: "Image Carousel", icon: "🎠", color: "#ec4899" },
];

export default function AddOrUpdateContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.replace(/^\/topic\//, "").replace(/\/(add|update)-content$/, "");
  const isUpdateMode = location.pathname.includes("update-content");

  const [auth, setAuth] = useState(null);
  const [topic, setTopic] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Authenticate admin
  useEffect(() => {
    const userAuth = getAuth();
    setAuth(userAuth);
    if (!userAuth || userAuth.role !== "admin") navigate("/login");
  }, [navigate]);

  // Fetch topic & existing content (if update mode)
  useEffect(() => {
    if (!slug) return;

    fetch(`http://31.97.202.194/api/topics/slug/${slug}/`)
      .then((res) => res.json())
      .then((data) => {
        setTopic(data.topic);
        if (isUpdateMode && data.blocks?.length > 0) {
          const loadedBlocks = data.blocks.map((block) => ({
            id: block.id,
            type: block.components?.[0]?.type || "paragraph",
            order: block.block_order || 0,
            content: block.components?.[0]?.content || {},
          }));
          setBlocks(loadedBlocks);
        }
      })
      .catch((err) => console.error("❌ Fetch error:", err));
  }, [slug, isUpdateMode]);

  // Create default block content
  const getDefaultBlockData = (type) => {
    switch (type) {
      case "heading": return { text: "", level: "h2" };
      case "paragraph": return { text: "" };
      case "example": return { title: "", content: "" };
      case "note": return { title: "", content: "", type: "info" };
      case "code": return { language: "python", code: "" };
      case "image": return { url: "", alt: "", caption: "" };
      case "carousel": return { images: ["", "", ""] };
      default: return {};
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      order: blocks.length,
      content: getDefaultBlockData(type),
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, content) =>
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));

  const deleteBlock = (id) => setBlocks(blocks.filter((b) => b.id !== id));

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(blocks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setBlocks(reordered.map((b, i) => ({ ...b, order: i })));
  };

  // 🧠 Save (POST or PUT)
  const handleSubmit = async () => {
    if (blocks.length === 0) return setMessage("⚠️ Add at least one block!");

    const payload = {
      components: blocks.map((block) => ({
        type: block.type,
        order_no: block.order,
        content: block.content,
      })),
      metadata: { tags: ["Python"], estimated_read_time: "10 Min" },
    };

    try {
      setLoading(true);
      let url = "";
      let method = "";

      if (isUpdateMode) {
        const blockId = blocks[0]?.id;
        url = `http://localhost:5005/api/content-blocks/${blockId}`;
        method = "PUT";
      } else {
        url = `http://31.97.202.194/api/topics/slug/${slug}/content`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(isUpdateMode ? "✅ Content updated!" : "✅ Content added!");
        setTimeout(() => navigate(`/topic/${slug}`), 1200);
      } else throw new Error(data.message || "Save failed");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <BackgroundGlow />
      <BackgroundGlowSecondary />

      <Container>
        {/* LEFT SIDEBAR */}
        <LeftSidebar>
          <SidebarHeader>
            <BackButton onClick={() => navigate(`/topic/${slug}`)}>← Back</BackButton>
            <SidebarIcon>{isUpdateMode ? "✏️" : "🧩"}</SidebarIcon>
            <SidebarTitle>{isUpdateMode ? "Update Content" : "Add Content"}</SidebarTitle>
            <SidebarDescription>
              {isUpdateMode
                ? "Modify existing content and save changes."
                : "Click a block type below to add."}
            </SidebarDescription>
          </SidebarHeader>

          {!isUpdateMode && (
            <BlockTypesList>
              {BLOCK_TYPES.map((block) => (
                <BlockTypeCard key={block.id} $color={block.color} onClick={() => addBlock(block.id)}>
                  <BlockTypeIcon>{block.icon}</BlockTypeIcon>
                  <BlockTypeLabel>{block.label}</BlockTypeLabel>
                </BlockTypeCard>
              ))}
            </BlockTypesList>
          )}

          <SaveSection>
            <BlockCount>
              {blocks.length} Block{blocks.length !== 1 ? "s" : ""}
            </BlockCount>
            <SaveButton onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <ButtonSpinner />{" "}
                  <span>{isUpdateMode ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <>{isUpdateMode ? "💾 Update Content" : "💾 Save Content"}</>
              )}
            </SaveButton>
          </SaveSection>
        </LeftSidebar>

        {/* MAIN CONTENT */}
        <MainContent>
          <TopBar>
            <TopicInfo>
              <TopicBadge>{isUpdateMode ? "Editing Existing" : "New Content"}</TopicBadge>
              <TopicTitle>{topic?.title || "Loading..."}</TopicTitle>
              <TopicSlug>/{slug}</TopicSlug>
            </TopicInfo>
          </TopBar>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="content">
              {(provided, snapshot) => (
                <ContentCanvas
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  $isDraggingOver={snapshot.isDraggingOver}
                >
                  {blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id.toString()} index={index}>
                      {(prov, snap) => (
                        <BlockCard
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          $isDragging={snap.isDragging}
                        >
                          <BlockHeader {...prov.dragHandleProps}>
                            <BlockHeaderLeft>
                              <DragIndicator>⋮⋮</DragIndicator>
                              <BlockTypeInfo>
                                <BlockIcon>
                                  {BLOCK_TYPES.find((t) => t.id === block.type)?.icon}
                                </BlockIcon>
                                <BlockTypeName>
                                  {BLOCK_TYPES.find((t) => t.id === block.type)?.label}
                                </BlockTypeName>
                              </BlockTypeInfo>
                            </BlockHeaderLeft>
                            {!isUpdateMode && (
                              <DeleteButton onClick={() => deleteBlock(block.id)}>🗑️</DeleteButton>
                            )}
                          </BlockHeader>
                          <BlockContent>{renderBlockEditor(block, updateBlock)}</BlockContent>
                        </BlockCard>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ContentCanvas>
              )}
            </Droppable>
          </DragDropContext>

          {message && (
            <Message $isSuccess={message.includes("✅")}>{message}</Message>
          )}
        </MainContent>
      </Container>
    </Wrapper>
  );
}

/* 🧩 Render Block Editor Fields */
function renderBlockEditor(block, updateBlock) {
  const { id, type, content } = block;
  switch (type) {
    case "heading":
      return (
        <EditorGroup>
          <EditorLabel>Heading Text</EditorLabel>
          <Input
            value={content.text || ""}
            onChange={(e) => updateBlock(id, { ...content, text: e.target.value })}
          />
        </EditorGroup>
      );
    case "paragraph":
      return (
        <EditorGroup>
          <EditorLabel>Paragraph</EditorLabel>
          <Textarea
            value={content.text || ""}
            onChange={(e) => updateBlock(id, { ...content, text: e.target.value })}
            rows="4"
          />
        </EditorGroup>
      );
    case "code":
      return (
        <EditorGroup>
          <EditorLabel>Code</EditorLabel>
          <CodeTextarea
            value={content.code || ""}
            onChange={(e) => updateBlock(id, { ...content, code: e.target.value })}
            rows="6"
          />
        </EditorGroup>
      );
    default:
      return <p>🧱 Unsupported block type ({type})</p>;
  }
}

/* -------------------- Styled Components -------------------- */

const Wrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #0a1628 0%, #0c1528 100%)"
      : "linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)"};
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
  background: radial-gradient(circle, rgba(42,132,246,0.12) 0%, transparent 70%);
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
  background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%);
  bottom: -150px;
  left: -150px;
  border-radius: 50%;
  filter: blur(100px);
  animation: float 12s ease-in-out infinite;
  animation-delay: 2s;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  height: 100vh;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    grid-template-columns: 300px 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeftSidebar = styled.aside`
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(180deg, #0f1b2d 0%, #0a1323 100%)"
      : "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)"};
  border-right: 1px solid ${({ theme }) => theme.border};
  padding: 32px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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
      theme.name === "dark" ? "rgba(0, 102, 255, 0.1)" : "rgba(0, 102, 255, 0.08)"};
    border-color: ${({ theme }) => theme.brand};
    transform: translateX(-4px);
  }
`;

const SidebarIcon = styled.div`
  font-size: 3rem;
  margin-top: 8px;
`;

const SidebarTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #ffffff 0%, #a8c7fa 100%)"
      : "linear-gradient(135deg, #0066ff 0%, #8b5cf6 100%)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SidebarDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.muted};
  margin: 0;
  line-height: 1.6;
`;

const BlockTypesList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
`;

const BlockTypeCard = styled.button`
  background: ${({ theme }) => theme.card};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${({ theme }) => theme.text};

  &:hover {
    border-color: ${({ $color }) => $color};
    background: ${({ $color }) => `${$color}15`};
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${({ $color }) => `${$color}30`};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const BlockTypeIcon = styled.div`
  font-size: 2rem;
`;

const BlockTypeLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
`;

const SaveSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const BlockCount = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.muted};
  font-weight: 600;
`;

const SaveButton = styled.button`
  padding: 14px 20px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const MainContent = styled.main`
  overflow-y: auto;
  padding: 40px 60px 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 1024px) {
    padding: 32px 40px 60px;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TopicInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopicBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ theme }) =>
    theme.name === "dark" ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.1)"};
  color: #8b5cf6;
  width: fit-content;
`;

const TopicTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const TopicSlug = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.muted};
  font-family: monospace;
`;

const EmptyCanvas = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #fafbff 100%)"};
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 24px;
  padding: 60px 40px;
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  opacity: 0.4;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.text};
`;

const EmptyDescription = styled.p`
  color: ${({ theme }) => theme.muted};
  font-size: 1.05rem;
  margin: 0;
  max-width: 500px;
  text-align: center;
  line-height: 1.6;
`;

const ContentCanvas = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: ${({ $isDraggingOver }) => ($isDraggingOver ? "20px" : "0")};
  background: ${({ $isDraggingOver, theme }) =>
    $isDraggingOver
      ? theme.name === "dark"
        ? "rgba(0, 102, 255, 0.05)"
        : "rgba(0, 102, 255, 0.03)"
      : "transparent"};
  border-radius: ${({ $isDraggingOver }) => ($isDraggingOver ? "16px" : "0")};
  transition: all 0.3s ease;
  min-height: 200px;
`;

const BlockCard = styled.div`
  background: ${({ theme, $isDragging }) =>
    $isDragging
      ? theme.name === "dark"
        ? "rgba(0, 102, 255, 0.15)"
        : "rgba(0, 102, 255, 0.1)"
      : theme.name === "dark"
      ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"};
  border: 1px solid ${({ theme, $isDragging }) =>
    $isDragging ? theme.brand : theme.border};
  border-radius: 20px;
  padding: 0;
  transition: all 0.3s ease;
  box-shadow: ${({ $isDragging, theme }) =>
    $isDragging
      ? theme.name === "dark"
        ? "0 12px 40px rgba(0, 0, 0, 0.5)"
        : "0 12px 40px rgba(0, 102, 255, 0.2)"
      : theme.name === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.05)"};
  transform: ${({ $isDragging }) => ($isDragging ? "rotate(2deg) scale(1.02)" : "none")};

  &:hover {
    border-color: ${({ theme }) => theme.brand};
    box-shadow: ${({ theme }) =>
      theme.name === "dark"
        ? "0 8px 32px rgba(0, 0, 0, 0.4)"
        : "0 8px 32px rgba(0, 102, 255, 0.12)"};
  }
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const BlockHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DragIndicator = styled.div`
  font-size: 1rem;
  opacity: 0.4;
  transition: opacity 0.3s ease;

  ${BlockHeader}:hover & {
    opacity: 0.7;
  }
`;

const BlockTypeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BlockIcon = styled.span`
  font-size: 1.3rem;
`;

const BlockTypeName = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.3s ease;
  padding: 6px 10px;
  border-radius: 8px;

  &:hover {
    opacity: 1;
    background: rgba(244, 63, 94, 0.1);
    transform: scale(1.1);
  }
`;

const BlockContent = styled.div`
  padding: 24px;
`;

const EditorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EditorLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border};
  background: ${({ theme }) =>
    theme.name === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff"};
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
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

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border};
  background: ${({ theme }) =>
    theme.name === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff"};
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  transition: all 0.3s ease;
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.brand};
    box-shadow: 0 0 0 3px ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(0, 102, 255, 0.15)"
        : "rgba(0, 102, 255, 0.1)"};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border};
  background: ${({ theme }) =>
    theme.name === "dark" ? "rgba(255, 255, 255, 0.03)" : "#ffffff"};
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
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

const CodeTextarea = styled(Textarea)`
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ImagePreview = styled.div`
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) =>
    theme.name === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)"};

  img {
    width: 100%;
    height: auto;
    display: block;
    max-height: 300px;
    object-fit: contain;
  }
`;

const PreviewLabel = styled.div`
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.muted};
  background: ${({ theme }) =>
    theme.name === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"};
`;

const CarouselImageInput = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const InputWithLabel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.muted};
`;

const RemoveButton = styled.button`
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #f43f5e;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 1rem;

  &:hover {
    background: rgba(244, 63, 94, 0.2);
    transform: scale(1.05);
  }
`;

const AddImageButton = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  border: 2px dashed ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.brand};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:hover {
    border-color: ${({ theme }) => theme.brand};
    background: ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(0, 102, 255, 0.05)"
        : "rgba(0, 102, 255, 0.03)"};
  }
`;

const Message = styled.div`
  padding: 16px 24px;
  border-radius: 14px;
  text-align: center;
  font-weight: 600;
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