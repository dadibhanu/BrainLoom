import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; margin: 0; padding: 0; }

  body {
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.text};
    transition: background 0.25s ease, color 0.25s ease;
  }

  a { color: inherit; text-decoration: none; }
  button { font: inherit; cursor: pointer; }
  input { font: inherit; }

  .container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 16px;
  }

  ::selection {
    background: ${({ theme }) => theme.brand};
    color: white;
  }
`;
