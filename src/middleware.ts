import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const isLocalhost =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");

  // 外部公開URL（localhost以外）からルート「/」にアクセスされた場合は、自動的にプレイヤー専用画面「/sonar」へ誘導
  if (!isLocalhost && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/sonar";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
