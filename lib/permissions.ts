import type {
  Conversation,
  KnowledgebaseEntry,
  Resource,
} from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

export function isPrivilegedUser(user: SessionUser) {
  return user.role === "admin" || user.role === "employee";
}

export function canEditUsers(user: SessionUser) {
  return user.role === "admin";
}

export function canAccessConversation(user: SessionUser, conversation: Conversation) {
  if (isPrivilegedUser(user)) {
    return true;
  }

  if (conversation.ownerId && conversation.ownerId === user.userId) {
    return true;
  }

  return conversation.visibility === "partner";
}

export function canDeleteConversation(user: SessionUser, conversation: Conversation) {
  return user.role === "admin" || conversation.ownerId === user.userId;
}

export function canViewKnowledgeEntry(user: SessionUser, entry: KnowledgebaseEntry) {
  if (isPrivilegedUser(user)) {
    return true;
  }

  if (entry.ownerId && entry.ownerId === user.userId) {
    return true;
  }

  return entry.visibility === "partner" && entry.status === "approved";
}

export function canEditKnowledgeEntry(user: SessionUser, entry: KnowledgebaseEntry) {
  if (isPrivilegedUser(user)) {
    return true;
  }

  return entry.ownerId === user.userId && entry.status !== "approved";
}

export function canPublishKnowledgeEntry(user: SessionUser) {
  return isPrivilegedUser(user);
}

export function canViewResource(user: SessionUser, resource: Resource) {
  if (isPrivilegedUser(user)) {
    return true;
  }

  if (resource.ownerId === user.userId) {
    return true;
  }

  return resource.visibility === "partner" && resource.status === "published";
}

export function canEditResource(user: SessionUser, resource: Resource) {
  if (isPrivilegedUser(user)) {
    return true;
  }

  return resource.ownerId === user.userId && resource.status !== "published";
}

export function canPublishResource(user: SessionUser) {
  return isPrivilegedUser(user);
}

export function defaultVisibilityForRole(user: SessionUser) {
  return isPrivilegedUser(user) ? "internal" : "private";
}
