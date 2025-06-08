// src/client.ts
import { createBrowserClient, createServerClient as createSupabaseServerClient } from "@supabase/ssr";
function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api"
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
function createServerClient(cookieStore) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api"
    );
  }
  return createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
  }
  return createBrowserClient(supabaseUrl, serviceRoleKey);
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
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}
async function getCurrentSession(supabase) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      return null;
    }
    return session;
  } catch (error) {
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
    const realtime = supabase.realtime;
    if (!realtime) {
      return "unavailable";
    }
    return realtime.connection?.state || "unknown";
  } catch {
    return "unavailable";
  }
}

// src/database.ts
var users = {
  /**
   * Get all users with optional filtering and pagination
   */
  async getAll(supabase, options = {}) {
    try {
      let query = supabase.from("users").select("*");
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
      }
      const { data, error } = await query;
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get a user by ID
   */
  async getById(supabase, id) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get a user by email
   */
  async getByEmail(supabase, email) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Create a new user
   */
  async create(supabase, userData) {
    try {
      const { data, error } = await supabase.from("users").insert(userData).select().single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Update a user
   */
  async update(supabase, id, updates) {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Delete a user
   */
  async delete(supabase, id) {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      return {
        data: null,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  }
};
var products = {
  /**
   * Get all products with optional filtering and pagination
   */
  async getAll(supabase, options = {}) {
    try {
      let query = supabase.from("products").select("*");
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
      }
      const { data, error } = await query;
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get a product by ID
   */
  async getById(supabase, id) {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Create a new product
   */
  async create(supabase, productData) {
    try {
      const { data, error } = await supabase.from("products").insert(productData).select().single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Update a product
   */
  async update(supabase, id, updates) {
    try {
      const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Delete a product
   */
  async delete(supabase, id) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      return {
        data: null,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  }
};
var subscriptions = {
  /**
   * Get all subscriptions with optional filtering and pagination
   */
  async getAll(supabase, options = {}) {
    try {
      let query = supabase.from("subscriptions").select(`
        *,
        users(*),
        products(*)
      `);
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
      }
      const { data, error } = await query;
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get subscriptions by user ID
   */
  async getByUserId(supabase, userId, options = {}) {
    try {
      let query = supabase.from("subscriptions").select(`
          *,
          users(*),
          products(*)
        `).eq("user_id", userId);
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }
      const { data, error } = await query;
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get a subscription by ID
   */
  async getById(supabase, id) {
    try {
      const { data, error } = await supabase.from("subscriptions").select(`
          *,
          users(*),
          products(*)
        `).eq("id", id).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Create a new subscription
   */
  async create(supabase, subscriptionData) {
    try {
      const { data, error } = await supabase.from("subscriptions").insert(subscriptionData).select(`
          *,
          users(*),
          products(*)
        `).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Update a subscription
   */
  async update(supabase, id, updates) {
    try {
      const { data, error } = await supabase.from("subscriptions").update(updates).eq("id", id).select(`
          *,
          users(*),
          products(*)
        `).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Delete a subscription
   */
  async delete(supabase, id) {
    try {
      const { error } = await supabase.from("subscriptions").delete().eq("id", id);
      return {
        data: null,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  }
};
var userProducts = {
  /**
   * Get all user-product relationships with optional filtering
   */
  async getAll(supabase, options = {}) {
    try {
      let query = supabase.from("user_products").select(`
        *,
        users(*),
        products(*)
      `);
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }
      const { data, error } = await query;
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get user-product relationships by user ID
   */
  async getByUserId(supabase, userId) {
    try {
      const { data, error } = await supabase.from("user_products").select(`
          *,
          users(*),
          products(*)
        `).eq("user_id", userId);
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get user-product relationships by product ID
   */
  async getByProductId(supabase, productId) {
    try {
      const { data, error } = await supabase.from("user_products").select(`
          *,
          users(*),
          products(*)
        `).eq("product_id", productId);
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Get a specific user-product relationship
   */
  async getByUserAndProduct(supabase, userId, productId) {
    try {
      const { data, error } = await supabase.from("user_products").select(`
          *,
          users(*),
          products(*)
        `).eq("user_id", userId).eq("product_id", productId).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Create a new user-product relationship
   */
  async create(supabase, userProductData) {
    try {
      const { data, error } = await supabase.from("user_products").insert(userProductData).select(`
          *,
          users(*),
          products(*)
        `).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Update a user-product relationship
   */
  async update(supabase, id, updates) {
    try {
      const { data, error } = await supabase.from("user_products").update(updates).eq("id", id).select(`
          *,
          users(*),
          products(*)
        `).single();
      return {
        data,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  },
  /**
   * Delete a user-product relationship
   */
  async delete(supabase, id) {
    try {
      const { error } = await supabase.from("user_products").delete().eq("id", id);
      return {
        data: null,
        error: error?.message || null,
        success: !error
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  }
};
var database = {
  /**
   * Check database connection health
   */
  async healthCheck(supabase) {
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1);
      if (error) {
        return {
          data: null,
          error: `Database health check failed: ${error.message}`,
          success: false
        };
      }
      return {
        data: { status: "healthy" },
        error: null,
        success: true
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Database connection failed",
        success: false
      };
    }
  },
  /**
   * Get table information
   */
  async getTableInfo(supabase, tableName) {
    try {
      const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true });
      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }
      return {
        data: { count: count || 0 },
        error: null,
        success: true
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
        success: false
      };
    }
  }
};
function validateRequired(data, requiredFields) {
  const missingFields = [];
  requiredFields.forEach((field) => {
    if (!data[field] || typeof data[field] === "string" && data[field].trim() === "") {
      missingFields.push(String(field));
    }
  });
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
function sanitizeEmail(email) {
  return email.toLowerCase().trim();
}
function createErrorResponse(error, data = null) {
  return {
    data,
    error,
    success: false
  };
}
function createSuccessResponse(data) {
  return {
    data,
    error: null,
    success: true
  };
}

// src/index.ts
var SUPABASE_VERSION = "0.1.0";
export {
  Constants,
  SUPABASE_VERSION,
  copyFile,
  createAdminClient,
  createBucket,
  createChannel,
  createClient,
  createErrorResponse,
  createServerClient,
  createSignedUrl,
  createSignedUrls,
  createSuccessResponse,
  database,
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
  products,
  resetPassword,
  sanitizeEmail,
  signInWithOAuth,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  subscribeToRow,
  subscribeToTable,
  subscribeToUserChanges,
  subscriptions,
  unsubscribeChannel,
  unsubscribeMultipleChannels,
  updatePassword,
  updateUserMetadata,
  uploadFile,
  userProducts,
  users,
  validateRequired
};
//# sourceMappingURL=index.mjs.map