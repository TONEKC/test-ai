"use client";

import type { FileAttachmentInput } from "@/lib/validations";

const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "documents";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: url.replace(/\/$/, ""),
    anonKey,
  };
}

export async function uploadRegistrationFiles(files: File[]) {
  const supabase = getSupabaseConfig();

  const uploaded: FileAttachmentInput[] = [];

  for (const file of files) {
    const storageKey = `registrations/${crypto.randomUUID()}-${file.name}`;
    const response = await fetch(
      `${supabase.url}/storage/v1/object/${bucket}/${storageKey}`,
      {
        method: "POST",
        headers: {
          apikey: supabase.anonKey,
          Authorization: `Bearer ${supabase.anonKey}`,
          "Cache-Control": "3600",
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "false",
        },
        body: file,
      },
    );

    if (!response.ok) {
      const message = await response.text().catch(() => "Upload failed.");
      throw new Error(message || "Upload failed.");
    }

    uploaded.push({
      fileName: file.name,
      storageKey,
      url: `${supabase.url}/storage/v1/object/public/${bucket}/${storageKey}`,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });
  }

  return uploaded;
}
