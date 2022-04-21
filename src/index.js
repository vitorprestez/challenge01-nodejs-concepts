const express = require("express");
const { request: req } = require("express");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  req.user = user;
  return next();
}

function findTodo(request, response, next) {
  const { id } = request.params;

  const todo = req.user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(400).json({ error: "Todo not found" });
  }

  req.findTodo = todo;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/users", checksExistsUserAccount, (request, response) => {
  return response.status(201).json(request.user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  if (todos.length === 0) {
    return response.status(204).json({ message: "No todos found" });
  }

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = req;

  const todo = {
    id: uuidv4(),
    title: title,
    deadline: new Date(deadline),
    create_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json({ message: "Todo created" });
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  findTodo,
  (request, response) => {
    const { title, deadline } = request.body;
    const { user, findTodo } = req;

    const index = user.todos.indexOf(findTodo);

    if (index) {
      user.todos.splice(index, 1, {
        ...findTodo,
        title: title,
        deadline: new Date(deadline),
      });
      return response.status(201).json({ message: "Todo updated" });
    } else {
      return response.status(400).json({ error: "Todo not found" });
    }
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  findTodo,
  (request, response) => {
    const { user, findTodo } = req;
    const index = user.todos.indexOf(findTodo);

    if (index) {
      user.todos.splice(index, 1, { ...findTodo, done: true });
      return response.status(201).json({ message: "Todo completed" });
    } else {
      return response.status(400).json({ error: "Todo not found" });
    }
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  findTodo,
  (request, response) => {
    const { user, findTodo } = req;

    const index = user.todos.indexOf(findTodo);

    if (index) {
      user.todos.splice(index, 1);
      return response.status(201).json({ message: "Todo deleted" });
    } else {
      return response.status(400).json({ error: "Todo not found" });
    }
  }
);

module.exports = app;
