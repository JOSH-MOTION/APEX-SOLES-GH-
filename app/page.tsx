import ComingSoon from "./ComingSoon";
import HomeClient from "./HomeClient";

// Set launch date to Tuesday March 25, 2026
const LAUNCH_DATE = new Date("2026-03-25T00:00:00");

export default function Page() {
  const now = new Date();
  const isLaunched = now >= LAUNCH_DATE;

  if (isLaunched) {
    return <HomeClient />;
  }

  return <ComingSoon launchDate={LAUNCH_DATE.toISOString()} />;
}