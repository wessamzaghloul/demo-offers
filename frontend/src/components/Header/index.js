import React from "react";
import "./index.scss";
 
const Header = ({logo}) => {
    return (
         <header className="header page-header">
            <a href="#" className="header-logo">
                <img src={logo} alt="Logo" />
            </a>
        </header>
    );
}
 
export default Header;