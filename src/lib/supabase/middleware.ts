import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Auth 실패 시 미인증 처리
  }

  // 인증 실패 시 남은 Supabase 쿠키 정리 (431 방지)
  if (!user) {
    const staleKeys = request.cookies
      .getAll()
      .filter((c) => c.name.startsWith("sb-"))
      .map((c) => c.name);

    if (staleKeys.length > 0) {
      const url = isAuthPage ? null : request.nextUrl.clone();
      if (url) url.pathname = "/login";

      const response = url
        ? NextResponse.redirect(url)
        : NextResponse.next({ request });

      staleKeys.forEach((name) =>
        response.cookies.set(name, "", { maxAge: 0 })
      );
      return response;
    }
  }

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
