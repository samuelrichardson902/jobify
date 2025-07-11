import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accessToken = authHeader.replace("Bearer ", "");

    // Validate the token and get the user
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = user.id;

    // Delete user data
    const { error: appError } = await supabaseAdmin
      .from("applications")
      .delete()
      .eq("user_id", userId);
    if (appError) {
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    // Delete the user from Supabase Auth
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
