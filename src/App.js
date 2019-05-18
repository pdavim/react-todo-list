import React, { Component } from "react";
import { Layout, Input, Button, List, Icon } from "antd";

// We import our firestore module
import firestore from "./firestore";

import "./App.css";

const { Header, Footer, Content } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    // Set the default state of our application
    this.state = {
      addingTodo: false,
      updateTodo: false,
      pendingTodo: "",
      completedTodos: [],
      todos: []
    };
    // We want event handlers to share this context
    this.addTodo = this.addTodo.bind(this);
    this.completeTodo = this.completeTodo.bind(this);

    // We listen for live changes to our todos collection in Firebase
    firestore.collection("todos").onSnapshot(snapshot => {
      let todos = [];
      snapshot.forEach(doc => {
        const todo = doc.data();
        todo.id = doc.id;
        if (!todo.completed) todos.push(todo);
      });

      // Sort our todos based on time added
      todos.sort(function(a, b) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // Anytime the state of our database changes, we update state
      this.setState({ todos });
    });

    // We listen for live changes to our todos collection in Firebase Completed Base
    firestore.collection("completedTodos").onSnapshot(snapshot => {
      let completedTodos = [];
      snapshot.forEach(doc => {
        const completedTodo = doc.data();
        completedTodo.id = doc.id;
        if (completedTodo.completed) completedTodos.push(completedTodo);
      });
      // Sort our todos based on time added
      completedTodos.sort(function(a, b) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      // Anytime the state of our database changes, we update state
      this.setState({ completedTodos });
    });
  }

  async updateTodo(id) {
    // Set a flag to indicate loading
    this.setState({
      updateTodo: true
    });
    // Mark Todo as update
    await firestore
      .collection("todos")
      .doc(id)
      .update({
        content: this.state.pendingTodo,
        completed: false,
        updatedAt: new Date().toISOString()
      });
    // Remove the loading flag and clear the input
    this.setState({
      updateTodo: false,
      pendingTodo: ""
    });
  }

  async deleteTodo(id) {
    await firestore
      .collection("todos")
      .doc(id)
      .delete();
  }

  async addTodo() {
    if (!this.state.pendingTodo) return;
    // Set a flag to indicate loading
    this.setState({ addingTodo: true });
    // Add a new todo from the value of the input
    await firestore.collection("todos").add({
      content: this.state.pendingTodo,
      completed: false,
      createdAt: new Date().toISOString()
    });
    // Remove the loading flag and clear the input
    this.setState({ addingTodo: false, pendingTodo: "" });
  }

  async completeTodo(id) {
    // Mark the todo as completed
    await firestore
      .collection("completedTodos")
      .doc(id)
      .set({
        content: this.state.addingTodo,
        completed: true,
        createdAt: new Date().toISOString()
      });

    await firestore
      .collection("todos")
      .doc(id)
      .delete();
  }

  async deleteTodoComplete(id) {
    await firestore
      .collection("completedTodos")
      .doc(id)
      .delete();
  }

  render() {
    return (
      <Layout className="App">
        <Header className="App-header">
          <h1>Quick Todo</h1>
        </Header>
        <Content className="App-content">
          <Input
            ref="add-todo-input"
            className="App-add-todo-input"
            size="large"
            placeholder="What needs to be done?"
            disabled={this.state.addingTodo}
            onChange={evt => this.setState({ pendingTodo: evt.target.value })}
            value={this.state.pendingTodo}
            onPressEnter={this.addTodo}
            required
          />

          <Button
            className="App-add-todo-button"
            size="large"
            type="primary"
            onClick={this.addTodo}
            loading={this.state.addingTodo}
          >
            Add Todo
          </Button>
          <h1>Pre List</h1>
          <List
            className="App-todos"
            size="large"
            bordered
            dataSource={this.state.todos}
            renderItem={todo => (
              <List.Item>
                {todo.content}
                <Icon
                  onClick={evt => this.updateTodo(todo.id)}
                  className="App-todo-update"
                  type="edit"
                />
                <Icon
                  onClick={evt => this.deleteTodo(todo.id)}
                  className="App-todo-minus"
                  type="delete"
                />
                <Icon
                  onClick={evt => this.completeTodo(todo.id)}
                  className="App-todo-complete"
                  type="check"
                />
              </List.Item>
            )}
          />
          <h1>Final List</h1>
          <List
            className="App-todos"
            size="large"
            bordered
            dataSource={this.state.completedTodos}
            renderItem={completedTodo => (
              <List.Item>
                {completedTodo.content}
                <Icon
                  onClick={evt => this.deleteTodoComplete(completedTodo.id)}
                  className="App-todo-minus"
                  type="delete"
                />
              </List.Item>
            )}
          />
        </Content>
        <Footer className="App-footer">&copy; My Company</Footer>
      </Layout>
    );
  }
}

export default App;
