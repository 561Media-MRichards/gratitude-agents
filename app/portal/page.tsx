import { redirect } from "next/navigation";

// The portal dashboard duplicated the Guide (quick starts, workflows) and
// carried its own one-off nav. Its unique content was folded into /guide;
// old links land in the chat, which is the product's real home.
export default function PortalPage() {
  redirect("/chat");
}
