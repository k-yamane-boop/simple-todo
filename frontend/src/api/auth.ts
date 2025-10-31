const apiURL = import.meta.env.VITE_API_URL;

export async function resigter(email: string, password: string) {
  const res = await fetch(`${apiURL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 409)
    throw new Error("そのメースアドレスはすでに登録済みです。");
  if (!res.ok) throw new Error("会員登録に失敗しました。");
}

export async function login(email: string, password: string) {
  const res = await fetch(`${apiURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("ログインに失敗しました。");
}

export async function logout() {
  const res = await fetch(`${apiURL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("ログアウトに失敗しました。");
}

export async function fetchLoginStatus() {
  try {
    const res = await fetch(`${apiURL}/auth/check`, {
      method: "GET",
      credentials: "include",
    });
    if (res.status === 200) return true;
    if (res.status === 401) return false;

    throw new Error("ログイン状態の取得に失敗しました。");
  } catch (e) {
    console.error(e);
    return false;
  }
}
