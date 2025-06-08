"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Constants: () => Constants,
  SUPABASE_VERSION: () => SUPABASE_VERSION,
  copyFile: () => copyFile,
  createAdminClient: () => createAdminClient,
  createBucket: () => createBucket,
  createChannel: () => createChannel,
  createClient: () => createClient,
  createServerClient: () => createServerClient,
  createSignedUrl: () => createSignedUrl,
  createSignedUrls: () => createSignedUrls,
  deleteBucket: () => deleteBucket,
  deleteFile: () => deleteFile,
  downloadFile: () => downloadFile,
  getCurrentSession: () => getCurrentSession,
  getCurrentUser: () => getCurrentUser,
  getFileInfo: () => getFileInfo,
  getPublicUrl: () => getPublicUrl,
  getRealtimeStatus: () => getRealtimeStatus,
  getUserId: () => getUserId,
  isAuthenticated: () => isAuthenticated,
  isRealtimeAvailable: () => isRealtimeAvailable,
  listBuckets: () => listBuckets,
  listFiles: () => listFiles,
  moveFile: () => moveFile,
  resetPassword: () => resetPassword,
  signInWithOAuth: () => signInWithOAuth,
  signInWithPassword: () => signInWithPassword,
  signOut: () => signOut,
  signUpWithPassword: () => signUpWithPassword,
  subscribeToRow: () => subscribeToRow,
  subscribeToTable: () => subscribeToTable,
  subscribeToUserChanges: () => subscribeToUserChanges,
  unsubscribeChannel: () => unsubscribeChannel,
  unsubscribeMultipleChannels: () => unsubscribeMultipleChannels,
  updatePassword: () => updatePassword,
  updateUserMetadata: () => updateUserMetadata,
  uploadFile: () => uploadFile
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var import_ssr = require("@supabase/ssr");
function createClient() {
  return (0, import_ssr.createBrowserClient)(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
function createServerClient(cookieStore) {
  return (0, import_ssr.createServerClient)(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => cookieStore.set(name, value, options)
            );
          } catch {
          }
        }
      }
    }
  );
}
function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
  }
  return (0, import_ssr.createBrowserClient)(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// src/types.ts
var Constants = {
  public: {
    Enums: {
      subscription_status: [
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "trialing",
        "unpaid"
      ],
      user_role: ["owner", "admin", "member", "viewer"]
    }
  }
};

// src/auth-helpers.ts
async function getCurrentUser(supabase) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
async function getCurrentSession(supabase) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting current session:", error);
      return null;
    }
    return session;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
}
async function signInWithPassword(supabase, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}
async function signUpWithPassword(supabase, email, password, options) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options
  });
  return { data, error };
}
async function signInWithOAuth(supabase, provider, options) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options
  });
  return { data, error };
}
async function signOut(supabase) {
  const { error } = await supabase.auth.signOut();
  return { error };
}
async function resetPassword(supabase, email, redirectTo) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });
  return { data, error };
}
async function updatePassword(supabase, password) {
  const { data, error } = await supabase.auth.updateUser({
    password
  });
  return { data, error };
}
async function updateUserMetadata(supabase, data) {
  const { data: userData, error } = await supabase.auth.updateUser({
    data
  });
  return { data: userData, error };
}
async function isAuthenticated(supabase) {
  const user = await getCurrentUser(supabase);
  return user !== null;
}
async function getUserId(supabase) {
  const user = await getCurrentUser(supabase);
  return user?.id || null;
}

