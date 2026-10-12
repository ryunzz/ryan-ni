import { Crawl, ContactText } from "@/components/Crawl";
import { content, pageMeta } from "@/lib/content";

export const metadata = pageMeta("Contact", content.about.contact.blurb, "/contact");

export default function ContactPage() {
  return (
    <Crawl>
      <h1>Contact Ryan Ni</h1>
      <ContactText />
    </Crawl>
  );
}
