import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation  } from "react-router-dom";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getAuth } from "../lib/auth";

export default function TopicDetail() {
  const navigate = useNavigate();
  const location = useLocation();
const slug = location.pathname
  .replace(/^\/topic\//, "") // remove "/topic/"
  .replace(/\/add-content$/, "");
  const [topic, setTopic] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);

  useEffect(() => {
    const userAuth = getAuth();
    setAuth(userAuth);
    setIsAdmin(userAuth?.role === "admin" || userAuth?.user?.role === "admin");
  }, []);

  // ✅ Fetch topic + children
  useEffect(() => {
    if (!slug) return;
    
    const controller = new AbortController();

    fetch(`http://31.97.202.194/api/topics/slug/${slug}/`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((data) => {
  const fullTopic = {
    ...data.topic,
    blocks: data.blocks || []
  };
  setTopic(fullTopic);
  setChildren(data.children || []);
  setError("");
})
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  // ✅ Add Subtopic
  async function handleAddSubtopic() {
    const title = prompt("Enter subtopic title:");
    if (!title) return;
    const subSlug = title.toLowerCase().replace(/\s+/g, "-");
    const payload = {
      parent_id: topic.id,
      title,
      slug: subSlug,
      description: `Subtopic of ${topic.title}`,
      order_no: children.length,
    };

    try {
      const res = await fetch("http://31.97.202.194/api/topics/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      alert("✅ Subtopic added successfully!");
navigate(`/topic/${topic.full_path}/${subSlug}`);
    } catch (err) {
      alert(`❌ Failed to add subtopic: ${err.message}`);
    }
  }

  // ✅ Delete Topic or Subtopic
  async function handleDeleteTopic(id, title, isRoot = false) {
    const confirmMsg = isRoot
      ? `Delete topic "${title}" and all its subtopics?`
      : `Delete subtopic "${title}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`http://31.97.202.194/api/topics/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      if (!res.ok) throw new Error(`Failed (${res.status})`);

      alert("✅ Deleted successfully!");
      if (isRoot) {
        navigate("/"); // go back to home after deleting root topic
      } else {
        setChildren((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  }

  // ✅ Drag & Drop Reorder
async function handleDragEnd(result) {
  if (!result.destination) return;

  const newOrder = Array.from(children);
  const [moved] = newOrder.splice(result.source.index, 1);
  newOrder.splice(result.destination.index, 0, moved);

  const reordered = newOrder.map((item, index) => ({
    ...item,
    order_no: index,
  }));

  setChildren(reordered);
  setOrderChanged(true);
}



async function saveNewOrder() {
  if (!topic?.id) {
    alert("Parent topic ID is missing — reload and try again.");
    return;
  }

  const payload = children.map((c, i) => ({
    id: c.id,
    order_no: i,
  }));

  try {
    const res = await fetch(
      `http://31.97.202.194/api/topics/${topic.id}/reorder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error(`Reorder failed (${res.status})`);

    const data = await res.json();
    console.log("✅ Reorder applied:", data);
    alert("✅ Order updated successfully!");
    setOrderChanged(false);
  } catch (err) {
    console.error("❌ Reorder failed:", err);
    alert(`❌ Failed to reorder: ${err.message}`);
  }
}



  // ✅ Breadcrumb Builder
  const renderBreadcrumbs = () => {
  const parts = slug.split("/");
  return (
    <Breadcrumb>
      <Link to="/">🏠 Home</Link>
      {parts.map((part, i) => {
        const subPath = parts.slice(0, i + 1).join("/");
        return (
          <span key={i}>
            {" / "}
            <Link to={`/topic/${subPath}`}>{part}</Link>
          </span>
        );
      })}
    </Breadcrumb>
  );
};


  // ✅ Loading / Error
  if (loading)
    return (
      <Centered>
        <p>Loading topic...</p>
      </Centered>
    );

  if (error)
    return (
      <Centered>
        <p>⚠️ Error: {error}</p>
      </Centered>
    );

  if (!topic) return null;

  return (
    <Layout>
      {/* Sidebar */}
     <Sidebar>
  <SidebarHeader>
    <SidebarTitle>{topic.title}</SidebarTitle>
    <SidebarBadge>{children.length} topics</SidebarBadge>
  </SidebarHeader>

  {/* ✅ Only Admin can reorder (Drag & Drop) */}
  {isAdmin ? (
    <DragDropContext onDragEnd={handleDragEnd}>
     <Droppable droppableId="subtopics">
  {(provided, snapshot) => (
    <NavList
      ref={provided.innerRef}
      {...provided.droppableProps}
      $isDraggingOver={snapshot.isDraggingOver}
    >
            {children.map((c, index) => (
              <Draggable
                key={c.id.toString()}
                draggableId={c.id.toString()}
                index={index}
              >
               {(prov, snap) => (
  <NavItem
    ref={prov.innerRef}
    {...prov.draggableProps}
    {...prov.dragHandleProps}
    to={`/topic/${c.full_path}`}
    $isDragging={snap.isDragging}
    style={prov.draggableProps.style}
  >
                    <NavItemContent>
                      <DragHandle>⋮⋮</DragHandle>
                      <NavItemText>{c.title}</NavItemText>
                    </NavItemContent>

                    {/* 🗑️ Delete Subtopic (Admin Only) */}
                    <DeleteBtn
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteTopic(c.id, c.title);
                      }}
                    >
                      🗑️
                    </DeleteBtn>
                  </NavItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </NavList>
        )}
      </Droppable>
    </DragDropContext>
  ) : (
    // ✅ Normal users: No drag/drop
    <NavList>
      {children.map((c) => (
        <NavItem key={c.id} to={`/topic/${c.full_path}`}>
          <NavItemContent>
            <NavItemText>{c.title}</NavItemText>
          </NavItemContent>
        </NavItem>
      ))}
    </NavList>
  )}

  {/* ✅ Admin Controls */}
  {isAdmin && (
  <AdminBox>
    <AdminButton onClick={handleAddSubtopic} $primary>
      <span>+</span> Add Subtopic
    </AdminButton>
    
  </AdminBox>
)}

</Sidebar>


      {/* Main */}
      <Main>
        {renderBreadcrumbs()}

        <HeaderSection>
          <HeaderBadge>Learning Path</HeaderBadge>
          <h1>{topic.title}</h1>
          <HeaderDescription>{topic.description}</HeaderDescription>

          {/* Delete Root Topic (only admin) */}
          {/* --- Admin Controls: Delete, Add, and Update Content --- */}
{isAdmin && (
  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
    {/* 🗑️ Delete Root Topic */}
    <DeleteRootBtn
      onClick={() => handleDeleteTopic(topic.id, topic.title, true)}
    >
      🗑️ Delete Topic
    </DeleteRootBtn>

    {/* 📝 Add Content Button */}
    <AddContentBtn onClick={() => navigate(`/topic/${slug}/add-content`)}>
      📝 Add Content
    </AddContentBtn>

    {/* ✏️ Update Content Button */}
    <UpdateContentBtn onClick={() => navigate(`/topic/${slug}/update-content`)}>
  ✏️ Update Content
</UpdateContentBtn>


    {/* 💾 Save Reorder (if applicable) */}
    {orderChanged && (
      <AdminButton onClick={saveNewOrder} $save>
        <span>💾</span> Save Order
      </AdminButton>
    )}
  </div>
)}


        </HeaderSection>

      <ContentBox>
  {topic?.blocks && topic.blocks.length > 0 ? (
    topic.blocks.map((block, blockIndex) => (
      <div key={block.id || blockIndex}>
        {block.components && block.components.length > 0 ? (
          block.components.map((comp, i) => {
            const content = comp.content || {};

            switch (comp.type) {
              case "heading":
                return <h2 key={i}>{content.text}</h2>;

              case "paragraph":
                return <p key={i}>{content.text}</p>;

              case "example":
                return (
                  <div key={i}>
                    <h4>💡 {content.title}</h4>
                    <p>{content.content}</p>
                  </div>
                );

              case "note":
                return (
                  <div
                    key={i}
                    style={{
                      borderLeft: "4px solid orange",
                      padding: "10px",
                      background: "rgba(255, 165, 0, 0.1)",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>{content.title}</strong>
                    <p>{content.content}</p>
                  </div>
                );

              case "code":
                return (
                  <pre
                    key={i}
                    style={{
                      background: "#0d1117",
                      color: "#fff",
                      padding: "12px",
                      borderRadius: "8px",
                      overflowX: "auto",
                    }}
                  >
                    <code>{content.code}</code>
                  </pre>
                );

              case "image":
                return (
                  <div key={i}>
                    <img
                      src={content.url}
                      alt={content.alt || ""}
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                    {content.caption && <p>{content.caption}</p>}
                  </div>
                );

              case "carousel":
                return (
                  <div key={i}>
                    <h4>🖼️ Carousel</h4>
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                      {content.images?.map((img, j) => (
                        <img
                          key={j}
                          src={img}
                          alt={`slide-${j}`}
                          style={{
                            width: "150px",
                            height: "auto",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );

              default:
                return (
                  <div key={i}>
                    <p>⚠️ Unknown component type: {comp.type}</p>
                    <pre>{JSON.stringify(comp.content, null, 2)}</pre>
                  </div>
                );
            }
          })
        ) : (
          <p>No components found in this block.</p>
        )}
      </div>
    ))
  ) : (
    <EmptyState>
      <EmptyIcon>📚</EmptyIcon>
      <EmptyTitle>No content available yet</EmptyTitle>
      <EmptyDescription>
        This topic is being prepared. Check back soon for updates!
      </EmptyDescription>
    </EmptyState>
  )}
</ContentBox>


        <NavButtons>
          <NavButton onClick={() => navigate(-1)} $secondary>
            <span>←</span> Previous
          </NavButton>
          <NavButton onClick={() => alert("Next topic feature coming soon!")}>
            Next <span>→</span>
          </NavButton>
        </NavButtons>
      </Main>
    </Layout>
  );
}
/* ---------------- Styled Components ---------------- */

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100vh;
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);

  @media (max-width: 1024px) {
    grid-template-columns: 280px 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const Sidebar = styled.aside`
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(180deg, #0f1b2d 0%, #0a1323 100%)"
      : "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)"};
  border-right: 1px solid ${({ theme }) => theme.border};
  padding: 32px 24px;
  overflow-y: auto;
  box-shadow: ${({ theme }) =>
    theme.name === "dark"
      ? "2px 0 20px rgba(0, 0, 0, 0.3)"
      : "2px 0 20px rgba(0, 0, 0, 0.05)"};

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding: 24px 20px;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
`;

const SidebarHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const SidebarTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, #ffffff 0%, #a8c7fa 100%)"
      : "linear-gradient(135deg, #0066ff 0%, #8b5cf6 100%)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SidebarBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ theme }) =>
    theme.name === "dark" 
      ? "rgba(0, 102, 255, 0.15)" 
      : "rgba(0, 102, 255, 0.1)"};
  color: ${({ theme }) => theme.brand};
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: ${({ $isDraggingOver }) => ($isDraggingOver ? "8px" : "0")};
  background: ${({ theme, $isDraggingOver }) =>
    $isDraggingOver
      ? theme.name === "dark"
        ? "rgba(0, 102, 255, 0.05)"
        : "rgba(0, 102, 255, 0.03)"
      : "transparent"};
  border-radius: ${({ $isDraggingOver }) => ($isDraggingOver ? "12px" : "0")};
  transition: all 0.3s ease;
`;

const DragHandle = styled.span`
  opacity: 0.3;
  font-size: 1rem;
  line-height: 1;
  transition: opacity 0.3s ease;
`;

const NavItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const NavItemText = styled.span`
  flex: 1;
`;

const NavItemArrow = styled.span`
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(-4px);
`;

const NavItem = styled(Link)`
  text-decoration: none;
  padding: 14px 16px;
  border-radius: 14px;
  color: ${({ theme }) => theme.text};
  background: ${({ theme, $isDragging }) =>
    $isDragging
      ? theme.name === "dark"
        ? "rgba(0, 102, 255, 0.2)"
        : "rgba(0, 102, 255, 0.15)"
      : theme.card};
  border: 1px solid ${({ theme, $isDragging }) =>
    $isDragging ? theme.brand : theme.border};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  box-shadow: ${({ $isDragging, theme }) =>
    $isDragging
      ? theme.name === "dark"
        ? "0 8px 24px rgba(0, 0, 0, 0.4)"
        : "0 8px 24px rgba(0, 102, 255, 0.2)"
      : "none"};
  transform: ${({ $isDragging }) => ($isDragging ? "rotate(2deg)" : "none")};

  &:hover {
    background: ${({ theme }) =>
      theme.name === "dark"
        ? "rgba(0, 102, 255, 0.1)"
        : "rgba(0, 102, 255, 0.08)"};
    border-color: ${({ theme }) => theme.brand};
    transform: translateX(4px);

    ${DragHandle} {
      opacity: 0.6;
    }

    ${NavItemArrow} {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const AdminBox = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AdminButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 14px;
  background: ${({ theme, $primary, $save }) =>
    $primary
      ? `linear-gradient(135deg, ${theme.brand} 0%, #0052cc 100%)`
      : $save
      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      : theme.card};
  color: ${({ $primary, $save }) => ($primary || $save ? "#fff" : "inherit")};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${({ $primary, $save }) =>
    $primary || $save ? "0 4px 12px rgba(0, 102, 255, 0.25)" : "none"};

  span {
    font-size: 1.1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $primary, $save, theme }) =>
      $primary
        ? "0 6px 20px rgba(0, 102, 255, 0.35)"
        : $save
        ? "0 6px 20px rgba(16, 185, 129, 0.35)"
        : `0 4px 12px ${
            theme.name === "dark"
              ? "rgba(0, 0, 0, 0.3)"
              : "rgba(0, 0, 0, 0.1)"
          }`};
  }

  &:active {
    transform: translateY(0);
  }
`;

const Main = styled.main`
  overflow-y: auto;
  padding: 60px 80px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(180deg, #0c1528 0%, #0a1323 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)"};

  @media (max-width: 1400px) {
    padding: 50px 60px;
  }

  @media (max-width: 1024px) {
    padding: 40px 40px;
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
`;

const HeaderSection = styled.header`
  margin-bottom: 48px;
  max-width: 900px;

  h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    margin: 12px 0 16px;
    line-height: 1.2;
    background: ${({ theme }) =>
      theme.name === "dark"
        ? "linear-gradient(135deg, #ffffff 0%, #a8c7fa 100%)"
        : "linear-gradient(135deg, #0066ff 0%, #8b5cf6 100%)"};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeaderBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(139, 92, 246, 0.15)"
      : "rgba(139, 92, 246, 0.1)"};
  color: #8b5cf6;
  border: 1px solid ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(139, 92, 246, 0.3)"
      : "rgba(139, 92, 246, 0.2)"};
`;

const HeaderDescription = styled.p`
  color: ${({ theme }) => theme.muted};
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 0;
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
`;

const XMLPreview = styled.div`
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"};
  border-radius: 20px;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.border};
  overflow-x: auto;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) =>
    theme.name === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.05)"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) =>
      theme.name === "dark"
        ? "0 8px 32px rgba(0, 0, 0, 0.4)"
        : "0 8px 32px rgba(0, 102, 255, 0.1)"};
    border-color: ${({ theme }) => theme.brand};
  }

  pre {
    margin: 0;
    font-family: "Fira Code", "Courier New", monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.text};
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 10px;
  }
`;

const XMLHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const XMLTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

const XMLBadge = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(0, 102, 255, 0.15)"
      : "rgba(0, 102, 255, 0.1)"};
  color: ${({ theme }) => theme.brand};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 40px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
      : "linear-gradient(135deg, #ffffff 0%, #fafbff 100%)"};
  border-radius: 24px;
  border: 1px dashed ${({ theme }) => theme.border};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.text};
`;

const EmptyDescription = styled.p`
  color: ${({ theme }) => theme.muted};
  font-size: 1rem;
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
`;

const NavButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  max-width: 900px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const NavButton = styled.button`
  padding: 14px 28px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  background: ${({ theme, $secondary }) =>
    $secondary
      ? theme.card
      : `linear-gradient(135deg, ${theme.brand} 0%, #0052cc 100%)`};
  color: ${({ $secondary, theme }) => ($secondary ? theme.text : "#fff")};
  border: ${({ theme, $secondary }) =>
    $secondary ? `2px solid ${theme.border}` : "none"};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${({ $secondary, theme }) =>
    $secondary
      ? "none"
      : theme.name === "dark"
      ? "0 4px 16px rgba(0, 102, 255, 0.3)"
      : "0 4px 16px rgba(0, 102, 255, 0.25)"};

  span {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ $secondary, theme }) =>
      $secondary
        ? theme.name === "dark"
          ? "0 6px 20px rgba(0, 0, 0, 0.3)"
          : "0 6px 20px rgba(0, 0, 0, 0.1)"
        : "0 8px 24px rgba(0, 102, 255, 0.4)"};
    background: ${({ theme, $secondary }) =>
      $secondary
        ? theme.name === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "#f8faff"
        : `linear-gradient(135deg, ${theme.brand} 0%, #0052cc 100%)`};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
`;

const LoadingBox = styled.div`
  text-align: center;
  padding: 40px;

  p {
    margin-top: 20px;
    color: ${({ theme }) => theme.muted};
    font-size: 1.1rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  margin: 0 auto;
  border: 4px solid ${({ theme }) =>
    theme.name === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
  border-top-color: ${({ theme }) => theme.brand};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorBox = styled.div`
  padding: 40px;
  border-radius: 24px;
  background: ${({ theme }) =>
    theme.name === "dark"
      ? "rgba(244, 63, 94, 0.1)"
      : "rgba(244, 63, 94, 0.08)"};
  border: 2px solid rgba(244, 63, 94, 0.3);
  max-width: 500px;
  text-align: center;

  p {
    margin: 16px 0 0;
    color: #f43f5e;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 8px;
`;

const Breadcrumb = styled.div`
  margin-bottom: 20px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.muted};

  a {
    color: ${({ theme }) => theme.brand};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: #f87171;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 8px;

  &:hover {
    color: #ef4444;
    transform: scale(1.1);
  }
`;

const DeleteRootBtn = styled.button`
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

const AddContentBtn = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const HeadingComp = styled.h2`
  font-weight: 800;
  margin: 16px 0;
  color: ${({ theme }) => theme.text};
`;

const ParagraphComp = styled.p`
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 8px 0 20px;
  color: ${({ theme }) => theme.muted};
`;

const ExampleBox = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border-left: 4px solid #10b981;
  padding: 16px 20px;
  border-radius: 12px;
  margin: 16px 0;
`;

const ExampleTitle = styled.h4`
  margin: 0 0 6px;
  color: #10b981;
`;

const ExampleText = styled.p`
  margin: 0;
`;

const NoteBox = styled.div`
  background: ${({ $type }) =>
    $type === "danger"
      ? "rgba(239, 68, 68, 0.1)"
      : $type === "warning"
      ? "rgba(234, 179, 8, 0.1)"
      : "rgba(59, 130, 246, 0.1)"};
  border-left: 4px solid
    ${({ $type }) =>
      $type === "danger"
        ? "#ef4444"
        : $type === "warning"
        ? "#eab308"
        : "#3b82f6"};
  padding: 16px 20px;
  border-radius: 12px;
  margin: 16px 0;
`;

const NoteTitle = styled.h4`
  margin: 0 0 6px;
`;

const NoteText = styled.p`
  margin: 0;
`;

const CodeBlock = styled.div`
  background: ${({ theme }) =>
    theme.name === "dark" ? "#1e1e2f" : "#f3f4f6"};
  border-radius: 10px;
  margin: 20px 0;
  overflow-x: auto;
  padding: 16px;
  font-family: "Fira Code", monospace;

  pre {
    margin: 0;
  }
`;

const CodeLang = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 8px;
`;

const ImageBox = styled.div`
  text-align: center;
  margin: 24px 0;
`;

const Caption = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.muted};
  margin-top: 8px;
`;

const CarouselBox = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin: 20px 0;
`;

// ✅ Add below your existing styled-components section in TopicDetail.jsx

const UpdateContentBtn = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;
