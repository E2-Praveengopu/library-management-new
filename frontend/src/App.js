import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import BookCatalog from './components/BookCatalog';
import ProtectedRoute from './components/ProtectedRoute';

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/login" component={Login} />
        <ProtectedRoute exact path="/" component={BookCatalog} role="admin" />
        <Redirect to="/signup" />
      </Switch>
    );
  }
}

export default App;
