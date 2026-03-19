import Image from "next/image";
import { LeadForm } from "../contact/LeadForm";
import { buildStorageUrl } from "../../lib/supabase/storage";

export type ProjectDetailProps = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  price?: number | null;
  status?: string | null;
  landmark?: string | null;
  address?: string | null;
  map_embed_url?: string | null;
  project_images?: Array<{
    id: string;
    image_path: string;
    alt_text: string | null;
    is_cover: boolean | null;
  }>;
};

export function ProjectDetail({ project }: { project: ProjectDetailProps }) {
  const coverImage = project.project_images?.find((img) => img.is_cover) ?? project.project_images?.[0];
  const coverImageUrl = coverImage ? buildStorageUrl(coverImage.image_path) : null;

  return (
    <div className="flex flex-col gap-10">
      {/* Removed space-y-10 -> vertical spacing now controlled by parent page (gives page full layout control) */}
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_30px_45px_rgba(8,60,32,0.08)]">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">{project.status || "Available"}</p>
            {/* Removed mt-2 -> vertical spacing now controlled by parent page (gives page full layout control) */}
            <h1 className="text-4xl font-semibold text-neutral-900">{project.name}</h1>
            <p className="text-sm text-neutral-500">{project.address}</p>
            <div className="flex flex-col gap-3 text-sm text-neutral-600">
              {/* Removed mt-6 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              <p>{project.description}</p>
              {project.landmark && (
                <p>
                  <span className="font-semibold text-neutral-900">Near:</span> {project.landmark}
                </p>
              )}
              {project.location && (
                <p>
                  <span className="font-semibold text-neutral-900">Location:</span> {project.location}
                </p>
              )}
            </div>
            {/* Removed mt-6 -> vertical spacing now controlled by parent page (gives page full layout control) */}
            <p className="text-2xl font-semibold text-[var(--brand-primary)]">
              {project.price ? `₹${project.price.toLocaleString("en-IN")}` : "Price on request"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-[2rem] border border-neutral-200 bg-neutral-900 p-6 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.4em] text-neutral-400">Project Snapshot</p>
          {/* Removed mt-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <p className="text-base">Payment plans, amenities, and more available below.</p>
          {coverImageUrl && (
            <div className="h-52 overflow-hidden rounded-2xl border border-neutral-700">
              <Image
                src={coverImageUrl}
                alt={coverImage?.alt_text ?? project.name}
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-neutral-900">Amenities</h2>
              {/* Removed mt-2 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              <p className="text-sm text-neutral-600">
                Carefully crafted amenities such as a clubhouse, wellness center, landscaped walkways, and
                24x7 security come standard.
              </p>
            </div>
          </section>
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-neutral-900">Payment Plan</h2>
              {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>40% on booking</li>
                <li>30% on foundation</li>
                <li>30% on possession</li>
              </ul>
            </div>
          </section>
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-neutral-900">Nearby</h2>
              {/* Removed mt-2 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              <p className="text-sm text-neutral-600">Schools, hospitals, and expressways within 5 km.</p>
            </div>
          </section>
        </div>
        <LeadForm projectId={project.id} />
      </div>
    </div>
  );
}
