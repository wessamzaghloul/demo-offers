import React from "react";

const OffersListItem = ({ hasAction, id, scheduleMatches, company, name, price, handleClick }) => {
    return (
        <li className="offer-item">
            <div className="details">
                {hasAction ? (
                    <div className="offer-item__status">
                        <span className={`status  ${scheduleMatches ? "status__success" : "status__alert"}`}/>
                    </div>
                ) : (
                    ""
                )}
                <div>
                    <h5 className="offer-item__company"> {company}</h5>
                    <p className="offer-item__name">{name}</p>
                </div>
            </div>
            <div className="details details__has-action">
                <span className="offer-item__price">{price} &euro;</span>
                {hasAction ? (
                    <button className="btn btn-primary offer-item__action" onClick={() => handleClick(id)}>
                        Accept
                    </button>
                ) : (
                    ""
                )}
            </div>
        </li>
    );
};

export default OffersListItem;
