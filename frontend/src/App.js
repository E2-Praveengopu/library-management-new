import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import BookCatalog from './components/BookCatalog';
import BookDiscovery from './components/BookDiscovery';
import LoanManagement from './components/LoanManagement';
import MyLoans from './components/MyLoans';
import MemberManagement from './components/MemberManagement';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

class App extends Component {
  render() {
    return (
      <>
        <Navbar />
        <Switch>
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/login" component={Login} />

          {/* Admin routes */}
          <ProtectedRoute exact path="/dashboard"  component={AdminDashboard}    role="admin" />
          <ProtectedRoute exact path="/"           component={BookCatalog}        role="admin" />
          <ProtectedRoute exact path="/loans"      component={LoanManagement}     role="admin" />
          <ProtectedRoute exact path="/members"    component={MemberManagement}   role="admin" />

          {/* Member routes */}
          <ProtectedRoute exact path="/member-dashboard" component={MemberDashboard} role="member" />
          <ProtectedRoute exact path="/discover"         component={BookDiscovery}   role="member" />
          <ProtectedRoute exact path="/my-loans"         component={MyLoans}         role="member" />

          <Redirect to="/login" />
        </Switch>
      </>
    );
  }
}

export default App;
