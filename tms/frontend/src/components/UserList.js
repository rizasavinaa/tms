import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebarit from "./sidebarit";
import Footer from "./footer";
import Jsfunction from "./jsfunction";

const UserList = () => {
  const [users, setUser] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`, { withCredentials: true });
    setUser(response.data);
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/users/${id}`);
      getUsers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
      <React.Fragment>
        <Sidebarit/>
        {/*begin::App Main*/}
        <main className="app-main">
          {/*begin::App Content Header*/}
          <div className="app-content-header">
            {/*begin::Container*/}
            <div className="container-fluid">
              {/*begin::Row*/}
              <div className="row">
                <div className="col-sm-6"><h3 className="mb-0">Dashboard</h3></div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                    <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
                  </ol>
                </div>
              </div>
              {/*end::Row*/}
            </div>
            {/*end::Container*/}
          </div>
          {/*end::App Content Header*/}
          {/*begin::App Content*/}
          <div className="app-content">
            {/*begin::Container*/}
            <div className="container-fluid">
              {/*begin::Row*/}
              <div className="row">
                <div className="col-sm-12">
                <Link to={`add`} className="button is-success">
                  Add New
                </Link>
                <table className="table is-striped is-fullwidth">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.fullname}</td>
                        <td>{user.email}</td>
                        <td>
                          <Link
                            to={`edit/${user.id}`}
                            className="button is-small is-info mr-2"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="button is-small is-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
              {/*end::Row*/}
              {/*begin::Row*/}
            </div>
            {/*end::Container*/}
          </div>
          {/*end::App Content*/}
        </main>
        {/*end::App Main*/}
        <Jsfunction/>
        <Footer/>
      </React.Fragment>
  );
};

export default UserList;
