interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const apiURL = import.meta.env.VITE_API_URL;

function handleError(res: Response, msg: string) {
  if (res.status === 440) throw new Error("EXPIRED");
  if (!res.ok) throw new Error(msg);
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${apiURL}/todos`, {
    method: "GET",
    credentials: "include",
  });
  handleError(res, "Todo一覧の取得に失敗しました。");
  return res.json();
}

export async function addTodo(title: string) {
  const res = await fetch(`${apiURL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
    credentials: "include",
  });
  handleError(res, "Todoの追加に失敗しました");
}

export async function updateTodo(
  id: number,
  title: string,
  completed: boolean
) {
  const res = await fetch(`${apiURL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed }),
    credentials: "include",
  });
  handleError(res, "Todoの更新に失敗しました");
}

export async function deleteTodo(id: number) {
  const res = await fetch(`${apiURL}/todos/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  handleError(res, "Todoの削除に失敗しました");
}
