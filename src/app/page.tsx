import ChatInterface from "./chat-interface";

/*
 * CUSTOMIZE: Update metadata for each persona
 * - title: "PersonaName - UARE.AI"
 * - description: "Title | Digital Twin Demo"
 */
export const metadata = {
  title: "{{AVATAR_NAME}} - UARE.AI",
  description: "{{AVATAR_TITLE}} | Digital Twin Demo",
  icons: {
    icon: "/favicon-u.png",
    shortcut: "/favicon-u.png",
    apple: "/favicon-u.png",
  }
};

export default function Home() {
  return (
    <main className="h-screen w-full">
      <ChatInterface />
    </main>
  );
}
