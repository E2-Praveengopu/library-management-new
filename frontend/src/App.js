import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import MemberDashboard from './components/member/MemberDashboard';
import BookCatalog from './components/admin/BookCatalog';
import BookDiscovery from './components/member/BookDiscovery';
import LoanManagement from './components/admin/LoanManagement';
import MyLoans from './components/member/MyLoans';
import MemberManagement from './components/admin/MemberManagement';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

class App extends Component {
  render() {
    return (
      <>
        <Navbar />
        <Switch>
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/login" component={Login} />

        
          <ProtectedRoute exact path="/dashboard"  component={AdminDashboard}    role="admin" />
          <ProtectedRoute exact path="/"           component={BookCatalog}        role="admin" />
          <ProtectedRoute exact path="/loans"      component={LoanManagement}     role="admin" />
          <ProtectedRoute exact path="/members"    component={MemberManagement}   role="admin" />

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
