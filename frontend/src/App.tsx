import { useEffect, useState } from "react";
import { addTodo, deleteTodo, fetchTodos, updateTodo } from "./api/todo";
import { fetchLoginStatus, login, logout, resigter } from "./api/auth";
import TodoForm from "./components/TodoForm";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Header from "./components/Header";
import { Circle, CircleCheckBig, SquarePen, Trash2 } from "lucide-react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  async function syncTodos() {
    const todos = await fetchTodos();
    setTodos(todos);
  }

  useEffect(() => {
    async function initApp() {
      const status = await fetchLoginStatus();
      setIsLoggedIn(status);
      if (status) {
        try {
          await syncTodos();
        } catch (e) {
          alert((e as Error).message);
          alert("ToDo一覧の取得に失敗しました。");
        }
      }
    }
    initApp();
  }, [isLoggedIn]);

  function handleExpired(error: unknown) {
    if ((error as Error).message === "EXPIRED") {
      setIsLoggedIn(false);
      setTodos([]);
      setEditingId(null);
      alert("セッションの有効期限が切れました。再度ログインしてください。");
      return true;
    }
    return false;
  }

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        onClickLogout={async () => {
          try {
            await logout();
            setIsLoggedIn(false);
            setTodos([]);
            setEditingId(null);
            alert("ログアウトしました。");
          } catch (e) {
            alert((e as Error).message);
          }
        }}
        onClickLogin={() => setShowRegister(false)}
        onClickRegister={() => setShowRegister(true)}
      />

      {isLoggedIn ? (
        <>
          <section className="todo-add-form-wrapper">
            <TodoForm
              onSubmit={async (title: string) => {
                try {
                  await addTodo(title);
                  await syncTodos();
                } catch (e) {
                  if (handleExpired(e)) return;
                  alert((e as Error).message);
                }
              }}
            />
          </section>
          <section className="todo-list-wrapper">
            <ul>
              {todos.map((todo) => (
                <li key={todo.id}>
                  {editingId === todo.id ? (
                    <div className="todo-edit-form-wrapper">
                      <TodoForm
                        onSubmit={async (title: string) => {
                          try {
                            await updateTodo(todo.id, title, todo.completed);
                            setEditingId(null);
                            await syncTodos();
                          } catch (e) {
                            if (handleExpired(e)) return;
                            alert((e as Error).message);
                          }
                        }}
                        initialTitle={todo.title}
                        submitLabel="更新"
                      />
                      <div className="cancel-btn-wrapper">
                        <button onClick={() => setEditingId(null)}>
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="todo-text">
                        <strong className="todo-title">{todo.title}</strong>
                        <span className="todo-created-at">
                          作成日時:{" "}
                          {new Date(todo.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <div className="todo-btns">
                        <button
                          onClick={async () => {
                            try {
                              await updateTodo(
                                todo.id,
                                todo.title,
                                !todo.completed
                              );
                              await syncTodos();
                            } catch (e) {
                              if (handleExpired(e)) return;
                              alert((e as Error).message);
                            }
                          }}
                          style={{ marginRight: "0.5em" }}
                        >
                          {todo.completed ? (
                            <CircleCheckBig size={16} color="#10b981" />
                          ) : (
                            <Circle size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(todo.id)}
                          style={{ marginRight: "0.5em" }}
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("本当に削除しますか？")) return;
                            try {
                              await deleteTodo(todo.id);
                              await syncTodos();
                            } catch (e) {
                              if (handleExpired(e)) return;
                              alert((e as Error).message);
                            }
                          }}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          <section className="auth-wrapper">
            <div className="auth-card">
              <h2>{showRegister ? "会員登録" : "ログイン"}</h2>
              {showRegister ? (
                <>
                  <RegisterForm
                    onSubmit={async (email, password) => {
                      try {
                        await resigter(email, password);
                        setShowRegister(false);
                        alert("会員登録が完了しました。");
                      } catch (e) {
                        alert((e as Error).message);
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  <LoginForm
                    onSubmit={async (email, password) => {
                      try {
                        await login(email, password);
                        setIsLoggedIn(true);
                        alert("ログインしました。");
                      } catch (e) {
                        alert((e as Error).message);
                      }
                    }}
                  />
                </>
              )}
              <div className="auth-toggle">
                {showRegister ? (
                  <>
                    <span>すでにアカウントをお持ちですか？</span>
                    <button onClick={() => setShowRegister(false)}>
                      ログイン
                    </button>
                  </>
                ) : (
                  <>
                    <span>アカウントをお持ちではありませんか？</span>
                    <button onClick={() => setShowRegister(true)}>
                      会員登録
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default App;
