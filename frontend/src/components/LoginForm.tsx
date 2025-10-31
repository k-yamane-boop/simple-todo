import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  onSubmit: (email: string, password: string) => void;
};

function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("メースアドレスとパスワードを入力してください");
      return;
    }

    onSubmit(email, password);
    setEmail("");
    setPassword("");
    setError("");
  };
  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <label htmlFor="email">メールアドレス</label>
      <br />
      <input
        type="email"
        id="email"
        name="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
        }}
        placeholder="メールアドレスを入力"
        autoComplete="email"
      />
      <br />
      <label htmlFor="password">パスワード</label>
      <input
        type="password"
        id="password"
        name="password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
        placeholder="パスワードを入力"
      />
      <br />
      <button type="submit">ログイン</button>
    </form>
  );
}

export default LoginForm;
