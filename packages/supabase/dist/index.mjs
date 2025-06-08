// src/client.ts
import { createBrowserClient, createServerClient as createSupabaseServerClient } from "@supabase/ssr";
function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
function createServerClient(cookieStore) {
  return createSupabaseServerClient(
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
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

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
export {
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
};
//# sourceMappingURL=index.mjs.map