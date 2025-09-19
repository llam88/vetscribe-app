import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if this is a new user and if they have metadata
      const user = data.user;
      const metadata = user.user_metadata;
      
      if (metadata.full_name && metadata.practice_name) {
        // Save user profile to profiles table
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              full_name: metadata.full_name,
              practice_name: metadata.practice_name,
              user_type: metadata.user_type || 'veterinarian',
              created_at: new Date().toISOString()
            });
            
          if (profileError) {
            console.error('Error saving profile:', profileError);
          } else {
            console.log('Profile saved successfully for:', metadata.full_name);
          }
        } catch (err) {
          console.error('Profile save exception:', err);
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