// src/storage.ts
async function uploadFile(supabase, bucket, path, file, options) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, options);
  return { data, error };
}
async function downloadFile(supabase, bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  return { data, error };
}
function getPublicUrl(supabase, bucket, path, options) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, options);
  return data;
}
async function createSignedUrl(supabase, bucket, path, expiresIn, options) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn, options);
  return { data, error };
}
async function createSignedUrls(supabase, bucket, paths, expiresIn, options) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, expiresIn, options);
  return { data, error };
}
async function deleteFile(supabase, bucket, paths) {
  const { data, error } = await supabase.storage.from(bucket).remove(paths);
  return { data, error };
}
async function listFiles(supabase, bucket, path, options) {
  const { data, error } = await supabase.storage.from(bucket).list(path, options);
  return { data, error };
}
async function moveFile(supabase, bucket, fromPath, toPath) {
  const { data, error } = await supabase.storage.from(bucket).move(fromPath, toPath);
  return { data, error };
}
async function copyFile(supabase, bucket, fromPath, toPath) {
  const { data, error } = await supabase.storage.from(bucket).copy(fromPath, toPath);
  return { data, error };
}
async function getFileInfo(supabase, bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).list(void 0, {
    search: path.split("/").pop()
  });
  if (error) return { data: null, error };
  const file = data?.find((f) => f.name === path.split("/").pop());
  return { data: file || null, error: file ? null : new Error("File not found") };
}
async function createBucket(supabase, id, options) {
  const { data, error } = await supabase.storage.createBucket(id, options);
  return { data, error };
}
async function listBuckets(supabase) {
  const { data, error } = await supabase.storage.listBuckets();
  return { data, error };
}
async function deleteBucket(supabase, id) {
  const { data, error } = await supabase.storage.deleteBucket(id);
  return { data, error };
}

// src/realtime.ts
function subscribeToTable(supabase, table, event = "*", callback, options) {
  const channelName = `table-${table}-${Date.now()}`;
  try {
    const channel = supabase.channel(channelName).on(
      "postgres_changes",
      {
        event,
        schema: options?.schema || "public",
        table,
        filter: options?.filter
      },
      callback
    ).subscribe();
    return channel;
  } catch (error) {
    console.error("Error subscribing to table changes:", error);
    return null;
  }
}
function subscribeToRow(supabase, table, rowId, callback, options) {
  return subscribeToTable(
    supabase,
    table,
    options?.event || "*",
    callback,
    {
      schema: options?.schema || "public",
      filter: `id=eq.${rowId}`
    }
  );
}
function subscribeToUserChanges(supabase, userId, tables, callback, options) {
  return tables.map(
    (table) => subscribeToTable(
      supabase,
      table,
      "*",
      callback,
      {
        schema: options?.schema || "public",
        filter: `user_id=eq.${userId}`
      }
    )
  ).filter(Boolean);
}
function createChannel(supabase, channelName) {
  return supabase.channel(channelName);
}
async function unsubscribeChannel(supabase, channel) {
  try {
    return await supabase.removeChannel(channel);
  } catch (error) {
    console.error("Error unsubscribing from channel:", error);
    return "error";
  }
}
async function unsubscribeMultipleChannels(supabase, channels) {
  await Promise.all(
    channels.filter(Boolean).map((channel) => unsubscribeChannel(supabase, channel))
  );
}
function isRealtimeAvailable(supabase) {
  return !!supabase.realtime;
}
function getRealtimeStatus(supabase) {
  try {
    return supabase.realtime?.connection?.state || "unknown";
  } catch {
    return "unavailable";
  }
}

// src/index.ts
var SUPABASE_VERSION = "0.1.0";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Constants,
  SUPABASE_VERSION,
  copyFile,
  createAdminClient,
  createBucket,
  createChannel,
  createClient,
  createServerClient,
  createSignedUrl,
  createSignedUrls,
  deleteBucket,
  deleteFile,
  downloadFile,
  getCurrentSession,
  getCurrentUser,
  getFileInfo,
  getPublicUrl,
  getRealtimeStatus,
  getUserId,
  isAuthenticated,
  isRealtimeAvailable,
  listBuckets,
  listFiles,
  moveFile,
  resetPassword,
  signInWithOAuth,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  subscribeToRow,
  subscribeToTable,
  subscribeToUserChanges,
  unsubscribeChannel,
  unsubscribeMultipleChannels,
  updatePassword,
  updateUserMetadata,
  uploadFile
});
//# sourceMappingURL=index.js.map