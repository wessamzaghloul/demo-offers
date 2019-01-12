import React from "react";
import ReactDOM from "react-dom";
import 'babel-polyfill';
import logo from "./images/logo.svg";
import Header from "./components/Header";
import Offers from "./containers/Offers"
import "./index.scss";

const App = () => (
    <div className="page">
        <Header logo={logo} />
        <main className="page-content">
            <Offers/>
        </main>
    </div>
);
ReactDOM.render(<App />, document.getElementById("app"));
