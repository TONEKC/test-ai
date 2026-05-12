import { z } from 'zod'

export const fileAttachmentSchema = z
  .object({
    fileName: z.string().trim().min(1).max(255),
    storageKey: z.string().trim().min(1).max(512),
    url: z.string().trim().min(1).max(1024),
    mimeType: z.string().trim().min(1).max(120),
    sizeBytes: z.number().int().positive().max(20 * 1024 * 1024),
  })
  .strict()

export const registrationSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(6).max(40).optional().or(z.literal('')),
    password: z.string().min(10).max(128),
    eventName: z.string().trim().min(2).max(180).default('Main Event'),
    organization: z.string().trim().max(180).optional().or(z.literal('')),
    attachments: z.array(fileAttachmentSchema).max(10).default([]),
  })
  .strict()

export const userLoginSchema = z
  .object({
    referenceCode: z.string().trim().min(6).max(32),
    password: z.string().min(1).max(128),
  })
  .strict()

export const updateRegistrationSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(6).max(40).optional().or(z.literal('')),
    organization: z.string().trim().max(180).optional().or(z.literal('')),
    attachmentsToAdd: z.array(fileAttachmentSchema).max(10).default([]),
    documentIdsToRemove: z.array(z.string().uuid()).max(20).default([]),
  })
  .strict()

export type RegistrationInput = z.infer<typeof registrationSchema>
export type FileAttachmentInput = z.infer<typeof fileAttachmentSchema>
