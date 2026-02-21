import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient geminiApiKey={process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""} />;
}
